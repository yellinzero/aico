import { Command } from 'commander';
import prompts from 'prompts';
import { z } from 'zod';
import {
  getConfig,
  updateEmployees,
  updateSkill,
  addSharedSkillReference,
  isSharedSkillInstalled,
} from '../utils/config.js';
import { logger, spinner } from '../utils/logger.js';
import {
  handleError,
  notInitializedError,
  platformNotSupportedError,
} from '../utils/errors.js';
import { platformSchema, type Platform } from '../schema/config.js';
import {
  fetchEmployee,
  fetchSkill,
  fetchRegistryIndex,
} from '../registry/client.js';
import {
  checkConflicts,
  confirmOverwrite,
  installEmployee,
  uninstallEmployee,
} from '../installer/index.js';
import { installSkill } from '../installer/skill-installer.js';
import { parseTarget, type ParsedTarget } from '../utils/parse-target.js';
import {
  DependencyResolver,
  formatDependencyTree,
} from '../registry/resolver.js';
import type { MCPDependency } from '../schema/skill.js';
import { parseSkillFrontmatter } from '../schema/skill.js';
import {
  checkConstraintDocs,
  showConstraintDocHints,
} from '../utils/constraint-docs.js';

// Collect MCP dependencies during installation
const collectedMCPDeps: Map<string, MCPDependency> = new Map();

// Collect constraint doc info for each employee
const constraintDocInfo: Map<
  string,
  { existing: string[]; missing: string[] }
> = new Map();

const addOptionsSchema = z.object({
  items: z.array(z.string()),
  cwd: z.string(),
  platforms: z.array(platformSchema).optional(),
  overwrite: z.boolean(),
  yes: z.boolean(),
  noDeps: z.boolean(),
});

type AddOptions = z.infer<typeof addOptionsSchema>;

/**
 * Interactive employee selection when no arguments provided
 */
async function selectEmployeesInteractively(cwd: string): Promise<string[]> {
  const config = await getConfig(cwd);
  if (!config) {
    throw notInitializedError();
  }

  const s = spinner('Fetching available employees...').start();

  try {
    const index = await fetchRegistryIndex(config, cwd);
    s.stop();

    if (index.employees.length === 0) {
      logger.warn('No employees available in registry.');
      return [];
    }

    // Build choices with installed status
    const installedNames = new Set(Object.keys(config.employees));
    const choices = index.employees.map((emp) => ({
      title: installedNames.has(emp.name)
        ? `${emp.name} (${emp.role}) [installed]`
        : `${emp.name} (${emp.role})`,
      value: emp.name,
      description: emp.description,
      disabled: false,
    }));

    logger.break();
    logger.info('Available employees:');
    logger.break();

    const { selected } = await prompts({
      type: 'multiselect',
      name: 'selected',
      message: 'Select employees to add',
      choices,
      hint: '- Space to select, Enter to confirm',
      instructions: false,
    });

    return selected ?? [];
  } catch (error) {
    s.fail('Failed to fetch employee list');
    throw error;
  }
}

async function runAdd(options: AddOptions): Promise<void> {
  const { items, cwd, overwrite, yes } = options;

  // Load config
  const config = await getConfig(cwd);
  if (!config) {
    throw notInitializedError();
  }

  // Determine target platforms
  let platforms: Platform[];
  if (options.platforms && options.platforms.length > 0) {
    platforms = options.platforms;
  } else {
    platforms = [config.defaultPlatform];
  }

  // Validate platforms
  for (const platform of platforms) {
    if (!config.platforms[platform]) {
      throw platformNotSupportedError(platform);
    }
  }

  // Parse all items to determine type
  const targets = items.map((item) => parseTarget(item));
  const employees = targets.filter((t) => t.type === 'employee');
  const skills = targets.filter((t) => t.type === 'skill');

  // Process employees
  for (const target of employees) {
    await addEmployee(target, config, cwd, platforms, overwrite, yes);
  }

  // Process standalone skills (with dependency resolution)
  if (skills.length > 0) {
    await addSkillsWithDeps(
      skills,
      config,
      cwd,
      platforms,
      overwrite,
      options.yes,
      options.noDeps
    );
  }

  logger.break();
  logger.success('Installation complete!');
  logger.dim(`Installed to: ${platforms.join(', ')}`);

  // Show MCP dependency hints if any
  showMCPDependencyHints();

  // Show constraint document hints for each employee
  showConstraintDocumentHints();
}

/**
 * Add a single employee
 */
async function addEmployee(
  target: ParsedTarget,
  config: Awaited<ReturnType<typeof getConfig>>,
  cwd: string,
  platforms: Platform[],
  overwrite: boolean,
  yes: boolean
): Promise<void> {
  if (!config) return;

  const s = spinner(`Adding ${target.name}...`).start();

  try {
    // Fetch employee from registry
    const employee = await fetchEmployee(target.fullName, config, cwd);
    s.text = `Installing ${employee.name} (${employee.role})...`;

    // Check for conflicts
    const conflicts = await checkConflicts(employee, config, cwd, platforms);
    let shouldOverwrite = overwrite;

    if (conflicts.length > 0 && !overwrite) {
      s.stop();

      if (!yes) {
        logger.warn(`Found ${conflicts.length} existing file(s):`);
        for (const conflict of conflicts.slice(0, 5)) {
          logger.dim(`  - ${conflict.path}`);
        }
        if (conflicts.length > 5) {
          logger.dim(`  ... and ${conflicts.length - 5} more`);
        }

        const confirmed = await confirmOverwrite(conflicts);
        if (!confirmed) {
          logger.info(`Skipped ${target.name}`);
          return;
        }
        // User confirmed overwrite
        shouldOverwrite = true;
      }

      s.start();
    }

    // If overwriting/updating, uninstall old version first to clean up removed skills/commands
    const isUpdate = config.employees[employee.name] !== undefined;
    if (shouldOverwrite && isUpdate) {
      await uninstallEmployee(employee.name, config, cwd, platforms);
    }

    // Install employee
    await installEmployee(employee, config, cwd, platforms, {
      overwrite: shouldOverwrite,
    });

    // Install shared skill dependencies
    const installedSharedSkills: string[] = [];
    if (employee.dependencies && employee.dependencies.length > 0) {
      s.text = `Installing shared skills for ${employee.name}...`;

      for (const depFullName of employee.dependencies) {
        // Check if already installed
        const alreadyInstalled = await isSharedSkillInstalled(cwd, depFullName);

        if (!alreadyInstalled) {
          // Fetch and install the shared skill
          try {
            const sharedSkill = await fetchSkill(depFullName, config, cwd);

            for (const platform of platforms) {
              await installSkill(sharedSkill, config, cwd, {
                platform,
                overwrite: shouldOverwrite,
              });
            }

            installedSharedSkills.push(depFullName);
          } catch (err) {
            s.warn(`Failed to install shared skill ${depFullName}`);
            logger.dim(
              `  Error: ${err instanceof Error ? err.message : String(err)}`
            );
            continue;
          }
        }

        // Update reference tracking (always, even if already installed)
        await addSharedSkillReference(
          cwd,
          depFullName,
          employee.name,
          '1.0.0' // TODO: get version from skill
        );
      }
    }

    // Update config with skills and commands list
    const skillNames = employee.skills.map((sk) => sk.name);
    const commandNames = employee.commands.map((c) => c.name);
    await updateEmployees(cwd, employee.name, skillNames, commandNames);

    s.succeed(`Added ${employee.name} (${employee.role})`);

    // Show installed skills
    logger.dim(`  Skills: ${employee.skills.map((sk) => sk.name).join(', ')}`);
    if (employee.commands.length > 0) {
      logger.dim(
        `  Commands: ${employee.commands.map((c) => `/${employee.name}.${c.name}`).join(', ')}`
      );
    }

    // Show installed shared skills
    if (installedSharedSkills.length > 0) {
      logger.dim(
        `  Shared skills: ${installedSharedSkills.map((s) => s.split('/').pop()).join(', ')}`
      );
    } else if (employee.dependencies && employee.dependencies.length > 0) {
      // All dependencies were already installed
      logger.dim(
        `  Shared skills: ${employee.dependencies.map((s) => s.split('/').pop()).join(', ')} (already installed)`
      );
    }

    // Collect MCP dependencies from employee skills
    for (const skill of employee.skills) {
      const skillFile = skill.files.find((f) => f.path.endsWith('SKILL.md'));
      if (skillFile) {
        const frontmatter = parseSkillFrontmatter(skillFile.content);
        if (frontmatter?.mcpDependencies) {
          for (const dep of frontmatter.mcpDependencies) {
            collectedMCPDeps.set(dep.name, dep);
          }
        }
      }
    }

    // Check constraint documents for this employee
    const constraintInfo = await checkConstraintDocs(employee.name, cwd);
    constraintDocInfo.set(employee.name, constraintInfo);
  } catch (error) {
    s.fail(`Failed to add ${target.name}`);
    throw error;
  }
}

/**
 * Add skills with dependency resolution
 */
async function addSkillsWithDeps(
  targets: ParsedTarget[],
  config: Awaited<ReturnType<typeof getConfig>>,
  cwd: string,
  platforms: Platform[],
  overwrite: boolean,
  yes: boolean,
  noDeps: boolean
): Promise<void> {
  if (!config) return;

  const skillNames = targets.map((t) => t.fullName);

  if (noDeps) {
    // Skip dependency resolution - install directly
    logger.warn('Skipping dependencies. Some skills may not work correctly.');
    for (const target of targets) {
      await addSingleSkill(target.fullName, config, cwd, platforms, overwrite);
    }
    return;
  }

  // Resolve dependencies
  const s = spinner('Resolving dependencies...').start();

  try {
    const resolver = new DependencyResolver((name) =>
      fetchSkill(name, config, cwd)
    );

    const { skills, tree } = await resolver.resolve(skillNames);
    s.stop();

    // Show dependency tree
    logger.break();
    logger.log(formatDependencyTree(tree.dependencies[0]!));
    logger.break();

    // Confirm installation
    const depCount = skills.length - skillNames.length;
    if (depCount > 0 && !yes) {
      const { confirmed } = await prompts({
        type: 'confirm',
        name: 'confirmed',
        message: `Install ${skills.length} skill(s) (${depCount} dependencies)?`,
        initial: true,
      });

      if (!confirmed) {
        logger.info('Cancelled.');
        return;
      }
    }

    // Install all skills in dependency order
    for (const skill of skills) {
      await addSingleSkill(
        skill.fullName,
        config,
        cwd,
        platforms,
        overwrite,
        skill
      );
    }
  } catch (error) {
    s.fail('Failed to resolve dependencies');
    throw error;
  }
}

/**
 * Add a single skill (no dependency resolution)
 */
async function addSingleSkill(
  fullName: string,
  config: Awaited<ReturnType<typeof getConfig>>,
  cwd: string,
  platforms: Platform[],
  overwrite: boolean,
  prefetchedSkill?: Awaited<ReturnType<typeof fetchSkill>>
): Promise<void> {
  if (!config) return;

  const s = spinner(`Adding skill ${fullName}...`).start();

  try {
    // Use prefetched skill or fetch from registry
    const skill = prefetchedSkill ?? (await fetchSkill(fullName, config, cwd));
    s.text = `Installing ${skill.name}...`;

    // Install skill to each platform
    for (const platform of platforms) {
      const result = await installSkill(skill, config, cwd, {
        platform,
        overwrite,
      });

      if (result.skipped && !overwrite) {
        s.warn(
          `Skill ${skill.name} already exists (use --overwrite to replace)`
        );
        return;
      }
    }

    // Update config
    await updateSkill(cwd, fullName, skill.version, 'standalone');

    s.succeed(`Added skill ${skill.fullName}`);
    logger.dim(`  Version: ${skill.version}`);
    logger.dim(`  Category: ${skill.category}`);

    // Collect MCP dependencies
    if (skill.mcpDependencies) {
      for (const dep of skill.mcpDependencies) {
        collectedMCPDeps.set(dep.name, dep);
      }
    }
  } catch (error) {
    s.fail(`Failed to add skill ${fullName}`);
    throw error;
  }
}

/**
 * Show MCP dependency hints after installation
 */
function showMCPDependencyHints(): void {
  if (collectedMCPDeps.size === 0) {
    return;
  }

  logger.break();
  logger.warn(`Some skills require MCP servers to be configured:`);
  logger.break();

  for (const [name, dep] of collectedMCPDeps) {
    logger.info(`  ${name}`);
    logger.dim(`    ${dep.description}`);
    logger.dim(`    Package: ${dep.package}`);
    logger.dim(`    Docs: ${dep.docsUrl}`);
    logger.break();
  }

  logger.info(
    'To configure MCP servers, add them to your claude_desktop_config.json'
  );
  logger.dim('See: https://docs.claude.ai/mcp');

  // Clear collected deps for next run
  collectedMCPDeps.clear();
}

/**
 * Show constraint document hints after installation
 */
function showConstraintDocumentHints(): void {
  if (constraintDocInfo.size === 0) {
    return;
  }

  for (const [employeeName, info] of constraintDocInfo) {
    showConstraintDocHints(employeeName, info.existing, info.missing);
  }

  // Clear for next run
  constraintDocInfo.clear();
}

export const add = new Command()
  .name('add')
  .description('Add employees or skills to your project')
  .argument(
    '[items...]',
    'Employee or skill names (e.g., pm, @the-aico/pm/brainstorming)'
  )
  .option(
    '-p, --platform <platform>',
    'Target platform (can be used multiple times)',
    (value, previous: Platform[]) => {
      const result = platformSchema.safeParse(value);
      if (!result.success) {
        throw new Error(
          `Invalid platform: ${value}. Available: claude-code, codex`
        );
      }
      return [...previous, result.data];
    },
    [] as Platform[]
  )
  .option('-o, --overwrite', 'Overwrite existing files', false)
  .option('-y, --yes', 'Skip confirmation prompts', false)
  .option('--no-deps', 'Skip dependency installation', false)
  .option('-c, --cwd <cwd>', 'Working directory', process.cwd())
  .action(async (items: string[], opts) => {
    try {
      let selectedItems = items;

      // If no items provided, show interactive selection
      if (items.length === 0) {
        selectedItems = await selectEmployeesInteractively(opts.cwd);
        if (selectedItems.length === 0) {
          logger.info('No employees selected.');
          return;
        }
      }

      const options = addOptionsSchema.parse({
        items: selectedItems,
        cwd: opts.cwd,
        platforms: opts.platform.length > 0 ? opts.platform : undefined,
        overwrite: opts.overwrite,
        yes: opts.yes,
        noDeps: opts.noDeps ?? false,
      });

      await runAdd(options);
    } catch (error) {
      handleError(error);
    }
  });

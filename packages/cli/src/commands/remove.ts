import { Command } from 'commander';
import prompts from 'prompts';
import { z } from 'zod';
import {
  getConfig,
  removeEmployee as removeEmployeeFromConfig,
  removeSkill as removeSkillFromConfig,
  removeSharedSkillReference,
} from '../utils/config.js';
import { logger, spinner } from '../utils/logger.js';
import { handleError, notInitializedError } from '../utils/errors.js';
import { platformSchema, type Platform } from '../schema/config.js';
import { uninstallEmployee } from '../installer/index.js';
import { uninstallSkill } from '../installer/skill-installer.js';
import { parseTarget, type ParsedTarget } from '../utils/parse-target.js';
import { fetchEmployee } from '../registry/client.js';

const removeOptionsSchema = z.object({
  items: z.array(z.string()),
  cwd: z.string(),
  platforms: z.array(platformSchema).optional(),
  yes: z.boolean(),
  force: z.boolean(),
  dryRun: z.boolean(),
});

type RemoveOptions = z.infer<typeof removeOptionsSchema>;

async function runRemove(options: RemoveOptions): Promise<void> {
  const { items, cwd, yes, force, dryRun } = options;

  // Load config
  const config = await getConfig(cwd);
  if (!config) {
    throw notInitializedError();
  }

  // Parse all items to determine type
  const targets = items.map((item) => parseTarget(item));
  const employees = targets.filter((t) => t.type === 'employee');
  const skills = targets.filter((t) => t.type === 'skill');

  // Process employees
  for (const target of employees) {
    await removeEmployeeItem(
      target,
      config,
      cwd,
      options.platforms,
      yes,
      dryRun
    );
  }

  // Process skills
  for (const target of skills) {
    await removeSkillItem(
      target,
      config,
      cwd,
      options.platforms,
      yes,
      force,
      dryRun
    );
  }

  logger.break();
  if (dryRun) {
    logger.info('Dry run complete. No files were removed.');
  } else {
    logger.success('Removal complete!');
  }
}

/**
 * Remove a single employee
 */
async function removeEmployeeItem(
  target: ParsedTarget,
  config: Awaited<ReturnType<typeof getConfig>>,
  cwd: string,
  platformsOpt: Platform[] | undefined,
  yes: boolean,
  dryRun: boolean
): Promise<void> {
  if (!config) return;

  const employeeName = target.name;
  const installedState = config.employees[employeeName];

  // Determine target platforms
  let platforms: Platform[];
  if (platformsOpt && platformsOpt.length > 0) {
    // User specified platforms
    platforms = platformsOpt;
  } else {
    // Remove from all configured platforms
    platforms = Object.keys(config.platforms) as Platform[];
  }

  if (!installedState) {
    logger.dim(
      `Employee '${employeeName}' not in config, will attempt to remove files from: ${platforms.join(', ')}`
    );
  }

  // Confirm removal
  if (!yes && !dryRun) {
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: `Remove ${employeeName} from ${platforms.join(', ')}?`,
      initial: true,
    });

    if (!proceed) {
      logger.info(`Skipped ${employeeName}`);
      return;
    }
  }

  if (dryRun) {
    logger.info(`Would remove employee: ${employeeName}`);
    logger.dim(`  Platforms: ${platforms.join(', ')}`);
    return;
  }

  const s = spinner(`Removing ${employeeName}...`).start();

  try {
    await uninstallEmployee(employeeName, config, cwd, platforms);

    // Handle shared skill references
    // Try to get employee definition to know its dependencies
    let employeeDeps: string[] = [];
    try {
      const employee = await fetchEmployee(target.fullName, config, cwd);
      employeeDeps = employee.dependencies || [];
    } catch {
      // If we can't fetch employee, check config for shared skills referencing this employee
      if (config.sharedSkills) {
        for (const [skillName, state] of Object.entries(config.sharedSkills)) {
          if (state.usedBy.includes(employeeName)) {
            employeeDeps.push(skillName);
          }
        }
      }
    }

    // Process shared skill references
    const removedSharedSkills: string[] = [];
    const keptSharedSkills: { name: string; users: string[] }[] = [];

    for (const depFullName of employeeDeps) {
      const { shouldUninstall, remainingUsers } =
        await removeSharedSkillReference(cwd, depFullName, employeeName);

      if (shouldUninstall) {
        // No more references, remove the shared skill files
        for (const platform of platforms) {
          await uninstallSkill(depFullName, config, cwd, { platform });
        }
        removedSharedSkills.push(depFullName);
      } else if (remainingUsers.length > 0) {
        keptSharedSkills.push({ name: depFullName, users: remainingUsers });
      }
    }

    if (installedState) {
      await removeEmployeeFromConfig(cwd, employeeName);
    }

    s.succeed(`Removed ${employeeName}`);
    logger.dim(`  Removed from: ${platforms.join(', ')}`);

    // Show shared skill status
    if (removedSharedSkills.length > 0) {
      logger.dim(
        `  Removed shared skills: ${removedSharedSkills.map((s) => s.split('/').pop()).join(', ')}`
      );
    }
    if (keptSharedSkills.length > 0) {
      for (const { name, users } of keptSharedSkills) {
        logger.dim(
          `  Kept shared skill '${name.split('/').pop()}' (still used by: ${users.join(', ')})`
        );
      }
    }
  } catch (error) {
    s.fail(`Failed to remove ${employeeName}`);
    throw error;
  }
}

/**
 * Remove a single skill
 */
async function removeSkillItem(
  target: ParsedTarget,
  config: Awaited<ReturnType<typeof getConfig>>,
  cwd: string,
  platformsOpt: Platform[] | undefined,
  yes: boolean,
  force: boolean,
  dryRun: boolean
): Promise<void> {
  if (!config) return;

  const skillFullName = target.fullName;
  const installedState = config.skills?.[skillFullName];

  // Check if skill is part of an employee
  let parentEmployee: string | null = null;
  for (const [empName, empState] of Object.entries(config.employees)) {
    if (empState.skills?.includes(target.name)) {
      parentEmployee = empName;
      break;
    }
  }

  if (parentEmployee && !force) {
    logger.warn(
      `Skill '${skillFullName}' is part of employee '${parentEmployee}'.`
    );
    logger.dim(
      'Use --force to remove it anyway, or remove the entire employee.'
    );
    return;
  }

  // Determine target platforms
  let platforms: Platform[];
  if (platformsOpt && platformsOpt.length > 0) {
    // User specified platforms
    platforms = platformsOpt;
  } else {
    // Remove from all configured platforms
    platforms = Object.keys(config.platforms) as Platform[];
  }

  // Confirm removal
  if (!yes && !dryRun) {
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: `Remove skill ${skillFullName} from ${platforms.join(', ')}?`,
      initial: true,
    });

    if (!proceed) {
      logger.info(`Skipped ${skillFullName}`);
      return;
    }
  }

  // Dry run - show what would be removed
  if (dryRun) {
    for (const platform of platforms) {
      const result = await uninstallSkill(skillFullName, config, cwd, {
        platform,
        dryRun: true,
      });
      logger.info(`Would remove skill: ${skillFullName}`);
      logger.dim(`  Platform: ${platform}`);
      logger.dim(`  Files: ${result.files.length}`);
      for (const file of result.files) {
        logger.dim(`    - ${file}`);
      }
    }
    return;
  }

  const s = spinner(`Removing skill ${skillFullName}...`).start();

  try {
    for (const platform of platforms) {
      const result = await uninstallSkill(skillFullName, config, cwd, {
        platform,
      });
      if (!result.removed) {
        logger.dim(`  Skill not found on ${platform}`);
      }
    }

    // Update config
    if (installedState) {
      await removeSkillFromConfig(cwd, skillFullName);
    }

    s.succeed(`Removed skill ${skillFullName}`);
    logger.dim(`  Removed from: ${platforms.join(', ')}`);
  } catch (error) {
    s.fail(`Failed to remove skill ${skillFullName}`);
    throw error;
  }
}

export const remove = new Command()
  .name('remove')
  .description('Remove employees or skills from your project')
  .argument('[items...]', 'Employee or skill names to remove')
  .option(
    '-p, --platform <platform>',
    'Remove from specific platform only',
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
  .option('-y, --yes', 'Skip confirmation prompts', false)
  .option('-f, --force', 'Force remove (ignore dependency warnings)', false)
  .option('--dry-run', 'Preview changes without removing', false)
  .option('-c, --cwd <cwd>', 'Working directory', process.cwd())
  .action(async (items: string[], opts) => {
    try {
      if (items.length === 0) {
        logger.error(
          'Please specify at least one employee or skill to remove.'
        );
        logger.dim('Examples:');
        logger.dim('  aico remove pm                     # Remove employee');
        logger.dim('  aico remove @the-aico/pm/brainstorming # Remove skill');
        process.exit(1);
      }

      const options = removeOptionsSchema.parse({
        items,
        cwd: opts.cwd,
        platforms: opts.platform.length > 0 ? opts.platform : undefined,
        yes: opts.yes,
        force: opts.force,
        dryRun: opts.dryRun,
      });

      await runRemove(options);
    } catch (error) {
      handleError(error);
    }
  });

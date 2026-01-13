import fs from 'fs-extra';
import path from 'path';
import { Command } from 'commander';
import { diffLines, type Change } from 'diff';
import { z } from 'zod';
import { getConfig, resolvePlatformPaths } from '../utils/config.js';
import { logger, spinner } from '../utils/logger.js';
import { handleError, notInitializedError } from '../utils/errors.js';
import type { Platform } from '../schema/config.js';
import type { Employee } from '../schema/employee.js';
import { fetchEmployee } from '../registry/client.js';
import {
  claudeCodeAdapter,
  type PlatformAdapter,
} from '../installer/platforms/claude-code.js';
import { codexAdapter } from '../installer/platforms/codex.js';

const adapters: Record<Platform, PlatformAdapter> = {
  'claude-code': claudeCodeAdapter,
  codex: codexAdapter,
};

const diffOptionsSchema = z.object({
  employee: z.string().optional(),
  cwd: z.string(),
});

type DiffOptions = z.infer<typeof diffOptionsSchema>;

interface FileChange {
  filePath: string;
  type: 'added' | 'removed' | 'modified';
  patch?: Change[];
}

interface EmployeeDiff {
  name: string;
  hasChanges: boolean;
  skillsAdded: string[];
  skillsRemoved: string[];
  commandsAdded: string[];
  commandsRemoved: string[];
  fileChanges: FileChange[];
}

/**
 * Compare local file with registry content
 * Returns patch showing what changes FROM local TO registry (what update would do)
 */
async function compareFile(
  localPath: string,
  registryContent: string
): Promise<Change[] | null> {
  if (!(await fs.pathExists(localPath))) {
    return null;
  }

  const localContent = await fs.readFile(localPath, 'utf-8');
  // Compare local (current) to registry (new) - shows what would change
  const patch = diffLines(localContent, registryContent);

  // Check if there are actual changes (more than just the content itself)
  const hasChanges = patch.some((part) => part.added || part.removed);
  return hasChanges ? patch : null;
}

/**
 * Get diff for a single employee
 */
async function diffEmployee(
  employeeName: string,
  cwd: string,
  config: Awaited<ReturnType<typeof getConfig>>
): Promise<EmployeeDiff | null> {
  if (!config) return null;

  const installedState = config.employees[employeeName];
  if (!installedState) {
    return null;
  }

  // Fetch latest from registry
  let registryEmployee: Employee;
  try {
    registryEmployee = await fetchEmployee(employeeName, config, cwd);
  } catch {
    return null;
  }

  const platform = installedState.platforms[0] || config.defaultPlatform;
  const adapter = adapters[platform];
  const { skillsDir, commandsDir } = resolvePlatformPaths(
    cwd,
    config,
    platform
  );

  const installedSkills = installedState.skills || [];
  const installedCommands = installedState.commands || [];
  const registrySkills = registryEmployee.skills.map((s) => s.name);
  const registryCommands = registryEmployee.commands.map((c) => c.name);

  // Find added/removed skills
  const skillsAdded = registrySkills.filter(
    (s) => !installedSkills.includes(s)
  );
  const skillsRemoved = installedSkills.filter(
    (s) => !registrySkills.includes(s)
  );

  // Find added/removed commands
  const commandsAdded = registryCommands.filter(
    (c) => !installedCommands.includes(c)
  );
  const commandsRemoved = installedCommands.filter(
    (c) => !registryCommands.includes(c)
  );

  const fileChanges: FileChange[] = [];

  // Check skill files for modifications
  for (const skill of registryEmployee.skills) {
    const skillDirName = adapter.getSkillDirName(employeeName, skill.name);

    for (const file of skill.files) {
      const localPath = path.join(
        skillsDir,
        skillDirName,
        path.basename(file.path)
      );

      // Update skill name in content for comparison
      let registryContent = file.content;
      if (file.path.endsWith('SKILL.md')) {
        registryContent = registryContent.replace(
          /^(---\n[\s\S]*?name:\s*).+$/m,
          `$1${skillDirName}`
        );
      }

      if (!(await fs.pathExists(localPath))) {
        if (!skillsAdded.includes(skill.name)) {
          fileChanges.push({
            filePath: localPath,
            type: 'added',
          });
        }
      } else {
        const patch = await compareFile(localPath, registryContent);
        if (patch) {
          fileChanges.push({
            filePath: localPath,
            type: 'modified',
            patch,
          });
        }
      }
    }
  }

  // Check command files for modifications
  for (const command of registryEmployee.commands) {
    const commandFileName = adapter.getCommandFileName(
      employeeName,
      command.name
    );

    for (const file of command.files) {
      const localPath = path.join(commandsDir, commandFileName);

      if (!(await fs.pathExists(localPath))) {
        if (!commandsAdded.includes(command.name)) {
          fileChanges.push({
            filePath: localPath,
            type: 'added',
          });
        }
      } else {
        const patch = await compareFile(localPath, file.content);
        if (patch) {
          fileChanges.push({
            filePath: localPath,
            type: 'modified',
            patch,
          });
        }
      }
    }
  }

  // Mark removed skill files
  for (const skillName of skillsRemoved) {
    const skillDirName = adapter.getSkillDirName(employeeName, skillName);
    const skillPath = path.join(skillsDir, skillDirName);
    if (await fs.pathExists(skillPath)) {
      fileChanges.push({
        filePath: skillPath,
        type: 'removed',
      });
    }
  }

  // Mark removed command files
  for (const commandName of commandsRemoved) {
    const commandFileName = adapter.getCommandFileName(
      employeeName,
      commandName
    );
    const commandPath = path.join(commandsDir, commandFileName);
    if (await fs.pathExists(commandPath)) {
      fileChanges.push({
        filePath: commandPath,
        type: 'removed',
      });
    }
  }

  const hasChanges =
    skillsAdded.length > 0 ||
    skillsRemoved.length > 0 ||
    commandsAdded.length > 0 ||
    commandsRemoved.length > 0 ||
    fileChanges.length > 0;

  return {
    name: employeeName,
    hasChanges,
    skillsAdded,
    skillsRemoved,
    commandsAdded,
    commandsRemoved,
    fileChanges,
  };
}

/**
 * Print colored diff output
 */
function printDiff(patch: Change[]): void {
  for (const part of patch) {
    if (part.added) {
      process.stdout.write(logger.formatSuccess(part.value));
    } else if (part.removed) {
      process.stdout.write(logger.formatError(part.value));
    } else {
      process.stdout.write(part.value);
    }
  }
}

async function runDiff(options: DiffOptions): Promise<void> {
  const { cwd, employee } = options;

  const config = await getConfig(cwd);
  if (!config) {
    throw notInitializedError();
  }

  const installedEmployees = Object.keys(config.employees);
  if (installedEmployees.length === 0) {
    logger.info('No employees installed.');
    return;
  }

  // If specific employee specified, show detailed diff
  if (employee) {
    if (!config.employees[employee]) {
      logger.error(`Employee '${employee}' is not installed.`);
      logger.dim(`Installed employees: ${installedEmployees.join(', ')}`);
      process.exit(1);
    }

    const s = spinner(`Checking ${employee} for updates...`).start();
    const diff = await diffEmployee(employee, cwd, config);
    s.stop();

    if (!diff) {
      logger.error(`Failed to check updates for ${employee}`);
      return;
    }

    if (!diff.hasChanges) {
      logger.success(`${employee} is up to date.`);
      return;
    }

    logger.info(`Changes for ${employee}:`);
    logger.break();

    // Show skill changes
    if (diff.skillsAdded.length > 0) {
      logger.success(`  New skills: ${diff.skillsAdded.join(', ')}`);
    }
    if (diff.skillsRemoved.length > 0) {
      logger.warn(`  Removed skills: ${diff.skillsRemoved.join(', ')}`);
    }

    // Show command changes
    if (diff.commandsAdded.length > 0) {
      logger.success(`  New commands: ${diff.commandsAdded.join(', ')}`);
    }
    if (diff.commandsRemoved.length > 0) {
      logger.warn(`  Removed commands: ${diff.commandsRemoved.join(', ')}`);
    }

    // Show file changes
    for (const change of diff.fileChanges) {
      const relativePath = path.relative(cwd, change.filePath);

      if (change.type === 'modified') {
        logger.info(`  Modified: ${relativePath}`);
        if (change.patch) {
          logger.break();
          printDiff(change.patch);
          logger.break();
        }
      }
    }

    logger.break();
    logger.dim(`Run 'aico add ${employee} --overwrite' to update.`);
    return;
  }

  // Show summary for all installed employees
  const s = spinner('Checking for updates...').start();

  const employeesWithUpdates: EmployeeDiff[] = [];

  for (const employeeName of installedEmployees) {
    const diff = await diffEmployee(employeeName, cwd, config);
    if (diff?.hasChanges) {
      employeesWithUpdates.push(diff);
    }
  }

  s.stop();

  if (employeesWithUpdates.length === 0) {
    logger.success('All employees are up to date.');
    return;
  }

  logger.info('The following employees have updates available:');
  logger.break();

  for (const diff of employeesWithUpdates) {
    logger.log(`  ${diff.name}`);
    if (diff.skillsAdded.length > 0) {
      logger.dim(`    + ${diff.skillsAdded.length} new skill(s)`);
    }
    if (diff.skillsRemoved.length > 0) {
      logger.dim(`    - ${diff.skillsRemoved.length} removed skill(s)`);
    }
    if (diff.commandsAdded.length > 0) {
      logger.dim(`    + ${diff.commandsAdded.length} new command(s)`);
    }
    if (diff.commandsRemoved.length > 0) {
      logger.dim(`    - ${diff.commandsRemoved.length} removed command(s)`);
    }
    const modifiedCount = diff.fileChanges.filter(
      (f) => f.type === 'modified'
    ).length;
    if (modifiedCount > 0) {
      logger.dim(`    ~ ${modifiedCount} modified file(s)`);
    }
  }

  logger.break();
  logger.dim(`Run 'aico diff <employee>' to see detailed changes.`);
  logger.dim(`Run 'aico add <employee> --overwrite' to update.`);
}

export const diff = new Command()
  .name('diff')
  .description('Check for updates against the registry')
  .argument('[employee]', 'Employee name to check')
  .option('-c, --cwd <cwd>', 'Working directory', process.cwd())
  .action(async (employee: string | undefined, opts) => {
    try {
      const options = diffOptionsSchema.parse({
        employee,
        cwd: opts.cwd,
      });

      await runDiff(options);
    } catch (error) {
      handleError(error);
    }
  });

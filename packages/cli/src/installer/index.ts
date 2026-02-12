import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import type { Config, Platform } from '../schema/config.js';
import type { Employee } from '../schema/employee.js';
import { resolvePlatformPaths } from '../utils/config.js';
import {
  claudeCodeAdapter,
  type PlatformAdapter,
} from './platforms/claude-code.js';
import { codexAdapter } from './platforms/codex.js';

/**
 * Platform adapter mapping
 *
 * Both Claude Code and Codex support skills and commands:
 *
 * Skills (same format):
 * - Claude Code: .claude/skills/{skill}/SKILL.md
 * - Codex: .codex/skills/{skill}/SKILL.md
 *
 * Commands (different mechanisms):
 * - Claude Code: .claude/commands/{employee}.{command}.md → /employee.command
 * - Codex: .codex/prompts/aico.{employee}.{command}.md → /prompts:aico.employee.command
 */
const adapters: Record<Platform, PlatformAdapter> = {
  'claude-code': claudeCodeAdapter,
  codex: codexAdapter,
};

export interface InstallOptions {
  overwrite: boolean;
  silent?: boolean;
}

import type { FileType } from '../schema/employee.js';

export interface ConflictInfo {
  path: string;
  type: FileType;
}

export interface InstallResult {
  platform: Platform;
  skillsInstalled: number;
  commandsInstalled: number;
}

/**
 * Check for file conflicts before installation
 */
export async function checkConflicts(
  employee: Employee,
  config: Config,
  cwd: string,
  platforms: Platform[]
): Promise<ConflictInfo[]> {
  const conflicts: ConflictInfo[] = [];

  for (const platform of platforms) {
    const adapter = adapters[platform];
    const { skillsDir, commandsDir } = resolvePlatformPaths(
      cwd,
      config,
      platform
    );

    // Check skills
    for (const skill of employee.skills) {
      const skillDirName = adapter.getSkillDirName(employee.name, skill.name);
      const skillPath = path.join(skillsDir, skillDirName);
      if (await fs.pathExists(skillPath)) {
        conflicts.push({ path: skillPath, type: 'skill' });
      }
    }

    // Check commands
    for (const command of employee.commands) {
      const commandFileName = adapter.getCommandFileName(
        employee.name,
        command.name
      );
      const commandPath = path.join(commandsDir, commandFileName);
      if (await fs.pathExists(commandPath)) {
        conflicts.push({ path: commandPath, type: 'command' });
      }
    }
  }

  return conflicts;
}

/**
 * Confirm overwrite with user
 */
export async function confirmOverwrite(
  conflicts: ConflictInfo[]
): Promise<boolean> {
  const { proceed } = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: `${conflicts.length} file(s) will be overwritten. Continue?`,
    initial: false,
  });

  return proceed;
}

/**
 * Install employee to specified platforms
 */
export async function installEmployee(
  employee: Employee,
  config: Config,
  cwd: string,
  platforms: Platform[],
  options: InstallOptions
): Promise<InstallResult[]> {
  const results: InstallResult[] = [];

  for (const platform of platforms) {
    const result = await installEmployeeToPlatform(
      employee,
      config,
      cwd,
      platform,
      options
    );
    results.push(result);
  }

  return results;
}

/**
 * Install employee to a single platform
 */
async function installEmployeeToPlatform(
  employee: Employee,
  config: Config,
  cwd: string,
  platform: Platform,
  _options: InstallOptions
): Promise<InstallResult> {
  const adapter = adapters[platform];
  const { skillsDir, commandsDir } = resolvePlatformPaths(
    cwd,
    config,
    platform
  );

  // Ensure directories exist
  await fs.ensureDir(skillsDir);
  await fs.ensureDir(commandsDir);

  let skillsInstalled = 0;
  let commandsInstalled = 0;

  // Install skills
  for (const skill of employee.skills) {
    const skillDirName = adapter.getSkillDirName(employee.name, skill.name);
    const skillDir = path.join(skillsDir, skillDirName);

    // Create skill directory
    await fs.ensureDir(skillDir);

    // Write skill files
    for (const file of skill.files) {
      // Extract relative path (remove "skills/{skillName}/" prefix from employee.json)
      // e.g., "skills/init/references/design-system.template.md" -> "references/design-system.template.md"
      const skillPrefix = `skills/${skill.name}/`;
      const relativePath = file.path.startsWith(skillPrefix)
        ? file.path.substring(skillPrefix.length)
        : path.basename(file.path);

      const filePath = path.join(skillDir, relativePath);

      // Ensure parent directory exists (for files in subdirectories like references/)
      await fs.ensureDir(path.dirname(filePath));

      // Update frontmatter name to match directory name
      let content = file.content;
      if (relativePath.endsWith('SKILL.md')) {
        content = updateSkillName(content, skillDirName);
      }

      await fs.writeFile(filePath, content, 'utf-8');

      // Make scripts executable
      if (file.type === 'script') {
        await fs.chmod(filePath, 0o755);
      }
    }
    skillsInstalled++;
  }

  // Install commands
  // Claude Code: .claude/commands/{employee}.{command}.md
  // Codex: .codex/prompts/aico.{employee}.{command}.md
  for (const command of employee.commands) {
    const commandFileName = adapter.getCommandFileName(
      employee.name,
      command.name
    );

    for (const file of command.files) {
      const filePath = path.join(commandsDir, commandFileName);
      await fs.writeFile(filePath, file.content, 'utf-8');
    }
    commandsInstalled++;
  }

  return {
    platform,
    skillsInstalled,
    commandsInstalled,
  };
}

/**
 * Update skill name in SKILL.md frontmatter
 */
function updateSkillName(content: string, newName: string): string {
  return content.replace(/^(---\n[\s\S]*?name:\s*).+$/m, `$1${newName}`);
}

/**
 * Remove employee from specified platforms
 */
export async function uninstallEmployee(
  employeeName: string,
  config: Config,
  cwd: string,
  platforms: Platform[]
): Promise<void> {
  for (const platform of platforms) {
    const { skillsDir, commandsDir } = resolvePlatformPaths(
      cwd,
      config,
      platform
    );

    // Find and remove skill directories matching aico-{employee}-*
    const skillPrefix = `aico-${employeeName}-`;
    if (await fs.pathExists(skillsDir)) {
      const entries = await fs.readdir(skillsDir);
      for (const entry of entries) {
        if (entry.startsWith(skillPrefix)) {
          await fs.remove(path.join(skillsDir, entry));
        }
      }
    }

    // Find and remove command files
    // Claude Code: {employee}.*.md
    // Codex: aico.{employee}.*.md
    if (await fs.pathExists(commandsDir)) {
      const entries = await fs.readdir(commandsDir);
      const commandPrefix =
        platform === 'codex' ? `aico.${employeeName}.` : `${employeeName}.`;

      for (const entry of entries) {
        if (entry.startsWith(commandPrefix) && entry.endsWith('.md')) {
          await fs.remove(path.join(commandsDir, entry));
        }
      }
    }
  }
}

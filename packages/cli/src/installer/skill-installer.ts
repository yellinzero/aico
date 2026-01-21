import fs from 'fs-extra';
import path from 'path';
import type { Config, Platform } from '../schema/config.js';
import type { Skill } from '../schema/skill.js';
import { resolvePlatformPaths } from '../utils/config.js';

export interface InstallSkillOptions {
  platform: Platform;
  overwrite?: boolean;
}

export interface InstallSkillResult {
  skill: Skill;
  installed: boolean;
  skipped: boolean;
  reason?: string;
  path?: string;
}

export interface UninstallSkillOptions {
  platform: Platform;
  dryRun?: boolean;
}

export interface UninstallSkillResult {
  skillName: string;
  removed: boolean;
  files: string[];
}

/**
 * Get skill directory name from skill fullName or name
 * @example "@the-aico/pm/brainstorming" -> "the-aico-pm-brainstorming"
 * @example "@the-aico/_shared/code-review" -> "aico-code-review" (shared skills use aico- prefix)
 */
export function getSkillDirName(fullNameOrName: string): string {
  if (fullNameOrName.startsWith('@')) {
    // Check if it's a shared skill
    if (fullNameOrName.includes('/_shared/')) {
      // Shared skills: @the-aico/_shared/code-review -> aico-code-review
      const skillName = fullNameOrName.split('/').pop() || '';
      return `aico-${skillName}`;
    }
    // Regular skills: @the-aico/pm/brainstorming -> the-aico-pm-brainstorming
    const normalized = fullNameOrName.replace(/^@/, '').replace(/\//g, '-');
    return normalized;
  }
  // Simple name: already hyphen-case
  return fullNameOrName;
}

/**
 * Install a single skill to the platform directory
 */
export async function installSkill(
  skill: Skill,
  config: Config,
  cwd: string,
  options: InstallSkillOptions
): Promise<InstallSkillResult> {
  const { skillsDir } = resolvePlatformPaths(cwd, config, options.platform);
  const skillDirName = getSkillDirName(skill.fullName);
  const skillDir = path.join(skillsDir, skillDirName);

  // Check if already exists
  if (await fs.pathExists(skillDir)) {
    if (!options.overwrite) {
      return {
        skill,
        installed: false,
        skipped: true,
        reason: 'Already exists',
        path: skillDir,
      };
    }
    // Remove existing directory
    await fs.remove(skillDir);
  }

  // Create skill directory
  await fs.ensureDir(skillDir);

  // Write skill files
  for (const file of skill.files) {
    const filePath = path.join(skillDir, file.path);

    // Ensure parent directory exists (for files in subdirectories like references/)
    await fs.ensureDir(path.dirname(filePath));

    // Update frontmatter name to match directory name
    let content = file.content;
    if (file.path === 'SKILL.md' || file.path.endsWith('/SKILL.md')) {
      content = updateSkillFrontmatterName(content, skillDirName);
    }

    await fs.writeFile(filePath, content, 'utf-8');

    // Make scripts executable
    if (file.type === 'script') {
      await fs.chmod(filePath, 0o755);
    }
  }

  return {
    skill,
    installed: true,
    skipped: false,
    path: skillDir,
  };
}

/**
 * Update skill name in SKILL.md frontmatter
 */
function updateSkillFrontmatterName(content: string, newName: string): string {
  return content.replace(/^(---\n[\s\S]*?name:\s*).+$/m, `$1${newName}`);
}

/**
 * Uninstall a single skill from the platform directory
 */
export async function uninstallSkill(
  skillFullName: string,
  config: Config,
  cwd: string,
  options: UninstallSkillOptions
): Promise<UninstallSkillResult> {
  const { skillsDir } = resolvePlatformPaths(cwd, config, options.platform);
  const skillDirName = getSkillDirName(skillFullName);
  const skillDir = path.join(skillsDir, skillDirName);

  // Check if directory exists
  if (!(await fs.pathExists(skillDir))) {
    return {
      skillName: skillFullName,
      removed: false,
      files: [],
    };
  }

  // List files that would be removed
  const files: string[] = [];
  const entries = await fs.readdir(skillDir);
  for (const entry of entries) {
    files.push(path.join(skillDir, entry));
  }

  // Dry run - only return file list
  if (options.dryRun) {
    return {
      skillName: skillFullName,
      removed: false,
      files,
    };
  }

  // Actually remove the directory
  await fs.remove(skillDir);

  return {
    skillName: skillFullName,
    removed: true,
    files,
  };
}

/**
 * Check if a skill is installed
 */
export async function isSkillInstalled(
  skillFullName: string,
  config: Config,
  cwd: string,
  platform: Platform
): Promise<boolean> {
  const { skillsDir } = resolvePlatformPaths(cwd, config, platform);
  const skillDirName = getSkillDirName(skillFullName);
  const skillDir = path.join(skillsDir, skillDirName);
  return fs.pathExists(skillDir);
}

/**
 * Get installed skill path
 */
export function getSkillPath(
  skillFullName: string,
  config: Config,
  cwd: string,
  platform: Platform
): string {
  const { skillsDir } = resolvePlatformPaths(cwd, config, platform);
  const skillDirName = getSkillDirName(skillFullName);
  return path.join(skillsDir, skillDirName);
}

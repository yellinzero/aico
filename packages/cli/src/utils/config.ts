import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import {
  configSchema,
  type Config,
  type Platform,
  type SkillState,
  type SharedSkillState,
} from '../schema/config.js';

const CONFIG_FILENAME = 'aico.json';

/**
 * Expand ~ to home directory in path
 */
function expandTilde(filePath: string): string {
  if (filePath.startsWith('~/') || filePath === '~') {
    return path.join(os.homedir(), filePath.slice(1));
  }
  return filePath;
}

/**
 * Get the path to aico.json in the given directory
 */
export function getConfigPath(cwd: string): string {
  return path.resolve(cwd, CONFIG_FILENAME);
}

/**
 * Check if aico.json exists in the given directory
 */
export async function configExists(cwd: string): Promise<boolean> {
  const configPath = getConfigPath(cwd);
  return fs.pathExists(configPath);
}

/**
 * Load and parse aico.json from the given directory
 */
export async function getConfig(cwd: string): Promise<Config | null> {
  const configPath = getConfigPath(cwd);

  if (!(await fs.pathExists(configPath))) {
    return null;
  }

  const raw = await fs.readJson(configPath);
  return configSchema.parse(raw);
}

/**
 * Write config to aico.json in the given directory
 */
export async function writeConfig(cwd: string, config: Config): Promise<void> {
  const configPath = getConfigPath(cwd);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Update employees field in aico.json
 */
export async function updateEmployees(
  cwd: string,
  employeeName: string,
  platforms: Platform[],
  skills?: string[],
  commands?: string[]
): Promise<void> {
  const config = await getConfig(cwd);
  if (!config) {
    throw new Error('Config not found');
  }

  config.employees[employeeName] = {
    platforms,
    installedAt: new Date().toISOString(),
    skills,
    commands,
  };

  await writeConfig(cwd, config);
}

/**
 * Remove employee from aico.json
 */
export async function removeEmployee(
  cwd: string,
  employeeName: string
): Promise<void> {
  const config = await getConfig(cwd);
  if (!config) {
    throw new Error('Config not found');
  }

  delete config.employees[employeeName];
  await writeConfig(cwd, config);
}

/**
 * Resolve paths for a platform
 *
 * Supports:
 * - Relative paths: resolved relative to cwd (e.g., '.claude/skills')
 * - Home directory: ~ expanded to user home (e.g., '~/.codex/skills')
 * - Absolute paths: used as-is
 */
export function resolvePlatformPaths(
  cwd: string,
  config: Config,
  platform: Platform
): { skillsDir: string; commandsDir: string } {
  const paths = config.platforms[platform];
  if (!paths) {
    throw new Error(`Platform ${platform} not configured`);
  }

  // Expand ~ and resolve paths
  const skillsPath = expandTilde(paths.skills);
  const commandsPath = expandTilde(paths.commands);

  return {
    skillsDir: path.isAbsolute(skillsPath)
      ? skillsPath
      : path.resolve(cwd, skillsPath),
    commandsDir: path.isAbsolute(commandsPath)
      ? commandsPath
      : path.resolve(cwd, commandsPath),
  };
}

// ============================================================================
// Skill Management
// ============================================================================

/**
 * Add or update a standalone skill in config
 */
export async function updateSkill(
  cwd: string,
  skillFullName: string,
  version: string,
  platforms: Platform[],
  source: 'standalone' | 'employee' = 'standalone'
): Promise<void> {
  const config = await getConfig(cwd);
  if (!config) {
    throw new Error('Config not found');
  }

  // Ensure skills object exists
  if (!config.skills) {
    config.skills = {};
  }

  config.skills[skillFullName] = {
    version,
    installedAt: new Date().toISOString(),
    source,
    platforms,
  };

  await writeConfig(cwd, config);
}

/**
 * Remove a skill from config
 */
export async function removeSkill(
  cwd: string,
  skillFullName: string
): Promise<void> {
  const config = await getConfig(cwd);
  if (!config) {
    throw new Error('Config not found');
  }

  if (config.skills) {
    delete config.skills[skillFullName];
  }

  await writeConfig(cwd, config);
}

/**
 * Get installed skill state
 */
export async function getSkillState(
  cwd: string,
  skillFullName: string
): Promise<SkillState | null> {
  const config = await getConfig(cwd);
  if (!config) {
    return null;
  }

  return config.skills?.[skillFullName] ?? null;
}

/**
 * Check if skill is installed (either standalone or as part of employee)
 */
export async function isSkillInstalled(
  cwd: string,
  skillFullName: string
): Promise<boolean> {
  const config = await getConfig(cwd);
  if (!config) {
    return false;
  }

  // Check standalone skills
  if (config.skills?.[skillFullName]) {
    return true;
  }

  // Check if part of any employee
  for (const empState of Object.values(config.employees)) {
    if (empState.skills?.includes(skillFullName)) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Shared Skill Management
// ============================================================================

/**
 * Add a shared skill reference for an employee.
 * If the shared skill is not installed yet, it will be marked for installation.
 * If already installed, just add the employee to usedBy list.
 */
export async function addSharedSkillReference(
  cwd: string,
  sharedSkillFullName: string,
  employeeName: string,
  version: string,
  platforms: Platform[]
): Promise<{ isNew: boolean }> {
  const config = await getConfig(cwd);
  if (!config) {
    throw new Error('Config not found');
  }

  // Ensure sharedSkills object exists
  if (!config.sharedSkills) {
    config.sharedSkills = {};
  }

  const existing = config.sharedSkills[sharedSkillFullName];

  if (existing) {
    // Shared skill already exists, add employee to usedBy if not present
    if (!existing.usedBy.includes(employeeName)) {
      existing.usedBy.push(employeeName);
    }
    // Merge platforms
    const allPlatforms = new Set([...existing.platforms, ...platforms]);
    existing.platforms = Array.from(allPlatforms) as Platform[];
    await writeConfig(cwd, config);
    return { isNew: false };
  }

  // New shared skill
  config.sharedSkills[sharedSkillFullName] = {
    version,
    installedAt: new Date().toISOString(),
    platforms,
    usedBy: [employeeName],
  };

  await writeConfig(cwd, config);
  return { isNew: true };
}

/**
 * Remove a shared skill reference for an employee.
 * Returns true if the shared skill should be uninstalled (no more references).
 */
export async function removeSharedSkillReference(
  cwd: string,
  sharedSkillFullName: string,
  employeeName: string
): Promise<{ shouldUninstall: boolean; remainingUsers: string[] }> {
  const config = await getConfig(cwd);
  if (!config) {
    throw new Error('Config not found');
  }

  const existing = config.sharedSkills?.[sharedSkillFullName];
  if (!existing) {
    return { shouldUninstall: false, remainingUsers: [] };
  }

  // Remove employee from usedBy
  existing.usedBy = existing.usedBy.filter((e) => e !== employeeName);

  if (existing.usedBy.length === 0) {
    // No more references, remove from config
    delete config.sharedSkills[sharedSkillFullName];
    await writeConfig(cwd, config);
    return { shouldUninstall: true, remainingUsers: [] };
  }

  // Still has references
  await writeConfig(cwd, config);
  return { shouldUninstall: false, remainingUsers: existing.usedBy };
}

/**
 * Get shared skill state
 */
export async function getSharedSkillState(
  cwd: string,
  sharedSkillFullName: string
): Promise<SharedSkillState | null> {
  const config = await getConfig(cwd);
  if (!config) {
    return null;
  }

  return config.sharedSkills?.[sharedSkillFullName] ?? null;
}

/**
 * Check if shared skill is installed
 */
export async function isSharedSkillInstalled(
  cwd: string,
  sharedSkillFullName: string
): Promise<boolean> {
  const state = await getSharedSkillState(cwd, sharedSkillFullName);
  return state !== null;
}

/**
 * Get all employees that use a specific shared skill
 */
export async function getSharedSkillUsers(
  cwd: string,
  sharedSkillFullName: string
): Promise<string[]> {
  const state = await getSharedSkillState(cwd, sharedSkillFullName);
  return state?.usedBy ?? [];
}

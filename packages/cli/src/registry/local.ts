import fs from 'fs-extra'
import path from 'path'
import { employeeSchema, registryIndexSchema, type Employee, type RegistryIndex } from '../schema/employee.js'
import { skillSchema, type Skill, type SkillSummary } from '../schema/skill.js'
import { skillsIndexSchema, type SkillsIndex } from '../schema/registry.js'

// ============================================================================
// Legacy Employee Loading (backward compatible)
// ============================================================================

/**
 * Load employee from local registry directory (legacy format)
 */
export async function loadLocalEmployee(
  registryDir: string,
  employeeName: string
): Promise<Employee | null> {
  const employeePath = path.join(registryDir, `${employeeName}.json`)

  if (!(await fs.pathExists(employeePath))) {
    return null
  }

  const raw = await fs.readJson(employeePath)
  return employeeSchema.parse(raw)
}

/**
 * Load registry index from local directory (legacy format)
 */
export async function loadLocalIndex(registryDir: string): Promise<RegistryIndex | null> {
  const indexPath = path.join(registryDir, 'index.json')

  if (!(await fs.pathExists(indexPath))) {
    return null
  }

  const raw = await fs.readJson(indexPath)
  return registryIndexSchema.parse(raw)
}

// ============================================================================
// New Skill-based Loading
// ============================================================================

/**
 * Load skill from local registry directory
 * @param registryDir - Base registry directory
 * @param skillFullName - Full skill name (e.g., "@the-aico/pm/brainstorming")
 */
export async function loadLocalSkill(
  registryDir: string,
  skillFullName: string
): Promise<Skill | null> {
  // Parse fullName: @the-aico/pm/brainstorming -> skills/aico/pm/brainstorming.json
  const parts = skillFullName.replace('@', '').split('/')
  if (parts.length !== 3) {
    return null
  }

  const [registry, employee, skill] = parts
  const skillPath = path.join(registryDir, 'skills', registry!, employee!, `${skill}.json`)

  if (!(await fs.pathExists(skillPath))) {
    return null
  }

  const raw = await fs.readJson(skillPath)
  return skillSchema.parse(raw)
}

/**
 * Load skills index from local registry
 */
export async function loadLocalSkillsIndex(registryDir: string): Promise<SkillsIndex | null> {
  const indexPath = path.join(registryDir, 'skills', 'index.json')

  if (!(await fs.pathExists(indexPath))) {
    return null
  }

  const raw = await fs.readJson(indexPath)
  return skillsIndexSchema.parse(raw)
}

/**
 * Load all skills for an employee
 */
export async function loadLocalEmployeeSkills(
  registryDir: string,
  registryName: string,
  employeeName: string
): Promise<Skill[]> {
  const skillsDir = path.join(registryDir, 'skills', registryName.replace('@', ''), employeeName)

  if (!(await fs.pathExists(skillsDir))) {
    return []
  }

  const files = await fs.readdir(skillsDir)
  const skills: Skill[] = []

  for (const file of files) {
    if (file.endsWith('.json')) {
      const raw = await fs.readJson(path.join(skillsDir, file))
      skills.push(skillSchema.parse(raw))
    }
  }

  return skills
}

// ============================================================================
// Registry Utilities
// ============================================================================

/**
 * Check if local registry exists
 */
export async function localRegistryExists(registryDir: string): Promise<boolean> {
  return fs.pathExists(registryDir)
}

/**
 * Check if new format registry exists (has skills/ directory)
 */
export async function isNewFormatRegistry(registryDir: string): Promise<boolean> {
  const skillsDir = path.join(registryDir, 'skills')
  return fs.pathExists(skillsDir)
}

/**
 * List all available skills from local registry
 */
export async function listLocalSkills(registryDir: string): Promise<SkillSummary[]> {
  const index = await loadLocalSkillsIndex(registryDir)
  return index ?? []
}

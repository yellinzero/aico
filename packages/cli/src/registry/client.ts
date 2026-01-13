import path from 'path'
import { employeeSchema, registryIndexSchema, type Employee, type RegistryIndex } from '../schema/employee.js'
import { skillSchema, type Skill } from '../schema/skill.js'
import { skillsIndexSchema, type SkillsIndex } from '../schema/registry.js'
import type { Config, RegistryConfig } from '../schema/config.js'
import { loadLocalEmployee, loadLocalIndex, loadLocalSkill, loadLocalSkillsIndex } from './local.js'
import { employeeNotFoundError, registryFetchError, skillNotFoundError } from '../utils/errors.js'
import { parseSkillFullName } from '../utils/parse-target.js'

/**
 * Resolve registry URL for an employee
 */
function resolveRegistryUrl(config: RegistryConfig, employeeName: string): string {
  if (typeof config === 'string') {
    return config.replace('{name}', employeeName)
  }
  return config.url.replace('{name}', employeeName)
}

/**
 * Get headers for registry request
 */
function getRegistryHeaders(config: RegistryConfig): Record<string, string> {
  if (typeof config === 'object' && config.headers) {
    return config.headers
  }
  return {}
}

/**
 * Parse registry reference (e.g., "@the-aico/pm" -> { registry: "@the-aico", name: "pm" })
 */
function parseEmployeeRef(ref: string): { registry: string; name: string } {
  if (ref.startsWith('@')) {
    const parts = ref.split('/')
    if (parts.length === 2 && parts[0] && parts[1]) {
      return { registry: parts[0], name: parts[1] }
    }
  }
  return { registry: '@the-aico', name: ref }
}

/**
 * Fetch employee from registry
 */
export async function fetchEmployee(
  employeeRef: string,
  config: Config,
  cwd: string
): Promise<Employee> {
  const { registry, name } = parseEmployeeRef(employeeRef)

  const registryConfig = config.registries[registry]
  if (!registryConfig) {
    throw new Error(`Registry '${registry}' not found in config`)
  }

  // Check if it's a local file:// URL
  const url = resolveRegistryUrl(registryConfig, name)
  if (url.startsWith('file://')) {
    // file://./registry/{name}.json -> ./registry/{name}.json
    const localPath = url.replace('file://', '')
    // Resolve relative to cwd
    const resolvedPath = path.isAbsolute(localPath) ? localPath : path.resolve(cwd, localPath)
    // loadLocalEmployee expects directory and name, not full path
    // registry/pm.json -> loadLocalEmployee('registry', 'pm')
    const registryDir = path.dirname(resolvedPath)
    const employee = await loadLocalEmployee(registryDir, name)
    if (!employee) {
      throw employeeNotFoundError(employeeRef)
    }
    return employee
  }

  // Fetch from remote
  const headers = getRegistryHeaders(registryConfig)
  const response = await fetch(url, { headers })

  if (!response.ok) {
    if (response.status === 404) {
      throw employeeNotFoundError(employeeRef)
    }
    throw registryFetchError(url, response.status)
  }

  const json = await response.json()
  return employeeSchema.parse(json)
}

/**
 * Fetch registry index
 */
export async function fetchRegistryIndex(
  config: Config,
  cwd: string,
  registryName = '@the-aico'
): Promise<RegistryIndex> {
  const registryConfig = config.registries[registryName]
  if (!registryConfig) {
    throw new Error(`Registry '${registryName}' not found in config`)
  }

  const url = resolveRegistryUrl(registryConfig, 'index')

  // Check if it's a local file:// URL
  if (url.startsWith('file://')) {
    const localPath = url.replace('file://', '').replace('/index.json', '')
    const resolvedPath = path.isAbsolute(localPath) ? localPath : path.resolve(cwd, localPath)
    const index = await loadLocalIndex(resolvedPath)
    if (!index) {
      return { employees: [] }
    }
    return index
  }

  // Fetch from remote
  const headers = getRegistryHeaders(registryConfig)
  const response = await fetch(url.replace('{name}.json', 'index.json'), { headers })

  if (!response.ok) {
    if (response.status === 404) {
      return { employees: [] }
    }
    throw registryFetchError(url, response.status)
  }

  const json = await response.json()
  return registryIndexSchema.parse(json)
}

// ============================================================================
// Skill Fetching (New Format)
// ============================================================================

/**
 * Build URL for skill from registry config
 */
function buildSkillUrl(registryConfig: RegistryConfig, fullName: string): string {
  const parsed = parseSkillFullName(fullName)
  if (!parsed) {
    throw new Error(`Invalid skill full name: ${fullName}`)
  }

  const baseUrl = typeof registryConfig === 'string'
    ? registryConfig.replace('{name}.json', '')
    : registryConfig.url.replace('{name}.json', '')

  // Build: {baseUrl}/skills/{registry}/{employee}/{skill}.json
  // e.g., https://the-aico.com/r/skills/aico/pm/brainstorming.json
  return `${baseUrl}skills/${parsed.registry.replace('@', '')}/${parsed.employee}/${parsed.skill}.json`
}

/**
 * Build URL for skills index from registry config
 */
function buildSkillsIndexUrl(registryConfig: RegistryConfig): string {
  const baseUrl = typeof registryConfig === 'string'
    ? registryConfig.replace('{name}.json', '')
    : registryConfig.url.replace('{name}.json', '')

  return `${baseUrl}skills/index.json`
}

/**
 * Fetch a single skill from registry
 */
export async function fetchSkill(
  fullName: string,
  config: Config,
  cwd: string
): Promise<Skill> {
  const parsed = parseSkillFullName(fullName)
  if (!parsed) {
    throw new Error(`Invalid skill full name: ${fullName}`)
  }

  const registryConfig = config.registries[parsed.registry]
  if (!registryConfig) {
    throw new Error(`Registry '${parsed.registry}' not found in config`)
  }

  // Check if it's a local file:// URL
  const url = buildSkillUrl(registryConfig, fullName)
  if (url.startsWith('file://')) {
    const localPath = url.replace('file://', '')
    const registryDir = path.resolve(cwd, localPath.split('/skills/')[0] ?? '')
    const skill = await loadLocalSkill(registryDir, fullName)
    if (!skill) {
      throw skillNotFoundError(fullName)
    }
    return skill
  }

  // Fetch from remote
  const headers = getRegistryHeaders(registryConfig)
  const response = await fetch(url, { headers })

  if (!response.ok) {
    if (response.status === 404) {
      throw skillNotFoundError(fullName)
    }
    throw registryFetchError(url, response.status)
  }

  const json = await response.json()
  return skillSchema.parse(json)
}

/**
 * Fetch skills index from registry
 */
export async function fetchSkillsIndex(
  config: Config,
  cwd: string,
  registryName = '@the-aico'
): Promise<SkillsIndex> {
  const registryConfig = config.registries[registryName]
  if (!registryConfig) {
    throw new Error(`Registry '${registryName}' not found in config`)
  }

  const url = buildSkillsIndexUrl(registryConfig)

  // Check if it's a local file:// URL
  if (url.startsWith('file://')) {
    const localPath = url.replace('file://', '').replace('/skills/index.json', '')
    const resolvedPath = path.isAbsolute(localPath) ? localPath : path.resolve(cwd, localPath)
    const index = await loadLocalSkillsIndex(resolvedPath)
    return index ?? []
  }

  // Fetch from remote
  const headers = getRegistryHeaders(registryConfig)
  const response = await fetch(url, { headers })

  if (!response.ok) {
    if (response.status === 404) {
      return []
    }
    throw registryFetchError(url, response.status)
  }

  const json = await response.json()
  return skillsIndexSchema.parse(json)
}

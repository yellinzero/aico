import type { Skill } from '../schema/skill.js'
import { AicoError } from '../utils/errors.js'

// ============================================================================
// Types
// ============================================================================

export interface ResolveResult {
  skills: Skill[]           // Skills in installation order (dependencies first)
  tree: DependencyTree      // Dependency tree for display
}

export interface DependencyTree {
  root: string              // Root skill fullName
  dependencies: DependencyNode[]
}

export interface DependencyNode {
  fullName: string
  version: string
  children: DependencyNode[]
  depth: number
}

// ============================================================================
// Dependency Resolver
// ============================================================================

export class DependencyResolver {
  private cache: Map<string, Skill> = new Map()

  constructor(
    private fetchSkill: (fullName: string) => Promise<Skill>
  ) {}

  /**
   * Resolve all dependencies for given skills
   * Returns skills in topological order (dependencies first)
   */
  async resolve(skillNames: string[]): Promise<ResolveResult> {
    // 1. Fetch all skills and their dependencies recursively
    const allSkills: Skill[] = []
    const visited = new Set<string>()

    for (const name of skillNames) {
      const skills = await this.fetchWithDependencies(name, visited)
      allSkills.push(...skills)
    }

    // 2. Deduplicate
    const uniqueSkills = this.deduplicateSkills(allSkills)

    // 3. Topological sort
    const sortedSkills = this.topologicalSort(uniqueSkills)

    // 4. Build dependency tree for display
    const skillMap = new Map(uniqueSkills.map(s => [s.fullName, s]))
    const trees: DependencyTree[] = skillNames.map(name => ({
      root: name,
      dependencies: [this.buildDependencyTree(name, skillMap)],
    }))

    return {
      skills: sortedSkills,
      tree: trees[0]!,
    }
  }

  /**
   * Recursively fetch a skill and all its dependencies
   */
  private async fetchWithDependencies(
    skillName: string,
    visited: Set<string> = new Set(),
    path: string[] = []
  ): Promise<Skill[]> {
    // Detect circular dependency
    if (path.includes(skillName)) {
      const cycle = [...path, skillName].join(' → ')
      throw new AicoError(
        `Circular dependency detected: ${cycle}`,
        'CIRCULAR_DEPENDENCY',
        { suggestion: 'Check skill dependencies for cycles.' }
      )
    }

    // Skip if already visited
    if (visited.has(skillName)) {
      return []
    }
    visited.add(skillName)

    // Fetch skill (use cache if available)
    let skill = this.cache.get(skillName)
    if (!skill) {
      skill = await this.fetchSkill(skillName)
      this.cache.set(skillName, skill)
    }

    // Recursively fetch dependencies
    const allSkills: Skill[] = []
    for (const dep of skill.dependencies) {
      const depSkills = await this.fetchWithDependencies(
        dep,
        visited,
        [...path, skillName]
      )
      allSkills.push(...depSkills)
    }

    // Add current skill last (after dependencies)
    allSkills.push(skill)
    return allSkills
  }

  /**
   * Remove duplicate skills (keep first occurrence)
   */
  private deduplicateSkills(skills: Skill[]): Skill[] {
    const seen = new Map<string, Skill>()
    for (const skill of skills) {
      if (!seen.has(skill.fullName)) {
        seen.set(skill.fullName, skill)
      }
    }
    return Array.from(seen.values())
  }

  /**
   * Topological sort using Kahn's algorithm
   * Returns skills in dependency order (install dependencies first)
   */
  private topologicalSort(skills: Skill[]): Skill[] {
    // Build in-degree map and adjacency list
    const inDegree = new Map<string, number>()
    const graph = new Map<string, string[]>()
    const skillMap = new Map<string, Skill>()

    // Initialize
    for (const skill of skills) {
      skillMap.set(skill.fullName, skill)
      if (!inDegree.has(skill.fullName)) {
        inDegree.set(skill.fullName, 0)
      }
      if (!graph.has(skill.fullName)) {
        graph.set(skill.fullName, [])
      }
    }

    // Build graph edges
    for (const skill of skills) {
      for (const dep of skill.dependencies) {
        // Only consider dependencies that are in our skill set
        if (skillMap.has(dep)) {
          const edges = graph.get(dep) ?? []
          edges.push(skill.fullName)
          graph.set(dep, edges)
          inDegree.set(skill.fullName, (inDegree.get(skill.fullName) ?? 0) + 1)
        }
      }
    }

    // BFS from nodes with 0 in-degree
    const queue: string[] = []
    for (const [name, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(name)
      }
    }

    const result: Skill[] = []
    while (queue.length > 0) {
      const node = queue.shift()!
      const skill = skillMap.get(node)
      if (skill) {
        result.push(skill)
      }

      for (const neighbor of graph.get(node) ?? []) {
        const newDegree = (inDegree.get(neighbor) ?? 1) - 1
        inDegree.set(neighbor, newDegree)
        if (newDegree === 0) {
          queue.push(neighbor)
        }
      }
    }

    // Check for cycles (shouldn't happen if fetchWithDependencies worked correctly)
    if (result.length !== skills.length) {
      throw new AicoError(
        'Circular dependency detected in skill graph',
        'CIRCULAR_DEPENDENCY',
        { suggestion: 'Check skill dependencies for cycles.' }
      )
    }

    return result
  }

  /**
   * Build dependency tree for display
   */
  private buildDependencyTree(
    skillName: string,
    skillMap: Map<string, Skill>,
    depth: number = 0,
    visited: Set<string> = new Set()
  ): DependencyNode {
    const skill = skillMap.get(skillName)
    if (!skill) {
      return {
        fullName: skillName,
        version: 'unknown',
        children: [],
        depth,
      }
    }

    // Avoid infinite loops for circular deps (shouldn't happen but safety first)
    if (visited.has(skillName)) {
      return {
        fullName: skillName + ' (circular)',
        version: skill.version,
        children: [],
        depth,
      }
    }
    visited.add(skillName)

    const children = skill.dependencies
      .filter(dep => skillMap.has(dep))
      .map(dep => this.buildDependencyTree(dep, skillMap, depth + 1, new Set(visited)))

    return {
      fullName: skillName,
      version: skill.version,
      children,
      depth,
    }
  }
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format dependency tree as ASCII tree
 */
export function formatDependencyTree(node: DependencyNode, prefix = ''): string {
  const lines: string[] = []

  lines.push(`${node.fullName} (${node.version})`)

  node.children.forEach((child, index) => {
    const isLast = index === node.children.length - 1
    const connector = isLast ? '└── ' : '├── '
    const extension = isLast ? '    ' : '│   '

    lines.push(`${prefix}${connector}${child.fullName} (${child.version})`)

    if (child.children.length > 0) {
      const childLines = formatDependencyTreeRecursive(child.children, prefix + extension)
      lines.push(...childLines)
    }
  })

  return lines.join('\n')
}

function formatDependencyTreeRecursive(nodes: DependencyNode[], prefix: string): string[] {
  const lines: string[] = []

  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1
    const connector = isLast ? '└── ' : '├── '
    const extension = isLast ? '    ' : '│   '

    lines.push(`${prefix}${connector}${node.fullName} (${node.version})`)

    if (node.children.length > 0) {
      lines.push(...formatDependencyTreeRecursive(node.children, prefix + extension))
    }
  })

  return lines
}

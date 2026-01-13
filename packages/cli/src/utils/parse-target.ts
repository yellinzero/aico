/**
 * Target parsing utilities for aico CLI
 *
 * Supports parsing both employee and skill references:
 * - Employee: "pm", "@the-aico/pm"
 * - Skill: "@the-aico/pm/brainstorming"
 */

export type TargetType = 'employee' | 'skill';

export interface ParsedTarget {
  type: TargetType;
  registry: string; // "@the-aico"
  namespace: string; // "@the-aico/pm" for skill, "@the-aico" for employee
  name: string; // "brainstorming" or "pm"
  fullName: string; // "@the-aico/pm/brainstorming" or "@the-aico/pm"
}

/**
 * Parse user input to determine if it's an employee or skill reference
 *
 * @example
 * parseTarget('pm')                     // { type: 'employee', registry: '@the-aico', name: 'pm', fullName: '@the-aico/pm' }
 * parseTarget('@the-aico/pm')               // { type: 'employee', registry: '@the-aico', name: 'pm', fullName: '@the-aico/pm' }
 * parseTarget('@the-aico/pm/brainstorming') // { type: 'skill', registry: '@the-aico', namespace: '@the-aico/pm', name: 'brainstorming', fullName: '@the-aico/pm/brainstorming' }
 */
export function parseTarget(
  input: string,
  defaultRegistry = '@the-aico'
): ParsedTarget {
  const trimmed = input.trim();

  // Check if it starts with @
  if (trimmed.startsWith('@')) {
    const parts = trimmed.split('/');

    if (parts.length === 2) {
      // @registry/employee format (e.g., @the-aico/pm)
      const [registry, name] = parts;
      return {
        type: 'employee',
        registry: registry!,
        namespace: registry!,
        name: name!,
        fullName: trimmed,
      };
    } else if (parts.length === 3) {
      // @registry/employee/skill format (e.g., @the-aico/pm/brainstorming)
      const [registry, employee, skill] = parts;
      return {
        type: 'skill',
        registry: registry!,
        namespace: `${registry}/${employee}`,
        name: skill!,
        fullName: trimmed,
      };
    }
  }

  // Simple name (e.g., "pm") - treat as employee with default registry
  return {
    type: 'employee',
    registry: defaultRegistry,
    namespace: defaultRegistry,
    name: trimmed,
    fullName: `${defaultRegistry}/${trimmed}`,
  };
}

/**
 * Build a skill full name from components
 */
export function buildSkillFullName(
  registry: string,
  employee: string,
  skill: string
): string {
  return `${registry}/${employee}/${skill}`;
}

/**
 * Build an employee full name from components
 */
export function buildEmployeeFullName(
  registry: string,
  employee: string
): string {
  return `${registry}/${employee}`;
}

/**
 * Parse a skill full name into components
 */
export function parseSkillFullName(
  fullName: string
): { registry: string; employee: string; skill: string } | null {
  // Support both regular skills (@the-aico/pm/brainstorming) and
  // shared skills (@the-aico/_shared/code-review)
  const match = fullName.match(/^(@[a-z0-9-]+)\/([a-z0-9_-]+)\/([a-z0-9-]+)$/);
  if (!match || !match[1] || !match[2] || !match[3]) {
    return null;
  }
  return {
    registry: match[1],
    employee: match[2],
    skill: match[3],
  };
}

/**
 * Parse an employee full name into components
 */
export function parseEmployeeFullName(
  fullName: string
): { registry: string; employee: string } | null {
  const match = fullName.match(/^(@[a-z0-9-]+)\/([a-z0-9_-]+)$/);
  if (!match || !match[1] || !match[2]) {
    return null;
  }
  return {
    registry: match[1],
    employee: match[2],
  };
}

/**
 * Check if a string is a valid skill full name
 */
export function isSkillFullName(input: string): boolean {
  return /^@[a-z0-9-]+\/[a-z0-9_-]+\/[a-z0-9-]+$/.test(input);
}

/**
 * Check if a string is a valid employee full name
 */
export function isEmployeeFullName(input: string): boolean {
  return /^@[a-z0-9-]+\/[a-z0-9_-]+$/.test(input);
}

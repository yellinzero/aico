import YAML from 'js-yaml';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

// ============================================================================
// Skill Frontmatter Schema (from SKILL.md)
// ============================================================================

export const skillFrontmatterSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/, 'Skill name must be hyphen-case'),
  description: z.string(),
  version: z.string().optional(),
  category: z
    .enum(['pm', 'frontend', 'backend', 'devops', 'general'])
    .optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  mcpDependencies: z
    .array(
      z.object({
        name: z.string(),
        package: z.string(),
        description: z.string(),
        docsUrl: z.string().url(),
      })
    )
    .optional(),
});

export type SkillFrontmatter = z.infer<typeof skillFrontmatterSchema>;

// ============================================================================
// Skill File Schema (for registry)
// ============================================================================

export const skillFileTypeSchema = z.enum([
  'skill',
  'reference',
  'asset',
  'script',
]);

export type SkillFileType = z.infer<typeof skillFileTypeSchema>;

export const skillFileSchema = z.object({
  path: z.string().min(1),
  type: skillFileTypeSchema,
  content: z.string(),
});

export type SkillFile = z.infer<typeof skillFileSchema>;

// ============================================================================
// Skill Category Schema
// ============================================================================

export const skillCategorySchema = z.enum([
  'pm',
  'frontend',
  'backend',
  'devops',
  'general',
]);

export type SkillCategory = z.infer<typeof skillCategorySchema>;

// ============================================================================
// Full Skill Schema (for registry storage)
// ============================================================================

export const skillSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/, 'Skill name must be hyphen-case'),
  namespace: z
    .string()
    .regex(
      /^@[a-z0-9-]+\/[a-z0-9_-]+$/,
      'Namespace must be @registry/employee format'
    ),
  fullName: z
    .string()
    .regex(
      /^@[a-z0-9-]+\/[a-z0-9_-]+\/[a-z0-9-]+$/,
      'Full name must be @registry/employee/skill format'
    ),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver format'),
  description: z.string(),
  category: skillCategorySchema,
  tags: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  mcpDependencies: z
    .array(
      z.object({
        name: z.string(),
        package: z.string(),
        description: z.string(),
        docsUrl: z.string(),
      })
    )
    .optional(),
  files: z.array(skillFileSchema),
});

export type Skill = z.infer<typeof skillSchema>;

// ============================================================================
// Skill Summary Schema (for index)
// ============================================================================

export const skillSummarySchema = z.object({
  name: z.string(),
  namespace: z.string(),
  fullName: z.string(),
  version: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
});

export type SkillSummary = z.infer<typeof skillSummarySchema>;

// ============================================================================
// MCP Dependency Schema
// ============================================================================

export const mcpDependencySchema = z.object({
  name: z.string(),
  package: z.string(),
  description: z.string(),
  docsUrl: z.string().url(),
});

export type MCPDependency = z.infer<typeof mcpDependencySchema>;

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Remove BOM character from content
 */
function removeBOM(content: string): string {
  if (content.charCodeAt(0) === 0xfeff) {
    return content.slice(1);
  }
  return content;
}

/**
 * Parse YAML frontmatter from SKILL.md content
 * Uses js-yaml for proper YAML parsing including multiline strings
 */
export function parseSkillFrontmatter(
  content: string
): SkillFrontmatter | null {
  // Preprocess: remove BOM
  content = removeBOM(content);

  // Extract frontmatter (supports both LF and CRLF)
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const yamlContent = match[1] ?? '';

  // Parse YAML using js-yaml
  let data: unknown;
  try {
    data = YAML.load(yamlContent);
  } catch (error) {
    const yamlError = error as Error;
    logger.error(`Invalid YAML syntax: ${yamlError.message}`);
    return null;
  }

  // Validate with Zod schema
  const result = skillFrontmatterSchema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    logger.error(`Invalid frontmatter: ${issues}`);
    return null;
  }

  return result.data;
}

/**
 * Parse complete SKILL.md file and return frontmatter + body
 */
export function parseSkillFile(content: string): {
  frontmatter: SkillFrontmatter;
  body: string;
} | null {
  const frontmatter = parseSkillFrontmatter(content);
  if (!frontmatter) {
    return null;
  }

  // Extract body (content after frontmatter)
  const bodyMatch = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  const body = bodyMatch ? (bodyMatch[1]?.trim() ?? '') : '';

  return { frontmatter, body };
}

/**
 * Remove frontmatter from SKILL.md content
 */
export function stripFrontmatter(content: string): string {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

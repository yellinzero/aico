import { z } from 'zod';
import { skillCategorySchema } from './skill.js';

export const fileTypeSchema = z.enum([
  'skill',
  'command',
  'doc',
  'script',
  'asset',
]);

export type FileType = z.infer<typeof fileTypeSchema>;

// Source file schema (content not yet loaded)
export const employeeFileSourceSchema = z.object({
  path: z.string().min(1),
  type: fileTypeSchema,
});

export type EmployeeFileSource = z.infer<typeof employeeFileSourceSchema>;

// Full file schema (content loaded)
export const employeeFileSchema = employeeFileSourceSchema.extend({
  content: z.string().min(1),
});

export type EmployeeFile = z.infer<typeof employeeFileSchema>;

// Source schemas (before content loaded)
export const skillDefSourceSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/, 'Skill name must be hyphen-case'),
  files: z.array(employeeFileSourceSchema).min(1),
});

export const commandDefSourceSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/, 'Command name must be hyphen-case'),
  files: z.array(employeeFileSourceSchema).min(1),
});

export const docDefSourceSchema = z.object({
  name: z.string(),
  files: z.array(employeeFileSourceSchema).min(1),
});

export const employeeSourceSchema = z.object({
  $schema: z.string().optional(),
  name: z.string().regex(/^[a-z0-9-]+$/, 'Employee name must be hyphen-case'),
  role: z.string().min(1),
  description: z.string().optional(),
  skills: z.array(skillDefSourceSchema).default([]),
  commands: z.array(commandDefSourceSchema).default([]),
  docs: z.array(docDefSourceSchema).default([]),
  dependencies: z.array(z.string()).default([]),
});

export type EmployeeSource = z.infer<typeof employeeSourceSchema>;

// Full schemas (content loaded)
export const skillDefSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/, 'Skill name must be hyphen-case'),
  files: z.array(employeeFileSchema).min(1),
});

export type SkillDef = z.infer<typeof skillDefSchema>;

export const commandDefSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/, 'Command name must be hyphen-case'),
  files: z.array(employeeFileSchema).min(1),
});

export type CommandDef = z.infer<typeof commandDefSchema>;

export const docDefSchema = z.object({
  name: z.string(),
  files: z.array(employeeFileSchema).min(1),
});

export type DocDef = z.infer<typeof docDefSchema>;

export const employeeSchema = z.object({
  $schema: z.string().optional(),
  name: z.string().regex(/^[a-z0-9-]+$/, 'Employee name must be hyphen-case'),
  role: z.string().min(1),
  description: z.string().optional(),
  skills: z.array(skillDefSchema).default([]),
  commands: z.array(commandDefSchema).default([]),
  docs: z.array(docDefSchema).default([]),
  dependencies: z.array(z.string()).default([]),
});

export type Employee = z.infer<typeof employeeSchema>;

// ============================================================================
// Employee Summary Schema (for index)
// ============================================================================

export const employeeSummarySchema = z.object({
  name: z.string(),
  namespace: z.string().optional(),
  fullName: z.string().optional(),
  role: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  skillCount: z.number().optional(),
  commandCount: z.number().optional(),
  category: skillCategorySchema.optional(),
});

export type EmployeeSummary = z.infer<typeof employeeSummarySchema>;

// ============================================================================
// Extended Employee Schema (for new registry format)
// ============================================================================

export const employeeExtendedSchema = z.object({
  $schema: z.string().optional(),
  name: z.string().regex(/^[a-z0-9-]+$/, 'Employee name must be hyphen-case'),
  namespace: z
    .string()
    .regex(/^@[a-z0-9-]+$/, 'Namespace must be @registry format'),
  fullName: z
    .string()
    .regex(
      /^@[a-z0-9-]+\/[a-z0-9-]+$/,
      'Full name must be @registry/employee format'
    ),
  role: z.string().min(1),
  description: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver format'),
  category: skillCategorySchema,
  skills: z.array(z.string()), // Array of skill fullNames: ["@the-aico/pm/brainstorming", ...]
  commands: z.array(commandDefSchema).default([]),
  docs: z.array(docDefSchema).default([]),
});

export type EmployeeExtended = z.infer<typeof employeeExtendedSchema>;

// ============================================================================
// Legacy Registry Index Schema (for backward compatibility)
// ============================================================================

export const registryIndexSchema = z.object({
  employees: z.array(employeeSummarySchema),
});

export type RegistryIndex = z.infer<typeof registryIndexSchema>;

import { z } from 'zod';
import { skillSummarySchema } from './skill.js';
import { employeeSummarySchema } from './employee.js';

// ============================================================================
// Skills Index Schema
// ============================================================================

export const skillsIndexSchema = z.array(skillSummarySchema);

export type SkillsIndex = z.infer<typeof skillsIndexSchema>;

// ============================================================================
// Employees Index Schema
// ============================================================================

export const employeesIndexSchema = z.array(employeeSummarySchema);

export type EmployeesIndex = z.infer<typeof employeesIndexSchema>;

// ============================================================================
// Full Registry Index Schema (new format)
// ============================================================================

export const registryIndexV2Schema = z.object({
  version: z.literal('2.0').default('2.0'),
  skills: skillsIndexSchema,
  employees: employeesIndexSchema,
});

export type RegistryIndexV2 = z.infer<typeof registryIndexV2Schema>;

import { z } from 'zod';

// Constants
export const DEFAULT_REGISTRY_URL = 'https://the-aico.com/r/{name}.json';
export const DEFAULT_SCHEMA_URL = 'https://the-aico.com/schema/config.json';

export const platformSchema = z.enum(['claude-code', 'codex']);

export type Platform = z.infer<typeof platformSchema>;

export const languageSchema = z.string().default('en');

export type Language = z.infer<typeof languageSchema>;

export const platformPathsSchema = z.object({
  skills: z.string(),
  commands: z.string(),
});

export type PlatformPaths = z.infer<typeof platformPathsSchema>;

export const employeeStateSchema = z.object({
  installedAt: z.string(),
  version: z.string().optional(),
  // Track installed skills and commands for update detection
  skills: z.array(z.string()).optional(),
  commands: z.array(z.string()).optional(),
});

export type EmployeeState = z.infer<typeof employeeStateSchema>;

// Skill state for standalone installed skills
export const skillStateSchema = z.object({
  version: z.string(),
  installedAt: z.string(),
  source: z.enum(['standalone', 'employee']), // standalone = single install, employee = part of employee
});

export type SkillState = z.infer<typeof skillStateSchema>;

// Shared skill state - tracks which employees depend on this shared skill
export const sharedSkillStateSchema = z.object({
  version: z.string(),
  installedAt: z.string(),
  // Track which employees depend on this shared skill
  // When this array becomes empty, the shared skill can be removed
  usedBy: z.array(z.string()),
});

export type SharedSkillState = z.infer<typeof sharedSkillStateSchema>;

export const registryConfigSchema = z.union([
  z.string().refine((s) => s.includes('{name}'), {
    message: 'Registry URL must include {name} placeholder',
  }),
  z.object({
    url: z.string().refine((s) => s.includes('{name}'), {
      message: 'Registry URL must include {name} placeholder',
    }),
    headers: z.record(z.string()).optional(),
  }),
]);

export type RegistryConfig = z.infer<typeof registryConfigSchema>;

export const configSchema = z.object({
  $schema: z.string().optional(),
  language: languageSchema.optional(),
  defaultPlatform: platformSchema,
  platforms: z.record(platformSchema, platformPathsSchema),
  employees: z.record(z.string(), employeeStateSchema).default({}),
  skills: z.record(z.string(), skillStateSchema).default({}), // Standalone skills
  sharedSkills: z.record(z.string(), sharedSkillStateSchema).default({}), // Shared skills with reference tracking
  registries: z
    .record(
      z.string().refine((key) => key.startsWith('@'), {
        message: 'Registry key must start with @',
      }),
      registryConfigSchema
    )
    .default({
      '@the-aico': DEFAULT_REGISTRY_URL,
    }),
});

export type Config = z.infer<typeof configSchema>;

export const DEFAULT_PLATFORMS: Record<Platform, PlatformPaths> = {
  'claude-code': {
    skills: '.claude/skills',
    commands: '.claude/commands',
  },
  // Codex platform configuration:
  // - skills: project directory .codex/skills/ (Codex natively supports project-level skills)
  // - commands (prompts): global ~/.codex/prompts/ (install once, available for all projects)
  // Invocation: /prompts:aico.{employee}.{command}
  // Users can override paths in aico.json
  codex: {
    skills: '.codex/skills',
    commands: '~/.codex/prompts', // Codex custom prompts (global)
  },
};

export function createDefaultConfig(
  defaultPlatform: Platform = 'claude-code'
): Config {
  return {
    $schema: DEFAULT_SCHEMA_URL,
    defaultPlatform,
    platforms: DEFAULT_PLATFORMS,
    employees: {},
    skills: {},
    sharedSkills: {},
    registries: {
      '@the-aico': DEFAULT_REGISTRY_URL,
    },
  };
}

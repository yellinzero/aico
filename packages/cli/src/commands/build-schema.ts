import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * JSON Schema definitions for aico configuration files.
 * These schemas are manually maintained to ensure compatibility
 * with JSON Schema draft-07 and IDE tooling.
 */

const CONFIG_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://the-aico.com/schema/config.json',
  title: 'aico Configuration',
  description: 'Configuration file schema for aico.json',
  type: 'object',
  required: ['defaultPlatform', 'platforms'],
  properties: {
    $schema: {
      type: 'string',
      description: 'JSON Schema reference',
    },
    language: {
      type: 'string',
      description: 'Default language for documentation',
      default: 'en',
    },
    defaultPlatform: {
      type: 'string',
      enum: ['claude-code', 'codex'],
      description: 'Default platform for installation',
    },
    platforms: {
      type: 'object',
      description: 'Platform-specific path configurations',
      additionalProperties: {
        type: 'object',
        required: ['skills', 'commands'],
        properties: {
          skills: {
            type: 'string',
            description: 'Path to skills directory',
          },
          commands: {
            type: 'string',
            description: 'Path to commands directory',
          },
        },
      },
    },
    employees: {
      type: 'object',
      description: 'Installed employees state',
      additionalProperties: {
        type: 'object',
        required: ['installedAt'],
        properties: {
          installedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Installation timestamp',
          },
          version: {
            type: 'string',
            description: 'Installed version',
          },
          skills: {
            type: 'array',
            items: { type: 'string' },
            description: 'Installed skill names',
          },
          commands: {
            type: 'array',
            items: { type: 'string' },
            description: 'Installed command names',
          },
        },
      },
    },
    skills: {
      type: 'object',
      description: 'Standalone installed skills',
      additionalProperties: {
        type: 'object',
        required: ['version', 'installedAt', 'source'],
        properties: {
          version: {
            type: 'string',
            description: 'Skill version',
          },
          installedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Installation timestamp',
          },
          source: {
            type: 'string',
            enum: ['standalone', 'employee'],
            description: 'Installation source',
          },
        },
      },
    },
    sharedSkills: {
      type: 'object',
      description: 'Shared skills with reference tracking',
      additionalProperties: {
        type: 'object',
        required: ['version', 'installedAt', 'usedBy'],
        properties: {
          version: {
            type: 'string',
            description: 'Skill version',
          },
          installedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Installation timestamp',
          },
          usedBy: {
            type: 'array',
            items: { type: 'string' },
            description: 'Employees that depend on this shared skill',
          },
        },
      },
    },
    registries: {
      type: 'object',
      description: 'Custom registry configurations',
      propertyNames: {
        pattern: '^@',
      },
      additionalProperties: {
        oneOf: [
          {
            type: 'string',
            description: 'Registry URL with {name} placeholder',
          },
          {
            type: 'object',
            required: ['url'],
            properties: {
              url: {
                type: 'string',
                description: 'Registry URL with {name} placeholder',
              },
              headers: {
                type: 'object',
                additionalProperties: { type: 'string' },
                description: 'Custom HTTP headers',
              },
            },
          },
        ],
      },
    },
  },
};

const EMPLOYEE_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://the-aico.com/schema/employee.json',
  title: 'aico Employee',
  description: 'Employee definition schema for employee.json',
  type: 'object',
  required: ['name', 'role'],
  properties: {
    $schema: {
      type: 'string',
      description: 'JSON Schema reference',
    },
    name: {
      type: 'string',
      pattern: '^[a-z0-9-]+$',
      description: 'Employee name (hyphen-case)',
    },
    namespace: {
      type: 'string',
      pattern: '^@[a-z0-9-]+$',
      description: 'Registry namespace (@registry format)',
    },
    fullName: {
      type: 'string',
      pattern: '^@[a-z0-9-]+/[a-z0-9-]+$',
      description: 'Full name (@registry/employee format)',
    },
    role: {
      type: 'string',
      minLength: 1,
      description: 'Employee role title',
    },
    description: {
      type: 'string',
      description: 'Employee description',
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$',
      description: 'Semantic version',
    },
    category: {
      type: 'string',
      enum: ['pm', 'frontend', 'backend', 'devops', 'general'],
      description: 'Employee category',
    },
    skills: {
      type: 'array',
      description: 'Employee skills',
      items: {
        oneOf: [
          {
            type: 'string',
            description: 'Skill fullName reference',
          },
          {
            type: 'object',
            required: ['name', 'files'],
            properties: {
              name: {
                type: 'string',
                pattern: '^[a-z0-9-]+$',
                description: 'Skill name (hyphen-case)',
              },
              files: {
                type: 'array',
                minItems: 1,
                items: {
                  $ref: '#/definitions/fileSource',
                },
              },
            },
          },
        ],
      },
    },
    commands: {
      type: 'array',
      description: 'Employee commands',
      items: {
        type: 'object',
        required: ['name', 'files'],
        properties: {
          name: {
            type: 'string',
            pattern: '^[a-z0-9-]+$',
            description: 'Command name (hyphen-case)',
          },
          files: {
            type: 'array',
            minItems: 1,
            items: {
              $ref: '#/definitions/file',
            },
          },
        },
      },
    },
    docs: {
      type: 'array',
      description: 'Employee documentation',
      items: {
        type: 'object',
        required: ['name', 'files'],
        properties: {
          name: {
            type: 'string',
            description: 'Document name',
          },
          files: {
            type: 'array',
            minItems: 1,
            items: {
              $ref: '#/definitions/file',
            },
          },
        },
      },
    },
    dependencies: {
      type: 'array',
      description: 'Shared skill dependencies',
      items: {
        type: 'string',
        description: 'Dependency reference (@registry/_shared/skill)',
      },
    },
  },
  definitions: {
    fileSource: {
      type: 'object',
      required: ['path', 'type'],
      properties: {
        path: {
          type: 'string',
          minLength: 1,
          description: 'Relative file path',
        },
        type: {
          type: 'string',
          enum: ['skill', 'command', 'reference', 'script', 'asset'],
          description: 'File type',
        },
      },
    },
    file: {
      type: 'object',
      required: ['path', 'type'],
      properties: {
        path: {
          type: 'string',
          minLength: 1,
          description: 'Relative file path',
        },
        type: {
          type: 'string',
          enum: ['skill', 'command', 'reference', 'script', 'asset'],
          description: 'File type',
        },
        content: {
          type: 'string',
          description: 'File content (populated at build time)',
        },
      },
    },
  },
};

/**
 * Build JSON Schema files to public directory
 */
export async function buildSchemas(outputDir: string): Promise<void> {
  const schemaDir = path.join(outputDir, 'schema');
  await fs.ensureDir(schemaDir);

  // Write config.json schema
  await fs.writeJson(path.join(schemaDir, 'config.json'), CONFIG_SCHEMA, {
    spaces: 2,
  });

  // Write employee.json schema
  await fs.writeJson(path.join(schemaDir, 'employee.json'), EMPLOYEE_SCHEMA, {
    spaces: 2,
  });

  logger.success('Built JSON schemas to schema/');
}

export { CONFIG_SCHEMA, EMPLOYEE_SCHEMA };

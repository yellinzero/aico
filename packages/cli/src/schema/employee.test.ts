import { describe, it, expect } from 'vitest';
import {
  fileTypeSchema,
  employeeFileSchema,
  employeeSchema,
  skillDefSchema,
  commandDefSchema,
  docDefSchema,
} from './employee.js';

describe('fileTypeSchema', () => {
  it('should accept valid file types', () => {
    expect(fileTypeSchema.parse('skill')).toBe('skill');
    expect(fileTypeSchema.parse('command')).toBe('command');
    expect(fileTypeSchema.parse('reference')).toBe('reference');
    expect(fileTypeSchema.parse('script')).toBe('script');
    expect(fileTypeSchema.parse('asset')).toBe('asset');
  });

  it('should reject legacy "doc" type', () => {
    expect(() => fileTypeSchema.parse('doc')).toThrow();
  });

  it('should reject invalid types', () => {
    expect(() => fileTypeSchema.parse('unknown')).toThrow();
    expect(() => fileTypeSchema.parse('')).toThrow();
    expect(() => fileTypeSchema.parse(123)).toThrow();
  });
});

describe('employeeFileSchema', () => {
  it('should accept valid skill file', () => {
    const result = employeeFileSchema.parse({
      path: 'skills/init/SKILL.md',
      type: 'skill',
      content: '# Skill content',
    });
    expect(result.type).toBe('skill');
  });

  it('should accept valid command file', () => {
    const result = employeeFileSchema.parse({
      path: 'commands/init.md',
      type: 'command',
      content: '# Command',
    });
    expect(result.type).toBe('command');
  });

  it('should accept valid reference file', () => {
    const result = employeeFileSchema.parse({
      path: 'skills/init/references/template.md',
      type: 'reference',
      content: '# Template',
    });
    expect(result.type).toBe('reference');
  });

  it('should accept valid script file', () => {
    const result = employeeFileSchema.parse({
      path: 'scripts/setup.sh',
      type: 'script',
      content: '#!/bin/bash',
    });
    expect(result.type).toBe('script');
  });

  it('should reject file with legacy doc type', () => {
    expect(() =>
      employeeFileSchema.parse({
        path: 'skills/init/references/template.md',
        type: 'doc',
        content: '# Template',
      })
    ).toThrow();
  });
});

describe('skillDefSchema', () => {
  it('should accept skill with reference files', () => {
    const result = skillDefSchema.parse({
      name: 'init',
      files: [
        { path: 'SKILL.md', type: 'skill', content: '# Skill' },
        { path: 'references/template.md', type: 'reference', content: '# Ref' },
      ],
    });
    expect(result.files).toHaveLength(2);
    expect(result.files[0]!.type).toBe('skill');
    expect(result.files[1]!.type).toBe('reference');
  });
});

describe('commandDefSchema', () => {
  it('should accept command with command type files', () => {
    const result = commandDefSchema.parse({
      name: 'init',
      files: [{ path: 'commands/init.md', type: 'command', content: '# Init' }],
    });
    expect(result.files[0]!.type).toBe('command');
  });
});

describe('docDefSchema', () => {
  it('should accept doc with reference type files', () => {
    const result = docDefSchema.parse({
      name: 'readme',
      files: [
        { path: 'docs/readme.md', type: 'reference', content: '# Readme' },
      ],
    });
    expect(result.files[0]!.type).toBe('reference');
  });
});

describe('employeeSchema', () => {
  it('should accept a complete employee definition', () => {
    const result = employeeSchema.parse({
      name: 'backend',
      role: 'Backend Engineer',
      description: 'Backend development',
      skills: [
        {
          name: 'init',
          files: [
            {
              path: 'skills/init/SKILL.md',
              type: 'skill',
              content:
                '---\nname: aico-backend-init\ndescription: Init\n---\n# Init',
            },
            {
              path: 'skills/init/references/constraints.template.md',
              type: 'reference',
              content: '# Template',
            },
          ],
        },
      ],
      commands: [
        {
          name: 'init',
          files: [
            {
              path: 'commands/init.md',
              type: 'command',
              content: '# Init command',
            },
          ],
        },
      ],
      docs: [],
      dependencies: ['@the-aico/_shared/code-review'],
    });
    expect(result.name).toBe('backend');
    expect(result.skills).toHaveLength(1);
    expect(result.commands).toHaveLength(1);
  });

  it('should reject employee with legacy doc file type', () => {
    expect(() =>
      employeeSchema.parse({
        name: 'backend',
        role: 'Backend Engineer',
        skills: [
          {
            name: 'init',
            files: [
              { path: 'SKILL.md', type: 'skill', content: '# Skill' },
              { path: 'references/template.md', type: 'doc', content: '# Ref' },
            ],
          },
        ],
      })
    ).toThrow();
  });
});

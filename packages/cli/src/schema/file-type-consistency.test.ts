import { describe, it, expect } from 'vitest';
import { skillFileTypeSchema, skillFileSchema, skillSchema } from './skill.js';
import { fileTypeSchema } from './employee.js';

describe('skillFileTypeSchema', () => {
  it('should accept valid skill file types', () => {
    expect(skillFileTypeSchema.parse('skill')).toBe('skill');
    expect(skillFileTypeSchema.parse('reference')).toBe('reference');
    expect(skillFileTypeSchema.parse('script')).toBe('script');
    expect(skillFileTypeSchema.parse('asset')).toBe('asset');
  });

  it('should reject legacy types', () => {
    expect(() => skillFileTypeSchema.parse('doc')).toThrow();
    expect(() => skillFileTypeSchema.parse('command')).toThrow();
  });
});

describe('file type schema consistency', () => {
  it('skill file types should be a subset of employee file types', () => {
    const employeeTypes = new Set(fileTypeSchema.options);
    const skillTypes = new Set(skillFileTypeSchema.options);
    for (const type of skillTypes) {
      expect(employeeTypes).toContain(type);
    }
  });

  it('employee file types should include command (not available in skill files)', () => {
    const employeeTypes = new Set(fileTypeSchema.options);
    const skillTypes = new Set(skillFileTypeSchema.options);
    expect(employeeTypes).toContain('command');
    expect(skillTypes).not.toContain('command');
  });

  it('skill file types should contain exactly: skill, reference, script, asset', () => {
    const expected = new Set(['skill', 'reference', 'script', 'asset']);
    expect(new Set(skillFileTypeSchema.options)).toEqual(expected);
  });

  it('employee file types should contain exactly: skill, command, reference, script, asset', () => {
    const expected = new Set([
      'skill',
      'command',
      'reference',
      'script',
      'asset',
    ]);
    expect(new Set(fileTypeSchema.options)).toEqual(expected);
  });
});

describe('skillFileSchema', () => {
  it('should accept valid skill file', () => {
    const result = skillFileSchema.parse({
      path: 'SKILL.md',
      type: 'skill',
      content: '# Skill',
    });
    expect(result.type).toBe('skill');
  });

  it('should accept reference file', () => {
    const result = skillFileSchema.parse({
      path: 'references/template.md',
      type: 'reference',
      content: '# Template',
    });
    expect(result.type).toBe('reference');
  });

  it('should reject legacy doc type', () => {
    expect(() =>
      skillFileSchema.parse({
        path: 'references/template.md',
        type: 'doc',
        content: '# Template',
      })
    ).toThrow();
  });
});

describe('skillSchema', () => {
  it('should accept a complete skill definition', () => {
    const result = skillSchema.parse({
      name: 'init',
      namespace: '@the-aico/backend',
      fullName: '@the-aico/backend/init',
      version: '1.0.0',
      description: 'Initialize backend',
      category: 'backend',
      tags: [],
      dependencies: [],
      files: [
        { path: 'SKILL.md', type: 'skill', content: '# Skill' },
        {
          path: 'references/constraints.template.md',
          type: 'reference',
          content: '# Template',
        },
      ],
    });
    expect(result.name).toBe('init');
    expect(result.files).toHaveLength(2);
  });

  it('should reject skill with legacy doc file type', () => {
    expect(() =>
      skillSchema.parse({
        name: 'init',
        namespace: '@the-aico/backend',
        fullName: '@the-aico/backend/init',
        version: '1.0.0',
        description: 'Initialize backend',
        category: 'backend',
        files: [
          { path: 'SKILL.md', type: 'skill', content: '# Skill' },
          {
            path: 'references/template.md',
            type: 'doc',
            content: '# Template',
          },
        ],
      })
    ).toThrow();
  });
});

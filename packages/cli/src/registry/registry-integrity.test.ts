import { describe, it, expect } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { employeeSchema } from '../schema/employee.js';
import { skillSchema } from '../schema/skill.js';

const REGISTRY_DIR = path.resolve(__dirname, '../../../../registry');

describe('registry data integrity', () => {
  describe('employee JSON files', () => {
    const employeeFiles = ['pm.json', 'frontend.json', 'backend.json'];

    for (const file of employeeFiles) {
      it(`${file} should pass employee schema validation`, async () => {
        const filePath = path.join(REGISTRY_DIR, file);
        const data = await fs.readJson(filePath);
        const result = employeeSchema.safeParse(data);
        if (!result.success) {
          const issues = result.error.issues
            .map((i) => `${i.path.join('.')}: ${i.message}`)
            .join('\n');
          expect.fail(`Validation failed for ${file}:\n${issues}`);
        }
        expect(result.success).toBe(true);
      });

      it(`${file} should not contain legacy "doc" file type`, async () => {
        const content = await fs.readFile(path.join(REGISTRY_DIR, file), 'utf-8');
        expect(content).not.toContain('"type": "doc"');
      });
    }
  });

  describe('skill JSON files', () => {
    it('should validate all skill JSON files against skill schema', async () => {
      const skillsDir = path.join(REGISTRY_DIR, 'skills', 'the-aico');
      const employees = await fs.readdir(skillsDir);

      for (const employee of employees) {
        const employeeSkillsDir = path.join(skillsDir, employee);
        const stat = await fs.stat(employeeSkillsDir);
        if (!stat.isDirectory()) continue;

        const files = await fs.readdir(employeeSkillsDir);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;

          const filePath = path.join(employeeSkillsDir, file);
          const data = await fs.readJson(filePath);
          const result = skillSchema.safeParse(data);
          if (!result.success) {
            const issues = result.error.issues
              .map((i) => `${i.path.join('.')}: ${i.message}`)
              .join('\n');
            expect.fail(`Validation failed for skills/${employee}/${file}:\n${issues}`);
          }
          expect(result.success).toBe(true);
        }
      }
    });

    it('should not contain legacy "doc" type in any skill JSON', async () => {
      const skillsDir = path.join(REGISTRY_DIR, 'skills', 'the-aico');
      const employees = await fs.readdir(skillsDir);

      for (const employee of employees) {
        const employeeSkillsDir = path.join(skillsDir, employee);
        const stat = await fs.stat(employeeSkillsDir);
        if (!stat.isDirectory()) continue;

        const files = await fs.readdir(employeeSkillsDir);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;

          const content = await fs.readFile(
            path.join(employeeSkillsDir, file),
            'utf-8'
          );
          expect(content).not.toContain('"type": "doc"');
        }
      }
    });
  });

  describe('employee-skill type consistency', () => {
    it('employee skill files and standalone skill files should use the same types', async () => {
      // Load backend employee
      const employeeData = await fs.readJson(path.join(REGISTRY_DIR, 'backend.json'));
      const employee = employeeSchema.parse(employeeData);

      // For each skill in the employee, check the standalone skill JSON
      for (const skill of employee.skills) {
        const skillPath = path.join(
          REGISTRY_DIR, 'skills', 'the-aico', 'backend', `${skill.name}.json`
        );
        if (!(await fs.pathExists(skillPath))) continue;

        const skillData = await fs.readJson(skillPath);
        const standaloneSkill = skillSchema.parse(skillData);

        // Both should have the same number of files
        expect(standaloneSkill.files.length).toBe(skill.files.length);

        // All skill file types should be valid (no command type in skill files)
        for (const file of skill.files) {
          expect(['skill', 'reference', 'script', 'asset']).toContain(file.type);
        }
        for (const file of standaloneSkill.files) {
          expect(['skill', 'reference', 'script', 'asset']).toContain(file.type);
        }
      }
    });
  });
});

describe('employee source files', () => {
  const EMPLOYEES_DIR = path.resolve(__dirname, '../../../../employees');

  const employeeDirs = ['pm', 'frontend', 'backend'];

  for (const emp of employeeDirs) {
    it(`${emp}/employee.json should not contain legacy file types`, async () => {
      const filePath = path.join(EMPLOYEES_DIR, emp, 'employee.json');
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).not.toContain('"type": "doc"');
    });

    it(`${emp}/employee.json should pass schema validation`, async () => {
      const filePath = path.join(EMPLOYEES_DIR, emp, 'employee.json');
      const data = await fs.readJson(filePath);
      // Verify skill file types (should not include 'command')
      for (const skill of data.skills ?? []) {
        for (const file of skill.files ?? []) {
          expect(['skill', 'reference', 'script', 'asset']).toContain(file.type);
        }
      }
      // Verify command file types (should be 'command')
      for (const command of data.commands ?? []) {
        for (const file of command.files ?? []) {
          expect(['skill', 'command', 'reference', 'script', 'asset']).toContain(file.type);
        }
      }
    });
  }
});

describe('JSON Schema output', () => {
  it('employee.json schema should use correct file types', async () => {
    const schemaPath = path.join(REGISTRY_DIR, 'schema', 'employee.json');
    const schema = await fs.readJson(schemaPath);

    // Check fileSource definition
    const fileSourceEnum = schema.definitions?.fileSource?.properties?.type?.enum;
    expect(fileSourceEnum).toBeDefined();
    expect(fileSourceEnum).toContain('skill');
    expect(fileSourceEnum).toContain('command');
    expect(fileSourceEnum).toContain('reference');
    expect(fileSourceEnum).not.toContain('doc');

    // Check file definition
    const fileEnum = schema.definitions?.file?.properties?.type?.enum;
    expect(fileEnum).toBeDefined();
    expect(fileEnum).toContain('skill');
    expect(fileEnum).toContain('command');
    expect(fileEnum).toContain('reference');
    expect(fileEnum).not.toContain('doc');
  });
});

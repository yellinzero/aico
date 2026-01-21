import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import glob from 'fast-glob';
import { z } from 'zod';
import {
  employeeSourceSchema,
  type Employee,
  type EmployeeSummary,
} from '../schema/employee.js';
import {
  parseSkillFrontmatter,
  type Skill,
  type SkillSummary,
  type SkillCategory,
} from '../schema/skill.js';
import { logger, spinner } from '../utils/logger.js';
import { handleError } from '../utils/errors.js';
import { buildSchemas } from './build-schema.js';

const buildOptionsSchema = z.object({
  cwd: z.string(),
  employeesDir: z.string(),
  outputDir: z.string(),
  schemaDir: z.string().optional(),
  registry: z.string(),
  version: z.string(),
});

type BuildOptions = z.infer<typeof buildOptionsSchema>;

/**
 * Infer category from employee name
 */
function inferCategory(employeeName: string): SkillCategory {
  const categoryMap: Record<string, SkillCategory> = {
    pm: 'pm',
    frontend: 'frontend',
    backend: 'backend',
    devops: 'devops',
    _shared: 'general',
  };
  return categoryMap[employeeName] ?? 'general';
}

/**
 * Build shared skills from _shared directory
 * Shared skills use naming format: aico-{skill} (no employee prefix)
 */
async function buildSharedSkills(
  employeesPath: string,
  outputPath: string,
  registry: string,
  version: string,
  skillsIndex: SkillSummary[]
): Promise<number> {
  const sharedDir = path.join(employeesPath, '_shared', 'skills');

  if (!(await fs.pathExists(sharedDir))) {
    return 0;
  }

  // Find all skill directories in _shared/skills
  const skillDirs = await glob('*/SKILL.md', {
    cwd: sharedDir,
  });

  if (skillDirs.length === 0) {
    return 0;
  }

  // Use @aico/_shared as namespace for shared skills
  const namespace = `${registry}/_shared`;

  for (const skillPath of skillDirs) {
    const skillName = path.dirname(skillPath);
    const skillFullName = `${namespace}/${skillName}`;
    const skillFilePath = path.join(sharedDir, skillPath);

    // Read SKILL.md content
    const content = await fs.readFile(skillFilePath, 'utf-8');
    const frontmatter = parseSkillFrontmatter(content);

    if (!frontmatter) {
      logger.warn(`Shared skill ${skillName} missing frontmatter, skipping`);
      continue;
    }

    // Build skill object
    const fullSkill: Skill = {
      name: skillName,
      namespace,
      fullName: skillFullName,
      version,
      description: frontmatter.description,
      category: 'general',
      tags: [],
      dependencies: [],
      files: [
        {
          path: 'SKILL.md',
          type: 'skill',
          content,
        },
      ],
    };

    // Write individual skill JSON to registry/skills/aico/_shared/
    const skillOutputDir = path.join(
      outputPath,
      'skills',
      registry.replace('@', ''),
      '_shared'
    );
    await fs.ensureDir(skillOutputDir);
    await fs.writeJson(
      path.join(skillOutputDir, `${skillName}.json`),
      fullSkill,
      { spaces: 2 }
    );

    // Add to skills index
    skillsIndex.push({
      name: skillName,
      namespace,
      fullName: skillFullName,
      version,
      description: frontmatter.description,
      category: 'general',
      tags: [],
    });
  }

  return skillDirs.length;
}

async function runBuild(options: BuildOptions): Promise<void> {
  const { cwd, employeesDir, outputDir, schemaDir, registry, version } =
    options;

  const employeesPath = path.resolve(cwd, employeesDir);
  const outputPath = path.resolve(cwd, outputDir);
  const schemaPath = schemaDir ? path.resolve(cwd, schemaDir) : outputPath;

  // Clean output directory before building
  if (await fs.pathExists(outputPath)) {
    await fs.emptyDir(outputPath);
  }

  // Find all employee.json files (excluding _template)
  const employeeFiles = await glob('*/employee.json', {
    cwd: employeesPath,
    ignore: ['_template/**'],
  });

  if (employeeFiles.length === 0) {
    logger.warn('No employees found to build.');
    return;
  }

  const s = spinner(`Building ${employeeFiles.length} employee(s)...`).start();

  // Indexes
  const skillsIndex: SkillSummary[] = [];

  // Legacy format index
  const legacyIndex: EmployeeSummary[] = [];

  for (const employeeFile of employeeFiles) {
    const employeeName = path.dirname(employeeFile);
    const employeeDir = path.join(employeesPath, employeeName);

    try {
      // Read employee.json
      const employeeJson = await fs.readJson(
        path.join(employeeDir, 'employee.json')
      );
      const employeeSource = employeeSourceSchema.parse(employeeJson);

      const category = inferCategory(employeeName);
      const namespace = `${registry}/${employeeName}`;

      // Create employee with content to be populated (legacy format)
      const employee = {
        ...employeeSource,
        skills: employeeSource.skills.map((sk) => ({
          ...sk,
          files: sk.files.map((f) => ({ ...f, content: '' })),
        })),
        commands: employeeSource.commands.map((c) => ({
          ...c,
          files: c.files.map((f) => ({ ...f, content: '' })),
        })),
        docs: employeeSource.docs.map((d) => ({
          ...d,
          files: d.files.map((f) => ({ ...f, content: '' })),
        })),
      } as Employee;

      // Read all skill files and build skill registry
      for (const skill of employee.skills) {
        const skillFullName = `${namespace}/${skill.name}`;

        const skillFiles: Skill['files'] = [];
        let skillDescription = '';

        for (const file of skill.files) {
          const filePath = path.join(employeeDir, file.path);
          if (await fs.pathExists(filePath)) {
            const content = await fs.readFile(filePath, 'utf-8');
            file.content = content;

            // Extract description from frontmatter
            if (file.path.endsWith('SKILL.md')) {
              const frontmatter = parseSkillFrontmatter(content);
              if (frontmatter) {
                skillDescription = frontmatter.description;
              }
            }

            // Preserve directory structure relative to skill directory
            // e.g., "skills/init/references/design-system.template.md" -> "references/design-system.template.md"
            const skillPrefix = `skills/${skill.name}/`;
            const relativePath = file.path.startsWith(skillPrefix)
              ? file.path.substring(skillPrefix.length)
              : path.basename(file.path);

            // Map employee file types to skill file types
            // 'doc' and 'command' from employee.json become 'reference' in skill registry
            const skillFileType =
              file.type === 'doc' || file.type === 'command'
                ? 'reference'
                : file.type;

            skillFiles.push({
              path: relativePath,
              type: skillFileType,
              content,
            });
          } else {
            throw new Error(`Skill file not found: ${file.path}`);
          }
        }

        // Build full skill object
        const fullSkill: Skill = {
          name: skill.name,
          namespace,
          fullName: skillFullName,
          version,
          description: skillDescription,
          category,
          tags: [],
          dependencies: [],
          files: skillFiles,
        };

        // Write individual skill JSON
        const skillOutputDir = path.join(
          outputPath,
          'skills',
          registry.replace('@', ''),
          employeeName
        );
        await fs.ensureDir(skillOutputDir);
        await fs.writeJson(
          path.join(skillOutputDir, `${skill.name}.json`),
          fullSkill,
          { spaces: 2 }
        );

        // Add to skills index
        skillsIndex.push({
          name: skill.name,
          namespace,
          fullName: skillFullName,
          version,
          description: skillDescription,
          category,
          tags: [],
        });
      }

      // Read all command files
      for (const command of employee.commands) {
        for (const file of command.files) {
          const filePath = path.join(employeeDir, file.path);
          if (await fs.pathExists(filePath)) {
            file.content = await fs.readFile(filePath, 'utf-8');
          } else {
            throw new Error(`Command file not found: ${file.path}`);
          }
        }
      }

      // Read all doc files
      for (const doc of employee.docs) {
        for (const file of doc.files) {
          const filePath = path.join(employeeDir, file.path);
          if (await fs.pathExists(filePath)) {
            file.content = await fs.readFile(filePath, 'utf-8');
          } else {
            throw new Error(`Doc file not found: ${file.path}`);
          }
        }
      }

      // Write legacy employee JSON to output (for backward compatibility)
      const legacyOutputPath = path.join(outputPath, `${employee.name}.json`);
      await fs.ensureDir(outputPath);
      await fs.writeJson(legacyOutputPath, employee, { spaces: 2 });

      // Add to legacy index
      legacyIndex.push({
        name: employee.name,
        role: employee.role,
        description: employee.description,
      });

      s.text = `Built ${employee.name}`;
    } catch (error) {
      s.fail(`Failed to build ${employeeName}`);
      throw error;
    }
  }

  // Build shared skills from _shared directory
  s.text = 'Building shared skills...';
  const sharedSkillCount = await buildSharedSkills(
    employeesPath,
    outputPath,
    registry,
    version,
    skillsIndex
  );
  if (sharedSkillCount > 0) {
    s.text = `Built ${sharedSkillCount} shared skill(s)`;
  }

  // Write skills index
  const skillsIndexPath = path.join(outputPath, 'skills', 'index.json');
  await fs.ensureDir(path.dirname(skillsIndexPath));
  await fs.writeJson(skillsIndexPath, skillsIndex, { spaces: 2 });

  // Write legacy index.json (for backward compatibility)
  const legacyIndexPath = path.join(outputPath, 'index.json');
  await fs.writeJson(
    legacyIndexPath,
    { employees: legacyIndex },
    { spaces: 2 }
  );

  // Build JSON schemas
  s.text = 'Building JSON schemas...';
  await buildSchemas(schemaPath);

  s.succeed(`Built ${employeeFiles.length} employee(s) to ${outputDir}/`);

  logger.break();
  logger.success('Registry build complete!');
  logger.dim(`  Skills: ${skillsIndex.length} (${sharedSkillCount} shared)`);
  logger.dim(`  Employees: ${legacyIndex.length}`);
  logger.break();
  for (const emp of legacyIndex) {
    logger.dim(`  - ${emp.name}: ${emp.role}`);
  }
}

export const build = new Command()
  .name('build')
  .description('Build registry from employees directory')
  .option(
    '-e, --employees-dir <dir>',
    'Employees source directory',
    'employees'
  )
  .option('-o, --output-dir <dir>', 'Output directory', 'registry')
  .option(
    '-s, --schema-dir <dir>',
    'Schema output directory (defaults to output-dir)'
  )
  .option('-r, --registry <name>', 'Registry namespace', '@the-aico')
  .option('-v, --version <version>', 'Version number', '1.0.0')
  .option('-c, --cwd <cwd>', 'Working directory', process.cwd())
  .action(async (opts) => {
    try {
      const options = buildOptionsSchema.parse({
        cwd: opts.cwd,
        employeesDir: opts.employeesDir,
        outputDir: opts.outputDir,
        schemaDir: opts.schemaDir,
        registry: opts.registry,
        version: opts.version,
      });

      await runBuild(options);
    } catch (error) {
      handleError(error);
    }
  });

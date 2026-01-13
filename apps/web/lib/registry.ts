import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// 项目根目录下的 employees 目录
const EMPLOYEES_DIR = path.join(process.cwd(), '..', '..', 'employees');

export interface Skill {
  name: string;
  fullName: string;
  description: string;
  category: string;
  tags: string[];
  usedBy?: string[]; // 哪些员工使用了这个技能（仅用于 shared 技能）
}

export interface Employee {
  name: string;
  fullName: string;
  role: string;
  description: string;
  skills: Skill[];
  commands: { name: string; description: string }[];
}

/**
 * 从 SKILL.md 文件解析 frontmatter
 */
function parseSkillFile(
  filePath: string
): { name: string; description: string } | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);
    return {
      name: data.name || '',
      description: data.description || '',
    };
  } catch {
    return null;
  }
}

/**
 * 从 command.md 文件解析 frontmatter
 */
function parseCommandFile(filePath: string): { description: string } | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);
    return {
      description: data.description || '',
    };
  } catch {
    return null;
  }
}

/**
 * 获取所有 employees
 */
export function getEmployees(): Employee[] {
  const employees: Employee[] = [];

  // 检查目录是否存在
  if (!fs.existsSync(EMPLOYEES_DIR)) {
    console.warn(`Employees directory not found: ${EMPLOYEES_DIR}`);
    return [];
  }

  const dirs = fs
    .readdirSync(EMPLOYEES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'));

  for (const dir of dirs) {
    const employeeJsonPath = path.join(
      EMPLOYEES_DIR,
      dir.name,
      'employee.json'
    );

    if (!fs.existsSync(employeeJsonPath)) {
      continue;
    }

    try {
      const employeeJson = JSON.parse(
        fs.readFileSync(employeeJsonPath, 'utf-8')
      );
      const category = dir.name;

      // 解析 skills
      const skills: Skill[] = [];
      for (const skill of employeeJson.skills || []) {
        const skillFile = skill.files?.find(
          (f: { type: string }) => f.type === 'skill'
        );
        if (skillFile) {
          const skillPath = path.join(EMPLOYEES_DIR, dir.name, skillFile.path);
          const parsed = parseSkillFile(skillPath);
          if (parsed) {
            // 从 description 中提取第一行作为简短描述
            const shortDesc = parsed.description.split('\n')[0].trim();
            skills.push({
              name: skill.name,
              fullName: `@the-aico/${category}/${skill.name}`,
              description: shortDesc,
              category,
              tags: extractTags(parsed.description),
            });
          }
        }
      }

      // 解析 commands
      const commands: { name: string; description: string }[] = [];
      for (const cmd of employeeJson.commands || []) {
        const cmdFile = cmd.files?.find(
          (f: { type: string }) => f.type === 'command'
        );
        if (cmdFile) {
          const cmdPath = path.join(EMPLOYEES_DIR, dir.name, cmdFile.path);
          const parsed = parseCommandFile(cmdPath);
          commands.push({
            name: `/${category}.${cmd.name}`,
            description: parsed?.description || '',
          });
        }
      }

      employees.push({
        name: category,
        fullName: `@the-aico/${category}`,
        role: employeeJson.role || category,
        description: employeeJson.description || '',
        skills,
        commands,
      });
    } catch (e) {
      console.error(`Error parsing employee ${dir.name}:`, e);
    }
  }

  return employees;
}

/**
 * 获取 shared skills 及其使用者
 */
export function getSharedSkills(): Skill[] {
  const sharedDir = path.join(EMPLOYEES_DIR, '_shared', 'skills');

  if (!fs.existsSync(sharedDir)) {
    return [];
  }

  // 首先收集所有员工的 dependencies
  const employeeDependencies: Record<string, string[]> = {};
  const employeeDirs = fs
    .readdirSync(EMPLOYEES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'));

  for (const dir of employeeDirs) {
    const employeeJsonPath = path.join(
      EMPLOYEES_DIR,
      dir.name,
      'employee.json'
    );
    if (fs.existsSync(employeeJsonPath)) {
      try {
        const employeeJson = JSON.parse(
          fs.readFileSync(employeeJsonPath, 'utf-8')
        );
        employeeDependencies[dir.name] = employeeJson.dependencies || [];
      } catch {
        // ignore parse errors
      }
    }
  }

  // 解析 shared skills
  const skills: Skill[] = [];
  const skillDirs = fs
    .readdirSync(sharedDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const skillDir of skillDirs) {
    const skillPath = path.join(sharedDir, skillDir.name, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      continue;
    }

    const parsed = parseSkillFile(skillPath);
    if (!parsed) {
      continue;
    }

    const shortDesc = parsed.description.split('\n')[0].trim();
    const fullName = `@the-aico/_shared/${skillDir.name}`;

    // 找出哪些员工使用了这个技能
    const usedBy: string[] = [];
    for (const [employeeName, deps] of Object.entries(employeeDependencies)) {
      if (deps.includes(fullName)) {
        usedBy.push(employeeName);
      }
    }

    skills.push({
      name: skillDir.name,
      fullName,
      description: shortDesc,
      category: 'shared',
      tags: extractTags(parsed.description),
      usedBy,
    });
  }

  return skills;
}

/**
 * 获取所有 skills
 */
export function getSkills(): Skill[] {
  const employees = getEmployees();
  const employeeSkills = employees.flatMap((e) => e.skills);
  const sharedSkills = getSharedSkills();
  return [...employeeSkills, ...sharedSkills];
}

/**
 * 根据 category 获取 skills
 */
export function getSkillsByCategory(category?: string): Skill[] {
  const skills = getSkills();
  if (!category || category === 'all') {
    return skills;
  }
  return skills.filter((s) => s.category === category);
}

/**
 * 根据 fullName 获取单个 skill 详情
 */
export function getSkillByFullName(fullName: string): Skill | null {
  const skills = getSkills();
  return skills.find((s) => s.fullName === fullName) || null;
}

/**
 * 根据 fullName 获取单个 employee 详情
 */
export function getEmployeeByFullName(fullName: string): Employee | null {
  const employees = getEmployees();
  return employees.find((e) => e.fullName === fullName) || null;
}

/**
 * 从 description 中提取 tags
 */
function extractTags(description: string): string[] {
  const tags: string[] = [];
  const lowerDesc = description.toLowerCase();

  // 基于关键词提取 tags
  const tagKeywords: Record<string, string[]> = {
    ideation: ['idea', 'brainstorm', 'explore'],
    planning: ['plan', 'strategy', 'roadmap'],
    requirements: ['requirement', 'spec', 'need'],
    analysis: ['analysis', 'analyze', 'research'],
    documentation: ['document', 'prd', 'spec'],
    agile: ['story', 'sprint', 'agile'],
    testing: ['test', 'acceptance', 'criteria'],
    review: ['review', 'acceptance', 'verify'],
    design: ['design', 'ui', 'ux', 'component'],
    react: ['react', 'component', 'frontend'],
    typescript: ['typescript', 'type'],
    css: ['css', 'style', 'tailwind'],
    debug: ['debug', 'troubleshoot', 'fix'],
    tdd: ['tdd', 'test-driven'],
    architecture: ['architecture', 'structure', 'plan'],
    api: ['api', 'endpoint', 'rest'],
    nodejs: ['node', 'backend', 'server'],
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some((kw) => lowerDesc.includes(kw))) {
      tags.push(tag);
    }
  }

  return tags.slice(0, 3); // 最多返回 3 个 tags
}

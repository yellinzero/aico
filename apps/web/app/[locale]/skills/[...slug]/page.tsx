import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GitBranch } from 'lucide-react';
import matter from 'gray-matter';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeCopyButton } from '@/components/code-copy-button';

// 项目根目录下的 employees 目录
const EMPLOYEES_DIR = path.join(process.cwd(), '..', '..', 'employees');

interface SkillData {
  name: string;
  fullName: string;
  description: string;
  category: string;
  content: string;
  dependencies?: string[];
}

function getSkillData(category: string, skillName: string): SkillData | null {
  const skillPath = path.join(
    EMPLOYEES_DIR,
    category,
    'skills',
    skillName,
    'SKILL.md'
  );

  if (!fs.existsSync(skillPath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(skillPath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      name: skillName,
      fullName: `@the-aico/${category}/${skillName}`,
      description: data.description || '',
      category,
      content,
      dependencies: data.dependencies || [],
    };
  } catch {
    return null;
  }
}

// Employee 信息映射
const employeeInfo: Record<
  string,
  { name: string; fullName: string; role: string }
> = {
  pm: { name: 'pm', fullName: '@the-aico/pm', role: 'Product Manager' },
  frontend: {
    name: 'frontend',
    fullName: '@the-aico/frontend',
    role: 'Frontend Engineer',
  },
  backend: {
    name: 'backend',
    fullName: '@the-aico/backend',
    role: 'Backend Engineer',
  },
};

interface SkillDetailPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function SkillDetailPage({
  params,
}: SkillDetailPageProps) {
  const { slug } = await params;

  // slug 格式: ["aico", "pm", "brainstorming"] 或 ["aico", "frontend", "design"]
  if (slug.length < 3 || slug[0] !== 'aico') {
    notFound();
  }

  const category = slug[1];
  const skillName = slug.slice(2).join('/');

  const skill = getSkillData(category, skillName);

  if (!skill) {
    notFound();
  }

  const employee = employeeInfo[category];
  const installCommand = `aico add ${skill.fullName}`;

  // 从 description 中提取第一行作为简短描述
  const shortDescription = skill.description.split('\n')[0].trim();

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/skills">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回 Skills 列表
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold">{skill.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {skill.fullName}
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {skill.category.toUpperCase()}
            </Badge>
          </div>

          <p className="mb-6 text-lg text-muted-foreground">
            {shortDescription}
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <h2>关于这个技能</h2>
            <div className="whitespace-pre-line">{skill.description}</div>

            {skill.content && (
              <>
                <h2>详细说明</h2>
                <div
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ __html: skill.content }}
                />
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">安装</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 font-mono text-sm">
                <span className="flex-1 truncate">{installCommand}</span>
                <CodeCopyButton code={installCommand} />
              </div>

              {employee && (
                <>
                  <div className="text-sm text-muted-foreground">
                    <p>或者添加整个 {employee.role} employee：</p>
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 font-mono">
                      <span className="flex-1 truncate">
                        aico add {employee.fullName}
                      </span>
                      <CodeCopyButton
                        code={`aico add ${employee.fullName}`}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="mb-2 text-sm font-medium">包含在</h4>
                    <Link
                      href={`/employees/aico/${employee.name}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {employee.fullName} ({employee.role})
                    </Link>
                  </div>
                </>
              )}

              {/* 依赖关系展示 */}
              {skill.dependencies && skill.dependencies.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <GitBranch className="h-4 w-4" />
                    依赖
                  </h4>
                  <ul className="space-y-1">
                    {skill.dependencies.map((dep) => (
                      <li key={dep}>
                        <Link
                          href={`/skills/${dep.replace('@', '')}`}
                          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                        >
                          {dep}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

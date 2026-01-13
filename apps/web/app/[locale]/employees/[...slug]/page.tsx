import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Terminal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CodeCopyButton } from '@/components/code-copy-button';
import { getEmployeeByFullName } from '@/lib/registry';

interface EmployeeDetailPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const { slug } = await params;

  // slug 格式: ["aico", "pm"] 或 ["aico", "frontend"]
  if (slug.length < 2 || slug[0] !== 'aico') {
    notFound();
  }

  const employeeName = slug[1];
  const fullName = `@the-aico/${employeeName}`;

  const employee = getEmployeeByFullName(fullName);

  if (!employee) {
    notFound();
  }

  const installCommand = `aico add ${employee.fullName}`;

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/employees">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回 Employees 列表
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h1 className="text-3xl font-bold">{employee.role}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {employee.fullName}
            </p>
          </div>

          <p className="mb-6 text-lg text-muted-foreground">
            {employee.description}
          </p>

          <div className="mb-8 flex gap-2">
            <Badge variant="secondary">{employee.skills.length} skills</Badge>
            <Badge variant="outline">{employee.commands.length} commands</Badge>
          </div>

          <Separator className="my-8" />

          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Skills</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {employee.skills.map((skill) => (
                <Link
                  key={skill.fullName}
                  href={`/skills/${skill.fullName.replace('@', '')}`}
                  className="block rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <h3 className="font-medium">{skill.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {skill.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          <div>
            <h2 className="mb-4 text-xl font-semibold">Commands</h2>
            <div className="space-y-3">
              {employee.commands.map((cmd) => (
                <div
                  key={cmd.name}
                  className="flex items-start gap-3 rounded-lg border p-4"
                >
                  <Terminal className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <code className="font-mono font-medium">{cmd.name}</code>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cmd.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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

              <div className="text-sm text-muted-foreground">
                <p>安装后你将获得：</p>
                <ul className="mt-2 space-y-1">
                  <li>• {employee.skills.length} 个专业技能</li>
                  <li>• {employee.commands.length} 个快捷命令</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-2 text-sm font-medium">快速开始</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. 运行安装命令</p>
                  <p>2. 在 Claude Code 中使用技能</p>
                  <p>3. 使用命令快速触发工作流</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

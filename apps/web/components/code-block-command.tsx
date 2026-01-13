'use client';

import * as React from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useConfig, type PackageManager } from '@/hooks/use-config';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface CodeBlockCommandProps {
  npm: string;
  pnpm?: string;
  yarn?: string;
  bun?: string;
  className?: string;
}

function convertCommand(baseCommand: string, pm: PackageManager): string {
  // 处理 npx 命令
  if (baseCommand.startsWith('npx ')) {
    const rest = baseCommand.slice(4);
    switch (pm) {
      case 'npm':
        return `npx ${rest}`;
      case 'pnpm':
        return `pnpm dlx ${rest}`;
      case 'yarn':
        return `yarn dlx ${rest}`;
      case 'bun':
        return `bunx ${rest}`;
    }
  }

  // 处理 npm install 命令
  if (baseCommand.startsWith('npm install ')) {
    const rest = baseCommand.slice(12);
    switch (pm) {
      case 'npm':
        return `npm install ${rest}`;
      case 'pnpm':
        return `pnpm add ${rest}`;
      case 'yarn':
        return `yarn add ${rest}`;
      case 'bun':
        return `bun add ${rest}`;
    }
  }

  // 处理 npm i 命令
  if (baseCommand.startsWith('npm i ')) {
    const rest = baseCommand.slice(6);
    switch (pm) {
      case 'npm':
        return `npm i ${rest}`;
      case 'pnpm':
        return `pnpm add ${rest}`;
      case 'yarn':
        return `yarn add ${rest}`;
      case 'bun':
        return `bun add ${rest}`;
    }
  }

  // 其他命令按原样返回
  return baseCommand;
}

export function CodeBlockCommand({
  npm,
  pnpm,
  yarn,
  bun,
  className,
}: CodeBlockCommandProps) {
  const [config, setConfig] = useConfig();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const packageManager = config.packageManager || 'pnpm';

  // 获取各包管理器的命令
  const commands: Record<PackageManager, string> = {
    npm: npm,
    pnpm: pnpm || convertCommand(npm, 'pnpm'),
    yarn: yarn || convertCommand(npm, 'yarn'),
    bun: bun || convertCommand(npm, 'bun'),
  };

  const currentCommand = commands[packageManager];

  const handleTabChange = (value: string) => {
    setConfig({ ...config, packageManager: value as PackageManager });
  };

  return (
    <div className={cn('not-prose relative my-4', className)}>
      <Tabs value={packageManager} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between rounded-t-lg border border-b-0 bg-muted/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <TabsList className="h-7 bg-transparent p-0">
              <TabsTrigger
                value="pnpm"
                className="h-6 rounded-sm px-2 text-xs data-[state=active]:bg-background"
              >
                pnpm
              </TabsTrigger>
              <TabsTrigger
                value="npm"
                className="h-6 rounded-sm px-2 text-xs data-[state=active]:bg-background"
              >
                npm
              </TabsTrigger>
              <TabsTrigger
                value="yarn"
                className="h-6 rounded-sm px-2 text-xs data-[state=active]:bg-background"
              >
                yarn
              </TabsTrigger>
              <TabsTrigger
                value="bun"
                className="h-6 rounded-sm px-2 text-xs data-[state=active]:bg-background"
              >
                bun
              </TabsTrigger>
            </TabsList>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => copyToClipboard(currentCommand)}
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">Copy</span>
          </Button>
        </div>
        {(['pnpm', 'npm', 'yarn', 'bun'] as const).map((pm) => (
          <TabsContent key={pm} value={pm} className="mt-0">
            <div className="rounded-b-lg border bg-zinc-950 px-4 py-3 text-zinc-50">
              <code className="text-sm font-mono">{commands[pm]}</code>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

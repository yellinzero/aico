'use client';

import * as React from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useConfig, type PackageManager } from '@/hooks/use-config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const QUICK_START_CODES: Record<PackageManager, string> = {
  npm: `# Install CLI globally
npm install -g @the-aico/cli

# Initialize project
aico init

# Add PM employee (includes all skills)
aico add pm

# Or install a single skill
aico add @the-aico/pm/brainstorming

# List installed employees
aico list --installed`,
  pnpm: `# Install CLI globally
pnpm add -g @the-aico/cli

# Initialize project
aico init

# Add PM employee (includes all skills)
aico add pm

# Or install a single skill
aico add @the-aico/pm/brainstorming

# List installed employees
aico list --installed`,
  yarn: `# Install CLI globally
yarn global add @the-aico/cli

# Initialize project
aico init

# Add PM employee (includes all skills)
aico add pm

# Or install a single skill
aico add @the-aico/pm/brainstorming

# List installed employees
aico list --installed`,
  bun: `# Install CLI globally
bun add -g @the-aico/cli

# Initialize project
aico init

# Add PM employee (includes all skills)
aico add pm

# Or install a single skill
aico add @the-aico/pm/brainstorming

# List installed employees
aico list --installed`,
};

interface QuickStartCodeProps {
  className?: string;
}

export function QuickStartCode({ className }: QuickStartCodeProps) {
  const [config, setConfig] = useConfig();
  const [hasCopied, setHasCopied] = React.useState(false);

  const packageManager = config.packageManager || 'npm';
  const code = QUICK_START_CODES[packageManager];

  const copyCode = React.useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  }, [code]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-zinc-950 text-zinc-50',
        className
      )}
    >
      <Tabs
        value={packageManager}
        onValueChange={(value) => {
          setConfig({
            ...config,
            packageManager: value as PackageManager,
          });
        }}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <TabsList className="h-7 bg-transparent p-0">
              <TabsTrigger
                value="npm"
                className="h-6 rounded px-2 text-xs text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50"
              >
                npm
              </TabsTrigger>
              <TabsTrigger
                value="pnpm"
                className="h-6 rounded px-2 text-xs text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50"
              >
                pnpm
              </TabsTrigger>
              <TabsTrigger
                value="yarn"
                className="h-6 rounded px-2 text-xs text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50"
              >
                yarn
              </TabsTrigger>
              <TabsTrigger
                value="bun"
                className="h-6 rounded px-2 text-xs text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50"
              >
                bun
              </TabsTrigger>
            </TabsList>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
            onClick={copyCode}
          >
            {hasCopied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        {(['npm', 'pnpm', 'yarn', 'bun'] as const).map((pm) => (
          <TabsContent key={pm} value={pm} className="mt-0">
            <pre className="overflow-x-auto p-4">
              <code className="text-sm font-mono leading-relaxed whitespace-pre">
                {QUICK_START_CODES[pm]}
              </code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

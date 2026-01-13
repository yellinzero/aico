'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useConfig, type PackageManager } from '@/hooks/use-config';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const INSTALL_COMMANDS: Record<PackageManager, string> = {
  npm: 'npm i -g @the-aico/cli && aico init && aico add pm',
  pnpm: 'pnpm add -g @the-aico/cli && aico init && aico add pm',
  yarn: 'yarn global add @the-aico/cli && aico init && aico add pm',
  bun: 'bun add -g @the-aico/cli && aico init && aico add pm',
};

interface QuickInstallProps {
  className?: string;
}

export function QuickInstall({ className }: QuickInstallProps) {
  const [config, setConfig] = useConfig();
  const [hasCopied, setHasCopied] = React.useState(false);

  const packageManager = config.packageManager || 'npm';
  const command = INSTALL_COMMANDS[packageManager];

  const copyCommand = React.useCallback(async () => {
    await navigator.clipboard.writeText(command);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  }, [command]);

  return (
    <div className={cn('mt-8', className)}>
      <Tabs
        value={packageManager}
        onValueChange={(value) => {
          setConfig({
            ...config,
            packageManager: value as PackageManager,
          });
        }}
        className="w-full"
      >
        <div className="flex justify-center mb-3">
          <TabsList className="h-8 bg-muted/50">
            <TabsTrigger value="npm" className="text-xs px-3">
              npm
            </TabsTrigger>
            <TabsTrigger value="pnpm" className="text-xs px-3">
              pnpm
            </TabsTrigger>
            <TabsTrigger value="yarn" className="text-xs px-3">
              yarn
            </TabsTrigger>
            <TabsTrigger value="bun" className="text-xs px-3">
              bun
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
          <code className="font-mono text-sm">{command}</code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={copyCommand}
          >
            {hasCopied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </Tabs>
    </div>
  );
}

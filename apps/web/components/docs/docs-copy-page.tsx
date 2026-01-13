'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Button } from '@/components/ui/button';

interface DocsCopyPageProps {
  content: string;
}

export function DocsCopyPage({ content }: DocsCopyPageProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
      onClick={() => copyToClipboard(content)}
    >
      {isCopied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      <span className="text-xs">Copy Page</span>
    </Button>
  );
}

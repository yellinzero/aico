'use client';

import * as React from 'react';

export function useCopyToClipboard({ timeout = 2000 } = {}) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = React.useCallback(
    async (value: string) => {
      if (!navigator?.clipboard?.writeText) {
        return;
      }

      try {
        await navigator.clipboard.writeText(value);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), timeout);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    },
    [timeout]
  );

  return { isCopied, copyToClipboard };
}

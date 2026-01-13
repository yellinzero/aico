'use client';

import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

interface Config {
  packageManager: PackageManager;
}

const configAtom = atomWithStorage<Config>('aico-config', {
  packageManager: 'pnpm',
});

export function useConfig() {
  return useAtom(configAtom);
}

export type { Config, PackageManager };

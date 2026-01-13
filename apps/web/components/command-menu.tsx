'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, FileText, Users, CornerDownLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

// 检测是否为 Mac 系统
function useIsMac() {
  const [isMac, setIsMac] = React.useState(true);

  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return isMac;
}

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const locale = useLocale();
  const isMac = useIsMac();
  const t = useTranslations('CommandMenu');

  // 搜索数据使用翻译
  const searchData = React.useMemo(
    () => ({
      pages: [
        { name: t('home'), href: `/${locale}` },
        { name: t('docs'), href: `/${locale}/docs` },
        { name: t('employees'), href: `/${locale}/employees` },
        { name: t('skills'), href: `/${locale}/skills` },
      ],
      gettingStarted: [
        { name: t('introduction'), href: `/${locale}/docs/introduction` },
        { name: t('installation'), href: `/${locale}/docs/installation` },
        { name: t('cli'), href: `/${locale}/docs/cli` },
      ],
      employees: [
        {
          name: t('productManager'),
          shortName: 'PM',
          href: `/${locale}/employees/aico/pm`,
        },
        {
          name: t('frontendEngineer'),
          shortName: 'Frontend',
          href: `/${locale}/employees/aico/frontend`,
        },
        {
          name: t('backendEngineer'),
          shortName: 'Backend',
          href: `/${locale}/employees/aico/backend`,
        },
      ],
    }),
    [locale, t]
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          'relative h-8 w-full justify-start rounded-md bg-muted/50 pl-3 text-sm font-normal text-muted-foreground shadow-none hover:bg-accent hover:text-accent-foreground sm:pr-12 md:w-48 lg:w-56 xl:w-64'
        )}
      >
        <span className="hidden lg:inline-flex">{t('searchPlaceholder')}</span>
        <span className="inline-flex lg:hidden">{t('searchShort')}</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          {isMac ? '⌘' : 'Ctrl'}+K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t('searchPlaceholder')}
        description={t('searchPlaceholder')}
      >
        <CommandInput placeholder={t('searchPlaceholder')} />
        <CommandList>
          <CommandEmpty>{t('noResults')}</CommandEmpty>
          <CommandGroup heading={t('pages')}>
            {searchData.pages.map((item) => (
              <CommandItem
                key={item.href}
                value={item.name}
                onSelect={() => runCommand(() => router.push(item.href))}
                className="gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t('gettingStarted')}>
            {searchData.gettingStarted.map((item) => (
              <CommandItem
                key={item.href}
                value={item.name}
                onSelect={() => runCommand(() => router.push(item.href))}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t('employees')}>
            {searchData.employees.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.name} ${item.shortName}`}
                onSelect={() => runCommand(() => router.push(item.href))}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <div className="flex h-10 items-center gap-2 border-t bg-muted/50 px-4 text-xs font-medium text-muted-foreground">
          <kbd className="flex h-5 items-center justify-center gap-1 rounded border bg-background px-1 font-sans text-[0.7rem] font-medium">
            <CornerDownLeft className="h-3 w-3" />
          </kbd>
          <span>{t('goToPage')}</span>
        </div>
      </CommandDialog>
    </>
  );
}

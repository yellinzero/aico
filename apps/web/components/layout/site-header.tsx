'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { siteConfig } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { CommandMenu } from '@/components/command-menu';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ModeSwitcher } from '@/components/mode-switcher';
import { Logo } from '@/components/logo';
import { GitHubIcon } from '@/components/icons/github';

export function SiteHeader() {
  const t = useTranslations('Navigation');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center">
          <Logo size="md" />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/skills"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('skills')}
          </Link>
          <Link
            href="/employees"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('employees')}
          </Link>
          <Link
            href="/docs"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('docs')}
          </Link>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center space-x-2">
          <CommandMenu />
          <LanguageSwitcher />
          <ModeSwitcher />
          <Button variant="ghost" size="icon" asChild>
            <a href={siteConfig.links.github} target="_blank" rel="noreferrer">
              <GitHubIcon />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

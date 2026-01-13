'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { siteConfig } from '@/lib/config';
import { Logo } from '@/components/logo';

export function SiteFooter() {
  const t = useTranslations('Footer');

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center">
              <Logo size="md" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-50">
              {t('tagline')}
            </p>
          </div>

          {/* Documentation */}
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('documentation')}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/docs"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('introduction')}
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/installation"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('gettingStarted')}
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/cli"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('cliReference')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Registry */}
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('registry')}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/skills"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('skills')}
                </Link>
              </li>
              <li>
                <Link
                  href="/employees"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('employees')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('community')}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                >
                  {t('github')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}

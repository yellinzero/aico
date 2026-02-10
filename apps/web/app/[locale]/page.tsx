import { getTranslations } from 'next-intl/server';
import { ArrowRight, Blocks, Globe, Package, Sparkles } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { QuickInstall } from '@/components/quick-install';
import { QuickStartCode } from '@/components/quick-start-code';
import { Logo } from '@/components/logo';
import {
  jsonLdOrganization,
  jsonLdWebsite,
  jsonLdSoftwareApplication,
} from '@/lib/json-ld';
import { getEmployees } from '@/lib/registry';

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  const employees = getEmployees();

  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSoftwareApplication),
        }}
      />

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-4 py-24 md:py-32">
        {/* Logo */}
        <Logo size="lg" className="mb-4" />

        {/* Slogan */}
        <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {t('hero.title')}
        </h1>

        {/* Subtitle */}
        <p className="max-w-[42rem] text-center text-lg text-muted-foreground sm:text-xl">
          {t('hero.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/docs/installation">{t('hero.getStarted')}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a
              href="https://github.com/yellinzero/aico"
              target="_blank"
              rel="noreferrer"
            >
              {t('hero.viewOnGitHub')}
            </a>
          </Button>
        </div>

        {/* Quick install command */}
        <QuickInstall />
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('features.title')}
          </h2>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Blocks className="h-10 w-10 text-primary" />
              <h3 className="mt-4 font-semibold leading-none tracking-tight">
                {t('features.skills.title')}
              </h3>
              <CardDescription>
                {t('features.skills.description')}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-primary" />
              <h3 className="mt-4 font-semibold leading-none tracking-tight">
                {t('features.employees.title')}
              </h3>
              <CardDescription>
                {t('features.employees.description')}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Package className="h-10 w-10 text-primary" />
              <h3 className="mt-4 font-semibold leading-none tracking-tight">
                {t('features.cli.title')}
              </h3>
              <CardDescription>{t('features.cli.description')}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary" />
              <h3 className="mt-4 font-semibold leading-none tracking-tight">
                {t('features.openSource.title')}
              </h3>
              <CardDescription>
                {t('features.openSource.description')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('quickStart.title')}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('quickStart.description')}
            </p>
          </div>

          <QuickStartCode />
        </div>
      </section>

      {/* Employees Preview Section */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {employees.map((emp) => (
            <Link key={emp.name} href={`/docs/${emp.name}`} className="block">
              <Card className="relative h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{emp.role}</CardTitle>
                  <CardDescription>{emp.fullName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 flex gap-4 text-sm">
                    <span>
                      {emp.skills.length} {t('employeesPreview.skills')}
                    </span>
                    <span>
                      {emp.commands.length} {t('employeesPreview.commands')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/employees">
              {t('hero.browseSkills')} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

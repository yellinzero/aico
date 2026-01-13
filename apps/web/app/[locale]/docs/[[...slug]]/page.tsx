import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { getDoc, extractToc, getPrevNextDocs } from '@/lib/docs';
import { DocContent } from '@/components/docs/doc-content';
import { DocToc } from '@/components/docs/doc-toc';
import { DocsCopyPage } from '@/components/docs/docs-copy-page';
import { Button } from '@/components/ui/button';

interface DocsSlugPageProps {
  params: Promise<{ locale: string; slug?: string[] }>;
}

// 文档首页内容
async function DocsIndexPage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Docs' });

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>{t('title')}</h1>

      <p className="lead">{t('description')}</p>

      <h2>{t('whatIsAico')}</h2>

      <p>{t('whatIsAicoDesc')}</p>

      <h2>{t('quickStart')}</h2>

      <p>{t('quickStartDesc')}</p>

      <div className="not-prose">
        <div className="rounded-lg border bg-muted/50 p-4 font-mono text-sm">
          <div className="text-muted-foreground">
            # 1. {t('initializeProject')}
          </div>
          <div>aico init</div>
          <div className="mt-4 text-muted-foreground">
            # 2. {t('addEmployee')}
          </div>
          <div>aico add @the-aico/pm</div>
          <div className="mt-4 text-muted-foreground">
            # 3. {t('startUsing')}
          </div>
          <div>{t('startUsingDesc')}</div>
        </div>
      </div>

      <h2>{t('nextSteps')}</h2>

      <ul>
        <li>
          <a href={`/${locale}/docs/getting-started`}>
            {t('gettingStartedGuide')}
          </a>
        </li>
        <li>
          <a href={`/${locale}/docs/cli/index`}>{t('cliReference')}</a>
        </li>
        <li>
          <a href={`/${locale}/skills`}>{t('browseSkills')}</a>
        </li>
        <li>
          <a href={`/${locale}/employees`}>{t('browseEmployees')}</a>
        </li>
      </ul>
    </div>
  );
}

export default async function DocsSlugPage({ params }: DocsSlugPageProps) {
  const { locale, slug } = await params;

  // 根路径 /docs 显示首页
  if (!slug || slug.length === 0) {
    return <DocsIndexPage locale={locale} />;
  }

  const slugPath = slug.join('/');
  const doc = getDoc(slugPath, locale);

  if (!doc) {
    notFound();
  }

  const toc = extractToc(doc.content);
  const { prev, next } = getPrevNextDocs(slugPath, locale);
  const t = await getTranslations({ locale, namespace: 'Docs' });

  return (
    <div className="flex gap-10">
      <div className="flex-1 min-w-0">
        {/* 顶部导航栏 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{doc.title}</h1>
            {doc.description && (
              <p className="mt-2 text-lg text-muted-foreground">
                {doc.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DocsCopyPage content={`# ${doc.title}\n\n${doc.content}`} />
            {prev && (
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href={`/${locale}/docs/${prev.slug}`}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">{t('previous')}</span>
                </Link>
              </Button>
            )}
            {next && (
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href={`/${locale}/docs/${next.slug}`}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">{t('next')}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        <DocContent content={doc.content} />

        {/* 底部上下篇导航 */}
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          {prev ? (
            <Button variant="ghost" asChild className="gap-2">
              <Link href={`/${locale}/docs/${prev.slug}`}>
                <ChevronLeft className="h-4 w-4" />
                <span>{prev.title}</span>
              </Link>
            </Button>
          ) : (
            <div />
          )}
          {next ? (
            <Button variant="ghost" asChild className="gap-2">
              <Link href={`/${locale}/docs/${next.slug}`}>
                <span>{next.title}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>

      <div className="w-56 shrink-0 hidden xl:block">
        <DocToc items={toc} />
      </div>
    </div>
  );
}

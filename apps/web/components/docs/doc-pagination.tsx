import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import type { DocMeta } from '@/lib/docs';

interface DocPaginationProps {
  prev: DocMeta | null;
  next: DocMeta | null;
  locale: string;
}

export async function DocPagination({
  prev,
  next,
  locale,
}: DocPaginationProps) {
  const t = await getTranslations({ locale, namespace: 'Docs' });

  return (
    <div className="mt-12 flex items-center justify-between border-t pt-6">
      {prev ? (
        <Button variant="ghost" asChild className="gap-2">
          <Link href={`/${locale}/docs/${prev.slug}`}>
            <ChevronLeft className="h-4 w-4" />
            <div className="text-left">
              <div className="text-xs text-muted-foreground">
                {t('previous')}
              </div>
              <div className="text-sm font-medium">{prev.title}</div>
            </div>
          </Link>
        </Button>
      ) : (
        <div />
      )}
      {next ? (
        <Button variant="ghost" asChild className="gap-2">
          <Link href={`/${locale}/docs/${next.slug}`}>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">{t('next')}</div>
              <div className="text-sm font-medium">{next.title}</div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { TocItem } from '@/lib/docs';

interface DocTocProps {
  items: TocItem[];
}

export function DocToc({ items }: DocTocProps) {
  const t = useTranslations('Docs');

  if (items.length === 0) return null;

  return (
    <div className="hidden xl:block">
      <div className="sticky top-20">
        <h4 className="mb-3 text-sm font-medium">{t('toc')}</h4>
        <nav className="space-y-1">
          {items.map((item, index) => (
            <a
              key={`${item.id}-${index}`}
              href={`#${item.id}`}
              className={cn(
                'block text-sm text-muted-foreground hover:text-foreground transition-colors py-1',
                item.level === 3 && 'pl-4'
              )}
            >
              {item.title}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

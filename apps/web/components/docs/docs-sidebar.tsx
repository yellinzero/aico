'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavItem =
  | { title: string; slug: string }
  | { title: string; items: Array<{ title: string; slug: string }> };

interface DocsSidebarProps {
  locale: string;
  nav: NavItem[];
}

export function DocsSidebar({ locale, nav }: DocsSidebarProps) {
  const pathname = usePathname();

  // 从 pathname 提取当前 slug（处理有无 locale 前缀的情况）
  const currentPath = pathname
    .replace(`/${locale}/docs/`, '')
    .replace(`/${locale}/docs`, '')
    .replace('/docs/', '')
    .replace('/docs', '');

  return (
    <aside className="w-56 shrink-0 hidden lg:block">
      <nav className="sticky top-20 space-y-4">
        {nav.map((item) => {
          // 单个链接项
          if ('slug' in item && item.slug) {
            const isActive = currentPath === item.slug;
            return (
              <div key={item.slug}>
                <Link
                  href={`/${locale}/docs/${item.slug}`}
                  className={cn(
                    'flex w-full items-center rounded-md px-2 py-1.5 text-[0.8rem] font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.title}
                </Link>
              </div>
            );
          }

          // 分组项
          if ('items' in item && item.items) {
            return (
              <div key={item.title} className="space-y-1">
                <h4 className="px-2 text-sm font-medium text-muted-foreground">
                  {item.title}
                </h4>
                <div className="space-y-0.5">
                  {item.items.map((subItem) => {
                    const isActive = currentPath === subItem.slug;
                    return (
                      <Link
                        key={subItem.slug}
                        href={`/${locale}/docs/${subItem.slug}`}
                        className={cn(
                          'flex w-full items-center rounded-md px-2 py-1.5 text-[0.8rem] font-medium transition-colors',
                          isActive
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {subItem.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          return null;
        })}
      </nav>
    </aside>
  );
}

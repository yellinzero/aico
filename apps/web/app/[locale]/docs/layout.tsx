import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { getDocsNav } from '@/lib/docs';

interface DocsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DocsLayout({
  children,
  params,
}: DocsLayoutProps) {
  const { locale } = await params;
  const nav = getDocsNav(locale);

  return (
    <div className="container flex gap-10 py-10">
      <DocsSidebar locale={locale} nav={nav} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

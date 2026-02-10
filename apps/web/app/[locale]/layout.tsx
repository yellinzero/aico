import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import { GoogleAnalytics } from '@next/third-parties/google';

import { routing, type Locale } from '@/i18n/routing';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ThemeProvider } from '@/components/theme-provider';
import { geistSans, geistMono } from '@/lib/fonts';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://the-aico.com';

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'Metadata' });

  // Generate canonical URL
  const canonicalUrl =
    locale === routing.defaultLocale ? baseUrl : `${baseUrl}/${locale}`;

  // Generate hreflang alternates
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc === 'zh' ? 'zh-CN' : loc] =
      loc === routing.defaultLocale ? baseUrl : `${baseUrl}/${loc}`;
  }
  languages['x-default'] = baseUrl;

  return {
    title: {
      default: t('title'),
      template: `%s | AICO`,
    },
    description: t('description'),
    keywords: ['AI', 'Claude', 'Skills', 'Employees', 'CLI', 'aico'],
    authors: [{ name: 'AICO' }],
    creator: 'AICO',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: canonicalUrl,
      siteName: 'AICO',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <div className="relative flex min-h-screen flex-col bg-background">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster position="bottom-right" />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
    </html>
  );
}

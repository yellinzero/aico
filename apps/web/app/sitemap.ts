import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://the-aico.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/skills',
    '/employees',
    '/docs',
    '/docs/getting-started',
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Add routes for each locale
  for (const locale of routing.locales) {
    for (const route of routes) {
      const localePath =
        locale === routing.defaultLocale ? route : `/${locale}${route}`;
      sitemap.push({
        url: `${baseUrl}${localePath}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    }
  }

  return sitemap;
}

import { MetadataRoute } from 'next';
import { getAllTools } from '@/lib/tools';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

const lastModified = new Date('2026-06-29T00:00:00.000Z');

const staticPages = [
  {
    path: '/',
    priority: 1,
    changeFrequency: 'weekly',
  },
  {
    path: '/tools',
    priority: 0.9,
    changeFrequency: 'weekly',
  },
  {
    path: '/blog',
    priority: 0.5,
    changeFrequency: 'weekly',
  },
  {
    path: '/showcases',
    priority: 0.4,
    changeFrequency: 'monthly',
  },
] as const;

function getBaseUrl() {
  return envConfigs.app_url.replace(/\/$/, '');
}

function getLocalizedUrl(path: string, locale: string) {
  const baseUrl = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const localePrefix = locale === defaultLocale ? '' : `/${locale}`;

  return `${baseUrl}${localePrefix}${normalizedPath}`;
}

function getLanguageAlternates(path: string) {
  return Object.fromEntries(
    locales.map((locale) => [locale, getLocalizedUrl(path, locale)])
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages = getAllTools().map((tool) => ({
    path: tool.href,
    priority: 0.8,
    changeFrequency: 'monthly',
  })) as Array<{
    path: string;
    priority: number;
    changeFrequency: 'monthly';
  }>;
  const pages = [...staticPages, ...toolPages];

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: getLocalizedUrl(page.path, locale),
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: getLanguageAlternates(page.path),
      },
    }))
  );
}

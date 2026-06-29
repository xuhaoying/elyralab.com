import { MetadataRoute } from 'next';
import { getPublishedTools } from '@/lib/tools';

import { locales } from '@/config/locale';
import {
  getLanguageAlternates,
  getLocalizedUrl,
} from '@/shared/lib/seo';

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
    path: '/pricing',
    priority: 0.7,
    changeFrequency: 'weekly',
  },
  {
    path: '/create',
    priority: 0.7,
    changeFrequency: 'weekly',
  },
  {
    path: '/prompts',
    priority: 0.6,
    changeFrequency: 'weekly',
  },
  {
    path: '/showcases',
    priority: 0.4,
    changeFrequency: 'monthly',
  },
  {
    path: '/updates',
    priority: 0.4,
    changeFrequency: 'weekly',
  },
  {
    path: '/hairstyles',
    priority: 0.6,
    changeFrequency: 'monthly',
  },
  {
    path: '/ai-image-generator',
    priority: 0.7,
    changeFrequency: 'weekly',
  },
  {
    path: '/ai-video-generator',
    priority: 0.7,
    changeFrequency: 'weekly',
  },
  {
    path: '/ai-music-generator',
    priority: 0.7,
    changeFrequency: 'weekly',
  },
  {
    path: '/docs',
    priority: 0.4,
    changeFrequency: 'monthly',
  },
  {
    path: '/privacy-policy',
    priority: 0.2,
    changeFrequency: 'yearly',
  },
  {
    path: '/terms-of-service',
    priority: 0.2,
    changeFrequency: 'yearly',
  },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages = getPublishedTools().map((tool) => ({
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

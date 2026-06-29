import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

const privatePaths = [
  '/settings/*',
  '/activity/*',
  '/admin/*',
];

function localizedDisallowPaths() {
  return privatePaths.flatMap((path) => [
    path,
    ...locales
      .filter((locale) => locale !== defaultLocale)
      .map((locale) => `/${locale}${path}`),
  ]);
}

export default function robots(): MetadataRoute.Robots {
  const appUrl = envConfigs.app_url;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/*?*q=',
        ...localizedDisallowPaths(),
        '/api/*',
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}

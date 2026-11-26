import { MetadataRoute } from 'next';
import { getEnabledLocales } from '@/lib/languages';

export const revalidate = 86400; // Regenerate robots.txt at most once per day

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolwala.co';

  // Protect Vercel preview deployments from search engine crawling
  const isPreview = process.env.VERCEL_ENV === 'preview' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
  if (isPreview) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
      host: baseUrl,
    };
  }

  // All supported locale codes (excluding 'en' which uses root path)
  const ALL_LOCALES = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'];
  const enabledLocales = getEnabledLocales();

  // Build disallow list for disabled locale prefixes
  const disabledLocalePaths = ALL_LOCALES
    .filter((loc) => !enabledLocales.includes(loc))
    .map((loc) => `/${loc}/`);

  const baseDisallow = ['/api/', '/admin/', '/login', '/auth/'];
  const allDisallow = [...baseDisallow, ...disabledLocalePaths];
  // Only block known junk/private query params, not ALL query strings.
  // Blocking /*?* would prevent Googlebot from following UTM/share links to valid pages.
  const queryParamDisallow: string[] = [];

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog/', '/tools/', '/categories/', '/hubs/', '/landing/'],
        disallow: [...allDisallow, ...queryParamDisallow],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/blog/', '/tools/', '/categories/', '/hubs/', '/landing/'],
        disallow: [...allDisallow, ...queryParamDisallow],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/blog/', '/tools/', '/hubs/', '/landing/', '/og-image.png'],
        disallow: ['/admin/', ...disabledLocalePaths],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

import { MetadataRoute } from 'next';
import { getEnabledLocales } from '@/lib/languages';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolwala.co';

  // All supported locale codes (excluding 'en' which uses root path)
  const ALL_LOCALES = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'];
  const enabledLocales = getEnabledLocales();

  // Build disallow list for disabled locale prefixes
  const disabledLocalePaths = ALL_LOCALES
    .filter((loc) => !enabledLocales.includes(loc))
    .map((loc) => `/${loc}/`);

  const baseDisallow = ['/api/', '/admin/', '/login', '/auth/'];
  const allDisallow = [...baseDisallow, ...disabledLocalePaths];

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/blog/', '/tools/', '/categories/'],
        disallow: allDisallow,
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/blog', '/blog/', '/tools/', '/categories/'],
        disallow: allDisallow,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/blog/', '/tools/', '/og-image.png'],
        disallow: ['/admin/', ...disabledLocalePaths],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

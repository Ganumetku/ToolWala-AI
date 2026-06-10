import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolwala.co';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/blog/', '/tools/', '/categories/'],
        disallow: ['/api/', '/admin/', '/login', '/auth/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/blog', '/blog/', '/tools/', '/categories/'],
        disallow: ['/api/', '/admin/', '/login'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/blog/', '/tools/', '/og-image.png'],
        disallow: ['/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://toolgpt.in';
  
  const routes = [
    '',
    '/tools',
    '/pricing',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
    '/tools/ai-logo-maker',
    '/tools/bg-remover',
    '/tools/caption-generator',
    '/tools/cover-letter-generator',
    '/tools/image-compressor',
    '/tools/invoice-generator',
    '/tools/passport-photo-maker',
    '/tools/pdf-tools',
    '/tools/qr-code-generator',
    '/tools/resume-builder',
    '/tools/text-humanizer',
    '/tools/voice-generator',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : route.startsWith('/tools/') ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route.startsWith('/tools/') ? 0.8 : 0.5,
  }));
}

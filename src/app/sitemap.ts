import { MetadataRoute } from 'next';
import { getPublicTools } from '@/lib/tools-server';
import { categoriesData } from '@/data/categories';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolwala.co';

  const staticRoutes = [
    '',
    '/tools',
    '/categories',
    '/pricing',
    '/blog',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
  ];

  const categoryRoutes = categoriesData.map((c) => `/categories/${c.slug}`);

  let toolRoutes: string[] = [];
  let blogRoutes: string[] = [];

  try {
    const publicTools = await getPublicTools();
    toolRoutes = publicTools.map((t) => t.href);
  } catch {
    // fallback to static file
    const { toolsData } = await import('@/data/tools');
    const { isToolLive } = await import('@/lib/tools');
    toolRoutes = toolsData.filter(isToolLive).map((t) => t.href);
  }

  try {
    const blogPath = path.join(process.cwd(), 'src/data/dynamic_blogs.json');
    if (fs.existsSync(blogPath)) {
      const blogs = JSON.parse(fs.readFileSync(blogPath, 'utf-8'));
      if (Array.isArray(blogs)) {
        blogRoutes = blogs
          .filter((b: { status: string }) => b.status === 'published')
          .map((b: { slug: string }) => `/blog/${b.slug}`);
      }
    }
  } catch {
    // ignore
  }

  const allRoutes = [...staticRoutes, ...categoryRoutes, ...toolRoutes, ...blogRoutes];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === ''
      ? 'daily'
      : route.startsWith('/tools/')
        ? 'weekly'
        : 'monthly') as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: route === '' ? 1.0 : route.startsWith('/tools/') ? 0.8 : 0.5,
  }));
}

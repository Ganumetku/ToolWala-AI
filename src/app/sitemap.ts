import { MetadataRoute } from 'next';
import { toolsData } from '@/data/tools';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://toolwala.co';
  
  const staticRoutes = [
    '',
    '/tools',
    '/pricing',
    '/blog',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
  ];

  const toolRoutes = toolsData.map(tool => tool.href);
  const routes = [...staticRoutes, ...toolRoutes];

  let dynamicSlugs: string[] = [];
  let dynamicBlogSlugs: string[] = [];

  try {
    if (prisma) {
      const dbTools = await prisma.tool.findMany({
        where: { published: true },
        select: { slug: true }
      });
      dynamicSlugs = dbTools.map(t => `/tools/${t.slug}`);

      const dbBlogs = await prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true }
      });
      dynamicBlogSlugs = dbBlogs.map(b => `/blog/${b.slug}`);
    } else {
      const filePath = path.join(process.cwd(), 'src/data/dynamic_tools.json');
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (Array.isArray(data)) {
          dynamicSlugs = data.filter(t => t.published).map(t => `/tools/${t.slug}`);
        }
      }

      const blogPath = path.join(process.cwd(), 'src/data/dynamic_blogs.json');
      if (fs.existsSync(blogPath)) {
        const data = JSON.parse(fs.readFileSync(blogPath, 'utf-8'));
        if (Array.isArray(data)) {
          dynamicBlogSlugs = data.filter(b => b.published).map(b => `/blog/${b.slug}`);
        }
      }
    }
  } catch (err) {
    console.error('Sitemap dynamic generation error fallback:', err);
  }

  const allRoutes = [...routes, ...dynamicSlugs, ...dynamicBlogSlugs];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : route.startsWith('/tools/') ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route.startsWith('/tools/') ? 0.8 : 0.5,
  }));
}


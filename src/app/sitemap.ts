import { MetadataRoute } from 'next';
import { getPublicTools } from '@/lib/tools-server';
import { getPublicBlogs, slugifyTag } from '@/lib/blogs-server';
import { categoriesData } from '@/data/categories';
import { BLOG_CATEGORIES } from '@/types/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolwala.co';
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' as const : route === '/blog' ? 'daily' as const : 'monthly' as const,
    priority: route === '' ? 1.0 : route === '/blog' ? 0.9 : 0.5,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categoriesData.map((c) => ({
    url: `${baseUrl}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const blogCategoryEntries: MetadataRoute.Sitemap = BLOG_CATEGORIES.map((c) => ({
    url: `${baseUrl}/blog/category/${c.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.65,
  }));

  let toolEntries: MetadataRoute.Sitemap = [];
  let blogEntries: MetadataRoute.Sitemap = [];
  let tagEntries: MetadataRoute.Sitemap = [];

  try {
    const publicTools = await getPublicTools();
    toolEntries = publicTools.map((t) => ({
      url: `${baseUrl}${t.href}`,
      lastModified: t.updatedAt ? new Date(t.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    const { toolsData } = await import('@/data/tools');
    const { isToolLive } = await import('@/lib/tools');
    toolEntries = toolsData.filter(isToolLive).map((t) => ({
      url: `${baseUrl}${t.href}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  }

  try {
    const blogs = await getPublicBlogs();
    blogEntries = blogs.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: new Date(b.updatedAt || b.publishedAt || b.createdAt),
      changeFrequency: 'weekly' as const,
      priority: b.featured ? 0.75 : 0.7,
    }));

    const tags = new Set<string>();
    for (const blog of blogs) {
      for (const tag of blog.tags) {
        tags.add(slugifyTag(tag));
      }
    }
    tagEntries = Array.from(tags).map((tag) => ({
      url: `${baseUrl}/blog/tag/${tag}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // ignore
  }

  return [
    ...staticEntries,
    ...categoryEntries,
    ...blogCategoryEntries,
    ...toolEntries,
    ...blogEntries,
    ...tagEntries,
  ];
}

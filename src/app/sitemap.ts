import { MetadataRoute } from 'next';
import { getPublicTools } from '@/lib/tools-server';
import { getPublicBlogs, slugifyTag } from '@/lib/blogs-server';
import { categoriesData } from '@/data/categories';
import { BLOG_CATEGORIES } from '@/types/blog';
import { getEnabledLocales, getLanguagesConfig } from '@/lib/languages';
import { hubsData } from '@/data/hubs';
import { landingPagesData } from '@/data/landingPages';
import { INDIA_ONLY_SLUGS } from '@/lib/seo';

export const revalidate = 3600; // Regenerate sitemap at most once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolwala.co';
  
  // Get currently enabled locales and filter to SEO enabled ones
  const enabledLocales = getEnabledLocales();
  const config = getLanguagesConfig();
  const seoLocales = enabledLocales.filter((loc) => loc === 'en' || config[loc]?.seo_enabled);

  // Helper to build a sitemap item with alternates
  // Omits lastModified when a reliable, genuine publication/modification date is unavailable
  const buildItem = (
    path: string,
    lastModified: Date | undefined,
    changeFrequency: 'daily' | 'weekly' | 'monthly',
    priority: number,
    itemLocale = 'en',
    alternateLocales?: string[]
  ) => {
    // Respect Next.js trailingSlash: true configuration
    const cleanPath = path === '' ? '/' : path.endsWith('/') ? path : `${path}/`;
    const canonicalUrl = itemLocale === 'en' ? `${baseUrl}${cleanPath}` : `${baseUrl}/${itemLocale}${cleanPath}`;
    
    const languages: Record<string, string> = {
      'x-default': `${baseUrl}${cleanPath}`,
      'en': `${baseUrl}${cleanPath}`
    };
    
    const targetLocales = alternateLocales || seoLocales;
    targetLocales.forEach((loc) => {
      if (loc !== 'en') {
        languages[loc] = `${baseUrl}/${loc}${cleanPath}`;
      }
    });

    return {
      url: canonicalUrl,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency,
      priority,
      alternates: {
        languages
      }
    };
  };

  // IMPORTANT: Do NOT include /tools/* paths here — they are emitted by toolEntries
  // (from the DB / seed). Adding them here causes duplicate sitemap URLs.
  // Landing pages live under /landing/ (not /tools/) so they don't conflict with toolEntries.
  const staticRoutes = [
    '',
    '/tools',
    '/categories',
    '/pricing',
    '/privacy',
    '/blog',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) => {
    const changeFreq = route === '' ? 'daily' as const : route === '/blog' ? 'daily' as const : 'monthly' as const;
    const priority = route === '' ? 1.0 : route === '/blog' ? 0.9 : 0.5;
    return seoLocales.map((loc) => buildItem(route, undefined, changeFreq, priority, loc));
  });

  const categoryEntries: MetadataRoute.Sitemap = categoriesData.flatMap((c) =>
    seoLocales.map((loc) => buildItem(`/categories/${c.slug}`, undefined, 'weekly', 0.6, loc))
  );

  // Filter out blog categories that collide with tool categories (which redirect to /categories/...)
  const validBlogCategories = BLOG_CATEGORIES.filter(
    (c) => !['AI Tools', 'PDF Tools'].includes(c)
  );

  const blogCategoryEntries: MetadataRoute.Sitemap = validBlogCategories.flatMap((c) =>
    seoLocales.map((loc) => buildItem(`/blog/category/${c.toLowerCase().replace(/\s+/g, '-')}`, undefined, 'weekly', 0.65, loc))
  );

  const hubEntries: MetadataRoute.Sitemap = hubsData.flatMap((h) =>
    seoLocales.map((loc) => buildItem(`/hubs/${h.slug}`, undefined, 'weekly', 0.8, loc))
  );

  const landingPageEntries: MetadataRoute.Sitemap = landingPagesData.flatMap((lp) => {
    const isIndiaOnly = INDIA_ONLY_SLUGS.has(lp.slug);
    const localesToUse = isIndiaOnly
      ? seoLocales.filter((loc) => loc === 'en' || loc === 'hi')
      : seoLocales;
    return localesToUse.map((loc) => buildItem(`/landing/${lp.slug}`, undefined, 'weekly', 0.8, loc, localesToUse));
  });

  let toolEntries: MetadataRoute.Sitemap = [];
  let blogEntries: MetadataRoute.Sitemap = [];
  let tagEntries: MetadataRoute.Sitemap = [];

  const EXCLUDED_TOOL_SLUGS = new Set([
    'aadhaar-photo-resizer',
    'aadhaar-photo-resize',
    'aadhar-card-cropper',
    'crop-aadhar-card',
    'pan-photo-tool',
    'signature-crop-tool',
    'pdf-tools',
  ]);

  const normalizeToolHref = (href: string) => {
    if (href.includes('/pdf-tools/edit-pdf')) return '/tools/edit-pdf/';
    return href;
  };

  try {
    const rawTools = await getPublicTools();
    const { toolsData } = await import('@/data/tools');
    const existingSlugs = new Set(rawTools.map((t) => t.slug));
    const staticExtras = toolsData.filter((t) => !existingSlugs.has(t.slug));
    const allTools = [...rawTools, ...staticExtras].filter((t) => !EXCLUDED_TOOL_SLUGS.has(t.slug));

    toolEntries = allTools.flatMap((t) => {
      const href = normalizeToolHref(t.href);
      const isIndiaOnly = INDIA_ONLY_SLUGS.has(t.slug);
      const localesToUse = isIndiaOnly
        ? seoLocales.filter((loc) => loc === 'en' || loc === 'hi')
        : seoLocales;
      const rawDate = t.updatedAt || t.publishDate || t.createdAt;
      const lastMod = rawDate ? new Date(rawDate) : undefined;
      return localesToUse.map((loc) => buildItem(href, lastMod, 'weekly', 0.8, loc, localesToUse));
    });
  } catch {
    const { toolsData } = await import('@/data/tools');
    const { isToolLive } = await import('@/lib/tools');
    toolEntries = toolsData
      .filter((t) => isToolLive(t) && !EXCLUDED_TOOL_SLUGS.has(t.slug))
      .flatMap((t) => {
        const href = normalizeToolHref(t.href);
        const isIndiaOnly = INDIA_ONLY_SLUGS.has(t.slug);
        const localesToUse = isIndiaOnly
          ? seoLocales.filter((loc) => loc === 'en' || loc === 'hi')
          : seoLocales;
        const rawDate = t.updatedAt || t.publishDate || t.createdAt;
        const lastMod = rawDate ? new Date(rawDate) : undefined;
        return localesToUse.map((loc) => buildItem(href, lastMod, 'weekly', 0.8, loc, localesToUse));
      });
  }

  try {
    const blogs = await getPublicBlogs();
    const landingSlugs = new Set(landingPagesData.map((lp) => lp.slug));
    // Exclude posts whose slugs match landing pages (they are served under /landing/ and 301 redirect if requested under /blog/)
    const standaloneBlogs = blogs.filter((b) => !landingSlugs.has(b.slug));

    blogEntries = standaloneBlogs.flatMap((b) => {
      const isIndiaOnly = INDIA_ONLY_SLUGS.has(b.slug);
      const localesToUse = isIndiaOnly
        ? seoLocales.filter((loc) => loc === 'en' || loc === 'hi')
        : seoLocales;
      const rawDate = b.updatedAt || b.publishedAt || b.createdAt;
      const lastMod = rawDate ? new Date(rawDate) : undefined;
      return localesToUse.map((loc) =>
        buildItem(`/blog/${b.slug}`, lastMod, 'weekly', b.featured ? 0.75 : 0.7, loc, localesToUse)
      );
    });

    const tags = new Set<string>();
    for (const blog of standaloneBlogs) {
      for (const tag of blog.tags) {
        tags.add(slugifyTag(tag));
      }
    }
    tagEntries = Array.from(tags).flatMap((tag) => {
      const isIndiaOnly = INDIA_ONLY_SLUGS.has(tag);
      const localesToUse = isIndiaOnly
        ? seoLocales.filter((loc) => loc === 'en' || loc === 'hi')
        : seoLocales;
      return localesToUse.map((loc) => buildItem(`/blog/tag/${tag}`, undefined, 'weekly', 0.6, loc, localesToUse));
    });
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
    ...hubEntries,
    ...landingPageEntries,
  ];
}

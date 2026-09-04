import { MetadataRoute } from 'next';
import { getPublicTools } from '@/lib/tools-server';
import { getPublicBlogs, slugifyTag } from '@/lib/blogs-server';
import { categoriesData } from '@/data/categories';
import { BLOG_CATEGORIES } from '@/types/blog';
import { getEnabledLocales, getLanguagesConfig } from '@/lib/languages';
import { hubsData } from '@/data/hubs';
import { landingPagesData } from '@/data/landingPages';

export const revalidate = 3600; // Regenerate sitemap at most once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolwala.co';
  const now = new Date();
  
  // Get currently enabled locales and filter to SEO enabled ones
  const enabledLocales = getEnabledLocales();
  const config = getLanguagesConfig();
  const seoLocales = enabledLocales.filter((loc) => loc === 'en' || config[loc]?.seo_enabled);

  // Helper to build a sitemap item with alternates
  const buildItem = (
    path: string,
    lastModified: Date,
    changeFrequency: 'daily' | 'weekly' | 'monthly',
    priority: number,
    itemLocale = 'en'
  ) => {
    // Respect Next.js trailingSlash: true configuration
    const cleanPath = path === '' ? '/' : path.endsWith('/') ? path : `${path}/`;
    const canonicalUrl = itemLocale === 'en' ? `${baseUrl}${cleanPath}` : `${baseUrl}/${itemLocale}${cleanPath}`;
    
    const languages: Record<string, string> = {
      'x-default': `${baseUrl}${cleanPath}`,
      'en': `${baseUrl}${cleanPath}`
    };
    
    seoLocales.forEach((loc) => {
      if (loc !== 'en') {
        languages[loc] = `${baseUrl}/${loc}${cleanPath}`;
      }
    });

    return {
      url: canonicalUrl,
      lastModified,
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
    // '/pricing', // Not yet published — uncomment when the page is live
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
    return seoLocales.map((loc) => buildItem(route, now, changeFreq, priority, loc));
  });

  const categoryEntries: MetadataRoute.Sitemap = categoriesData.flatMap((c) =>
    seoLocales.map((loc) => buildItem(`/categories/${c.slug}`, now, 'weekly', 0.6, loc))
  );

  const blogCategoryEntries: MetadataRoute.Sitemap = BLOG_CATEGORIES.flatMap((c) =>
    seoLocales.map((loc) => buildItem(`/blog/category/${c.toLowerCase().replace(/\s+/g, '-')}`, now, 'weekly', 0.65, loc))
  );

  const hubEntries: MetadataRoute.Sitemap = hubsData.flatMap((h) =>
    seoLocales.map((loc) => buildItem(`/hubs/${h.slug}`, now, 'weekly', 0.8, loc))
  );

  const landingPageEntries: MetadataRoute.Sitemap = landingPagesData.flatMap((lp) =>
    seoLocales.map((loc) => buildItem(`/landing/${lp.slug}`, now, 'weekly', 0.8, loc))
  );

  let toolEntries: MetadataRoute.Sitemap = [];
  let blogEntries: MetadataRoute.Sitemap = [];
  let tagEntries: MetadataRoute.Sitemap = [];

  try {
    const publicTools = await getPublicTools();
    toolEntries = publicTools.flatMap((t) => {
      const localesToUse = t.slug === 'exam-marks-calculator'
        ? seoLocales.filter((loc) => loc === 'en' || loc === 'hi')
        : seoLocales;
      return localesToUse.map((loc) => buildItem(t.href, t.updatedAt ? new Date(t.updatedAt) : now, 'weekly', 0.8, loc));
    });
  } catch {
    const { toolsData } = await import('@/data/tools');
    const { isToolLive } = await import('@/lib/tools');
    toolEntries = toolsData.filter(isToolLive).flatMap((t) => {
      const localesToUse = t.slug === 'exam-marks-calculator'
        ? seoLocales.filter((loc) => loc === 'en' || loc === 'hi')
        : seoLocales;
      return localesToUse.map((loc) => buildItem(t.href, now, 'weekly', 0.8, loc));
    });
  }

  try {
    const blogs = await getPublicBlogs();
    blogEntries = blogs.flatMap((b) => {
      const localesToUse = b.slug === 'how-to-calculate-exam-percentage-easily'
        ? seoLocales.filter((loc) => loc === 'en' || loc === 'hi')
        : seoLocales;
      return localesToUse.map((loc) =>
        buildItem(`/blog/${b.slug}`, new Date(b.updatedAt || b.publishedAt || b.createdAt), 'weekly', b.featured ? 0.75 : 0.7, loc)
      );
    });

    const tags = new Set<string>();
    for (const blog of blogs) {
      for (const tag of blog.tags) {
        tags.add(slugifyTag(tag));
      }
    }
    tagEntries = Array.from(tags).flatMap((tag) =>
      seoLocales.map((loc) => buildItem(`/blog/tag/${tag}`, now, 'weekly', 0.6, loc))
    );
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

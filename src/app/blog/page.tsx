import { MeshGradient, FloatingParticles } from "@/components/BackgroundEffects";
import BlogListClient from "./BlogListClient";
import { getPublicBlogs } from "@/lib/blogs-server";
import { getTrendingBlogs } from "@/lib/blog-utils";
import { getTranslationServer } from "@/lib/i18n-server";
import { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslationServer();
  const title = t('blog.seo_title', 'ToolWala Blog – PDF, photo, and form guides');
  const description = t('blog.seo_desc', 'Passport photos, SSC sizes, PDF under 300KB, tax slabs. Written like a person would explain it. Files stay in your browser.');

  const { getAlternateLanguages, getLocalizedCanonicalUrl } = await import('@/lib/seo');
  const canonical = getLocalizedCanonicalUrl('/blog', locale);
  const languages = getAlternateLanguages('/blog');

  return {
    title,
    description,
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      title,
      description,
      url: `https://toolwala.co/${locale === 'en' ? 'blog' : locale + '/blog'}/`,
      siteName: 'ToolWala AI',
      type: 'website',
      images: [{ url: 'https://toolwala.co/og-image.png', width: 1200, height: 630, alt: 'ToolWala AI Blog' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

interface BlogIndexPageProps {
  searchParams: Promise<{ page?: string; q?: string; category?: string }>;
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const params = await searchParams;
  const rawBlogs = await getPublicBlogs();
  const { t, locale } = await getTranslationServer();

  const { getBlogTranslationWithFallback } = await import("@/lib/blog-translation-service");
  const blogs = await Promise.all(rawBlogs.map(b => getBlogTranslationWithFallback(b, locale)));
  const trendingBlogs = getTrendingBlogs(blogs, 5);

  return (
    <div className="bg-slate-50/50 dark:bg-[#030712] min-h-screen pt-8 sm:pt-10 pb-20 relative overflow-hidden select-none font-sans transition-colors duration-250">
      <MeshGradient />
      <FloatingParticles />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 inline-block mb-3 sm:mb-4 animate-pulse-slow">
            {t('blog.insights_badge', 'From the blog')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3 sm:mb-4 leading-tight">
            {t('blog.insights_title', 'Notes on PDFs, photos, and forms')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500">
              {t('blog.insights_subtitle', 'that stay on this device')}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
            {t('blog.insights_desc', 'Size caps, passport photos, tax slabs. Straight answers — then the tool if you want it.')}
          </p>
        </div>

        <BlogListClient
          initialBlogs={blogs}
          trendingBlogs={trendingBlogs}
          initialPage={Number(params.page) || 1}
          initialSearch={params.q || ""}
          initialCategory={params.category || "All"}
        />
      </div>
    </div>
  );
}

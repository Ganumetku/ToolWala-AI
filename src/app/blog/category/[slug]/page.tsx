import { notFound } from "next/navigation";
import { MeshGradient, FloatingParticles } from "@/components/BackgroundEffects";
import BlogListClient from "../../BlogListClient";
import BlogBreadcrumbs from "@/components/blog/BlogBreadcrumbs";
import { getPublicBlogs } from "@/lib/blogs-server";
import { getTrendingBlogs } from "@/lib/blog-utils";
import { buildCategoryBreadcrumbs } from "@/lib/blog-seo";
import { BLOG_CATEGORIES } from "@/types/blog";
import { buildBlogArchiveMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 3600;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function slugToCategory(slug: string): string | null {
  const normalized = decodeURIComponent(slug).toLowerCase();
  return (
    BLOG_CATEGORIES.find((c) => c.toLowerCase().replace(/\s+/g, "-") === normalized) ?? null
  );
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = slugToCategory(slug);
  if (!category) return { title: "Category Not Found", robots: { index: false } };

  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get("x-locale") || "en";
  } catch (e) {}

  const { loadTranslations, getTranslation } = await import('@/lib/i18n');
  const messages = await loadTranslations(locale);
  const localizedCategory = getTranslation(messages, `categories.${category}`) || category;

  let title = '';
  let description = '';

  if (locale === 'hi') {
    title = `${localizedCategory} लेख`;
    description = `टूलवाला AI पर ${localizedCategory} गाइड, ट्यूटोरियल और अंतर्दृष्टि ब्राउज़ करें।`;
  } else if (locale === 'es') {
    title = `Artículos de ${localizedCategory}`;
    description = `Explore guías, tutoriales e ideas sobre ${localizedCategory} en ToolWala AI.`;
  } else if (locale === 'pt') {
    title = `Artigos de ${localizedCategory}`;
    description = `Navegue por guias, tutoriais e insights de ${localizedCategory} no ToolWala AI.`;
  } else if (locale === 'fr') {
    title = `Articles sur ${localizedCategory}`;
    description = `Parcourez les guides, tutoriels et informations sur ${localizedCategory} sur ToolWala AI.`;
  } else if (locale === 'de') {
    title = `${localizedCategory} Artikel`;
    description = `Durchsuchen Sie Anleitungen, Tutorials und Einblicke zu ${localizedCategory} auf ToolWala AI.`;
  } else if (locale === 'id') {
    title = `Artikel ${localizedCategory}`;
    description = `Telusuri panduan, tutorial, dan wawasan ${localizedCategory} di ToolWala AI.`;
  } else if (locale === 'ar') {
    title = `مقالات ${localizedCategory}`;
    description = `تصفح أدلة وبرامج تعليمية ورؤى ${localizedCategory} على ToolWala AI.`;
  } else {
    title = `${localizedCategory} Articles`;
    description = `Browse ${localizedCategory} guides, tutorials, and insights on ToolWala AI.`;
  }

  // Handle "AI" -> "IA" or "एआई"
  if (['es', 'pt', 'fr'].includes(locale)) {
    title = title.replace(/\bAI\b/gi, 'IA');
    description = description.replace(/\bAI\b/gi, 'IA');
  } else if (locale === 'hi') {
    title = title.replace(/\bAI\b/gi, 'एआई');
    description = description.replace(/\bAI\b/gi, 'एआई');
  }

  return buildBlogArchiveMetadata(
    title,
    description,
    `/blog/category/${slug}`,
    [localizedCategory, "blog", "ToolWala AI"],
    locale
  );
}

export default async function BlogCategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = slugToCategory(slug);
  if (!category) notFound();

  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get("x-locale") || "en";
  } catch (e) {}

  const rawBlogs = await getPublicBlogs();
  const { getBlogTranslationWithFallback } = await import("@/lib/blog-translation-service");
  const allBlogs = await Promise.all(rawBlogs.map(b => getBlogTranslationWithFallback(b, locale)));

  const categoryBlogs = allBlogs.filter((b) => b.category === category);
  const trendingBlogs = getTrendingBlogs(allBlogs, 5);
  const breadcrumbs = buildCategoryBreadcrumbs(category, slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [buildBreadcrumbJsonLd(breadcrumbs)],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="bg-[#030712] min-h-screen py-20 relative overflow-hidden">
        <MeshGradient />
        <FloatingParticles />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <BlogBreadcrumbs items={breadcrumbs} />
          <BlogListClient
            initialBlogs={categoryBlogs}
            trendingBlogs={trendingBlogs}
            initialCategory={category}
            basePath={`/blog/category/${slug}`}
            hideFeatured
            title={`${category} Articles`}
            as="h1"
          />
        </div>
      </div>
    </>
  );
}

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((c) => ({
    slug: c.toLowerCase().replace(/\s+/g, "-"),
  }));
}

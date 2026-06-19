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

  return buildBlogArchiveMetadata(
    `${category} Articles`,
    `Browse ${category} guides, tutorials, and insights on ToolWala AI.`,
    `/blog/category/${slug}`,
    [category, "blog", "ToolWala AI"],
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

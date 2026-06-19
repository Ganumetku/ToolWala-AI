import { notFound } from "next/navigation";
import { MeshGradient, FloatingParticles } from "@/components/BackgroundEffects";
import BlogListClient from "../../BlogListClient";
import BlogBreadcrumbs from "@/components/blog/BlogBreadcrumbs";
import { getBlogsByTag, getPublicBlogs } from "@/lib/blogs-server";
import { getTrendingBlogs } from "@/lib/blog-utils";
import { buildTagBreadcrumbs } from "@/lib/blog-seo";
import { buildBlogArchiveMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 3600;

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

function formatTagLabel(tag: string): string {
  return decodeURIComponent(tag)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: TagPageProps) {
  const { tag } = await params;
  const label = formatTagLabel(tag);

  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get("x-locale") || "en";
  } catch (e) {}

  return buildBlogArchiveMetadata(
    `#${label} Articles`,
    `Articles tagged with ${label} on ToolWala AI.`,
    `/blog/tag/${tag}`,
    [label, "blog", "ToolWala AI"],
    locale
  );
}

export default async function BlogTagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const rawTagBlogs = await getBlogsByTag(tag);

  if (!rawTagBlogs.length) notFound();

  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get("x-locale") || "en";
  } catch (e) {}

  const { getBlogTranslationWithFallback } = await import("@/lib/blog-translation-service");
  const tagBlogs = await Promise.all(rawTagBlogs.map(b => getBlogTranslationWithFallback(b, locale)));

  const rawAllBlogs = await getPublicBlogs();
  const allBlogs = await Promise.all(rawAllBlogs.map(b => getBlogTranslationWithFallback(b, locale)));
  const trendingBlogs = getTrendingBlogs(allBlogs, 5);
  const label = formatTagLabel(tag);
  const breadcrumbs = buildTagBreadcrumbs(label, tag);
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
            initialBlogs={tagBlogs}
            trendingBlogs={trendingBlogs}
            basePath={`/blog/tag/${tag}`}
            hideFeatured
            title={`#${label}`}
            as="h1"
          />
        </div>
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const blogs = await getPublicBlogs();
  const tags = new Set<string>();

  for (const blog of blogs) {
    for (const t of blog.tags) {
      tags.add(t.toLowerCase().replace(/\s+/g, "-"));
    }
  }

  return Array.from(tags).map((tag) => ({ tag }));
}

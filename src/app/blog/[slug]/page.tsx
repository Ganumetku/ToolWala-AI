import { notFound } from "next/navigation";
import { MeshGradient, FloatingParticles } from "@/components/BackgroundEffects";
import BlogDetailClient from "./BlogDetailClient";
import { getBlogBySlug, getPublicBlogs, resolveRelatedToolSlugs } from "@/lib/blogs-server";
import { getPublicTools } from "@/lib/tools-server";
import { buildBlogMetadata, buildBlogStructuredData, getSiteUrl } from "@/lib/seo";
import { buildBlogBreadcrumbs, extractTableOfContents } from "@/lib/blog-seo";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || blog.status !== "published") {
    return { title: "Post Not Found", robots: { index: false, follow: false } };
  }

  let locale = "en";
  try {
    const headerList = await headers();
    locale = headerList.get("x-locale") || "en";
  } catch (e) {}

  const { getBlogTranslationWithFallback } = await import("@/lib/blog-translation-service");
  const translatedBlog = await getBlogTranslationWithFallback(blog, locale);

  return buildBlogMetadata(translatedBlog, locale);
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || blog.status !== "published") {
    notFound();
  }

  let locale = "en";
  try {
    const headerList = await headers();
    locale = headerList.get("x-locale") || "en";
  } catch (e) {}

  if (slug === 'how-to-calculate-exam-percentage-easily' && locale !== 'en' && locale !== 'hi') {
    const { redirect } = await import('next/navigation');
    redirect('/blog/how-to-calculate-exam-percentage-easily/');
  }

  const { getBlogTranslationWithFallback } = await import("@/lib/blog-translation-service");
  const translatedBlog = await getBlogTranslationWithFallback(blog, locale);

  const [rawActiveBlogs, allTools] = await Promise.all([getPublicBlogs(), getPublicTools()]);
  const activeBlogs = await Promise.all(rawActiveBlogs.map(b => getBlogTranslationWithFallback(b, locale)));
  const relatedSlugs = await resolveRelatedToolSlugs(translatedBlog);
  const relatedTools = allTools.filter((t) => relatedSlugs.includes(t.slug));
  
  // Localize page URLs
  const pageUrl = getSiteUrl(locale === 'en' ? `/blog/${slug}` : `/${locale}/blog/${slug}`);
  
  const structuredData = await buildBlogStructuredData(translatedBlog);
  const breadcrumbs = buildBlogBreadcrumbs(translatedBlog);
  const tocItems = extractTableOfContents(translatedBlog.content);

  // Pre-process markdown and auto-link optimization on the server
  const { normalizeBlogContent } = await import("@/lib/blog-utils");
  const { optimizeBlogContent } = await import("@/lib/blog-seo");
  const normalized = normalizeBlogContent(translatedBlog.content);
  const processedHtml = optimizeBlogContent(normalized, allTools, activeBlogs, translatedBlog.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-slate-50/60 dark:bg-[#030712] min-h-screen pt-8 pb-24 relative overflow-hidden transition-colors duration-250">
        <MeshGradient />
        <FloatingParticles />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <BlogDetailClient
            blog={translatedBlog}
            allBlogs={activeBlogs}
            relatedTools={relatedTools}
            allTools={allTools}
            pageUrl={pageUrl}
            breadcrumbs={breadcrumbs}
            tocItems={tocItems}
            processedHtml={processedHtml}
          />
        </div>
      </div>
    </>
  );
}

export async function generateStaticParams() {
  try {
    const blogs = await getPublicBlogs();
    return blogs.map((blog) => ({ slug: blog.slug }));
  } catch {
    return [];
  }
}

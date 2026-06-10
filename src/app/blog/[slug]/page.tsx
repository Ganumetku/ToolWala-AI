import { notFound } from "next/navigation";
import { MeshGradient, FloatingParticles } from "@/components/BackgroundEffects";
import BlogDetailClient from "./BlogDetailClient";
import BlogBreadcrumbs from "@/components/blog/BlogBreadcrumbs";
import LazyBlogImage from "@/components/blog/LazyBlogImage";
import { getBlogBySlug, getPublicBlogs, resolveRelatedToolSlugs } from "@/lib/blogs-server";
import { getPublicTools } from "@/lib/tools-server";
import { buildBlogMetadata, buildBlogStructuredData, getSiteUrl } from "@/lib/seo";
import { buildBlogBreadcrumbs, extractTableOfContents } from "@/lib/blog-seo";

export const revalidate = 3600;

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || blog.status !== "published") {
    return { title: "Post Not Found", robots: { index: false, follow: false } };
  }

  return buildBlogMetadata(blog);
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || blog.status !== "published") {
    notFound();
  }

  const [activeBlogs, allTools] = await Promise.all([getPublicBlogs(), getPublicTools()]);
  const relatedSlugs = await resolveRelatedToolSlugs(blog);
  const relatedTools = allTools.filter((t) => relatedSlugs.includes(t.slug));
  const pageUrl = getSiteUrl(`/blog/${slug}`);
  const structuredData = buildBlogStructuredData(blog);
  const breadcrumbs = buildBlogBreadcrumbs(blog);
  const tocItems = extractTableOfContents(blog.content);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden select-none">
        <MeshGradient />
        <FloatingParticles />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <BlogBreadcrumbs items={breadcrumbs} />

          {blog.thumbnail && (
            <div className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative mb-12">
              <LazyBlogImage
                src={blog.thumbnail}
                alt={blog.title}
                priority
                className="absolute inset-0 w-full h-full object-cover"
                aspectRatio="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          <BlogDetailClient
            blog={blog}
            allBlogs={activeBlogs}
            relatedTools={relatedTools}
            allTools={allTools}
            pageUrl={pageUrl}
            tocItems={tocItems}
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

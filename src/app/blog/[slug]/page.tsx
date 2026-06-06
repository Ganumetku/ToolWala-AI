import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { jsonDb } from "@/lib/jsonDb";
import { MeshGradient, FloatingParticles } from "@/components/BackgroundEffects";
import BlogDetailClient from "./BlogDetailClient";
import { Metadata } from "next";

export const dynamic = "force-static";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blogs = jsonDb.getBlogs();
  const blog = blogs.find((b) => b.slug === slug);

  if (!blog) {
    return {
      title: "Post Not Found | ToolWala AI",
    };
  }

  const title = blog.seoMetadata?.title || `${blog.title} | ToolWala AI Blog`;
  const description = blog.seoMetadata?.description || blog.excerpt || blog.content.substring(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://toolwala.co/blog/${slug}`,
      publishedTime: blog.publishedAt || blog.createdAt,
      authors: [blog.author.name],
      images: [
        {
          url: blog.thumbnail || "/og-image.png",
          alt: blog.title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [blog.thumbnail || "/og-image.png"],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blogs = jsonDb.getBlogs();
  const blog = blogs.find((b) => b.slug === slug);

  if (!blog || blog.status !== "published") {
    notFound();
  }

  // Pass active published blogs for related recommendations & navigation
  const activeBlogs = blogs
    .filter((b) => b.status === "published")
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden select-none">
      {/* Background visual styles */}
      <MeshGradient />
      <FloatingParticles />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Navigation back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        {/* Large Hero Image */}
        {blog.thumbnail && (
          <div className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative mb-12">
            <img
              src={blog.thumbnail}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
          </div>
        )}

        {/* Blog Detail Client Wrapper (TOC, content parser, sharing) */}
        <BlogDetailClient blog={blog} allBlogs={activeBlogs} />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const blogs = jsonDb.getBlogs();
    return blogs.map((blog) => ({
      slug: blog.slug,
    }));
  } catch (err) {
    console.error("Failed to generate static params for blogs:", err);
    return [];
  }
}

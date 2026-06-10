import { MeshGradient, FloatingParticles } from "@/components/BackgroundEffects";
import BlogListClient from "./BlogListClient";
import { getPublicBlogs } from "@/lib/blogs-server";
import { getTrendingBlogs } from "@/lib/blog-utils";
import { buildBlogIndexMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildBlogIndexMetadata();

interface BlogIndexPageProps {
  searchParams: Promise<{ page?: string; q?: string; category?: string }>;
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const params = await searchParams;
  const blogs = await getPublicBlogs();
  const trendingBlogs = getTrendingBlogs(blogs, 5);

  return (
    <div className="bg-[#030712] min-h-screen py-20 relative overflow-hidden select-none">
      <MeshGradient />
      <FloatingParticles />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-black uppercase tracking-widest text-blue-400 inline-block mb-4 animate-pulse-slow">
            ToolWala Insights
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase leading-none">
            Tech, AI & Design <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              Without the Servers
            </span>
          </h1>
          <p className="mt-6 text-gray-400 text-lg sm:text-xl font-medium tracking-wide">
            Explore advanced concepts in browser-native processing, data confidentiality, and digital efficiency.
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

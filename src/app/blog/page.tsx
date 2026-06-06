import { jsonDb } from "@/lib/jsonDb";
import { MeshGradient, FloatingParticles } from "@/components/BackgroundEffects";
import BlogListClient from "./BlogListClient";
import { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "ToolWala AI Blog – Modern AI, PDF, & Design Insights",
  description: "Stay ahead with guides on local browser OCR, next-gen image compression, ATS resumes, and high-performance developer utilities on ToolWala AI.",
  openGraph: {
    title: "ToolWala AI Blog – Modern AI, PDF, & Design Insights",
    description: "Stay ahead with guides on local browser OCR, next-gen image compression, ATS resumes, and high-performance developer utilities on ToolWala AI.",
    url: "https://toolwala.co/blog",
    siteName: "ToolWala AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ToolWala AI Blog",
      }
    ],
  },
};

export default async function BlogIndexPage() {
  const blogs = jsonDb.getBlogs();
  
  // Sort blogs: featured first, then published date descending
  const sortedBlogs = [...blogs]
    .filter(b => b.status === "published")
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
    });

  return (
    <div className="bg-[#030712] min-h-screen py-20 relative overflow-hidden select-none">
      <MeshGradient />
      <FloatingParticles />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Hero Section */}
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

        {/* Client-side Search, Category Filter & Card List */}
        <BlogListClient initialBlogs={sortedBlogs} />
      </div>
    </div>
  );
}

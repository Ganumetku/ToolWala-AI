import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Calendar, FileText, Globe } from 'lucide-react';
import { prisma } from '@/lib/db';
import { jsonDb } from '@/lib/jsonDb';
import { MeshGradient } from '@/components/BackgroundEffects';

export const revalidate = 0; // Fresh posts on page views

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { slug } = await params;
  let blog: any = null;

  if (prisma) {
    blog = await prisma.blogPost.findUnique({
      where: { slug },
      include: { seoMetadata: true }
    });
  } else {
    const blogs = jsonDb.getBlogs();
    blog = blogs.find(b => b.slug === slug);
  }

  if (!blog) {
    return {
      title: 'Post Not Found | ToolGPT AI'
    };
  }

  const title = blog.seoMetadata?.title || `${blog.title} | ToolGPT Blog`;
  const description = blog.seoMetadata?.description || blog.content.substring(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://toolwala.co/blog/${slug}`,
      images: []
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  let blog: any = null;

  if (prisma) {
    blog = await prisma.blogPost.findUnique({
      where: { slug },
      include: { seoMetadata: true }
    });
  } else {
    const blogs = jsonDb.getBlogs();
    blog = blogs.find(b => b.slug === slug);
  }

  if (!blog) {
    notFound();
  }

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      {/* Background Glow */}
      <MeshGradient />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        
        {/* Navigation back */}
        <Link 
          href="/tools" 
          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Utilities
        </Link>

        {/* Article Body */}
        <article className="glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl p-8 sm:p-16 bg-white/[0.01]">
          <header className="border-b border-white/5 pb-8 mb-10">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4">
              <span className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Blog Publication
              </span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-3.5 h-3.5" /> 
                {new Date(blog.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
              {blog.title}
            </h1>
          </header>

          <div className="text-gray-300 text-base sm:text-lg font-medium leading-relaxed font-sans whitespace-pre-wrap select-text">
            {blog.content}
          </div>

          <footer className="border-t border-white/5 pt-8 mt-12 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span>Author: ToolGPT Editorial</span>
            <span className="flex items-center gap-1 text-emerald-500">
              <Globe className="w-3.5 h-3.5" /> Indexed public route
            </span>
          </footer>
        </article>

      </div>
    </div>
  );
}

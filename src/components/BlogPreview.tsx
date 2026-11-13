"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import blogsData from "@/data/dynamic_blogs.json";
import { useTranslation } from "@/components/I18nContext";
import LazyBlogImage from "./blog/LazyBlogImage";

export default function BlogPreview() {
  const { t, locale, localizeHref } = useTranslation();

  // Take first 3 published blog posts
  const recentBlogs = blogsData
    .filter(blog => blog.status === "published")
    .slice(0, 3);

  if (recentBlogs.length === 0) return null;

  const formatReadingTime = (readingTime: string) => {
    const match = readingTime.match(/(\d+)\s*min\s*read/i);
    if (match) {
      const mins = match[1];
      return t('blog.minutes_read', `${mins} min read`).replace('{count}', mins);
    }
    return readingTime;
  };

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-black/10 border-b border-gray-200 dark:border-white/5 transition-colors duration-250">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 max-w-7xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-200 dark:border-purple-500/20 mb-4 animate-pulse-slow shadow-sm">
              <BookOpen className="w-3.5 h-3.5" />
              {t('blog.badge', 'LATEST INSIGHTS')}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('blog.title', 'From the ToolWala Blog')}
            </h2>
            <p className="text-gray-600 dark:text-gray-500 mt-3 font-medium">
              {t('blog.subtitle', 'Passport photos, PDF caps, tax — written like you would explain it to a friend.')}
            </p>
          </div>

          <Link 
            href={localizeHref('/blog')}
            className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-white/5 hover:border-blue-500/40 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all active:scale-95 shadow-sm"
          >
            {t('blog.read_all', 'Read All Articles')}
            <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-500" />
          </Link>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {recentBlogs.map((blog, idx) => {
            const blogTitle = t(`blogs.${blog.slug}.title`, blog.title);
            const blogExcerpt = t(`blogs.${blog.slug}.excerpt`, blog.excerpt);
            const blogCategory = t(`categories.${blog.category}`, blog.category);
            const blogReadingTime = formatReadingTime(blog.readingTime);
            
            const blogDate = new Intl.DateTimeFormat(locale, {
              month: "short",
              day: "numeric",
              year: "numeric"
            }).format(new Date(blog.publishedAt || blog.createdAt));

            return (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="bg-white dark:glass border border-gray-200 dark:border-white/5 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col justify-between hover:border-blue-500/30"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="aspect-video w-full overflow-hidden relative border-b border-gray-100 dark:border-white/5 bg-[#0d082d]/90 dark:bg-black/60 flex items-center justify-center">
                    <LazyBlogImage 
                      src={blog.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"} 
                      alt={blogTitle}
                      objectFit="contain"
                      aspectRatio="w-full h-full"
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/30 to-transparent pointer-events-none z-10" />
                    <span className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded-md bg-blue-600 text-[8px] font-black uppercase tracking-widest text-white shadow-md">
                      {blogCategory}
                    </span>
                  </div>

                  {/* Article Info */}
                  <div className="p-6.5">
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {blogReadingTime}
                      </span>
                      <span>•</span>
                      <span>
                        {blogDate}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-3">
                      <Link href={localizeHref(`/blog/${blog.slug}`)}>
                        {blogTitle}
                      </Link>
                    </h3>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-500 font-medium leading-relaxed mb-4 font-sans">
                      {blogExcerpt}
                    </p>
                  </div>
                </div>

                {/* Author & Read More */}
                <div className="px-6.5 pb-6.5 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LazyBlogImage 
                      src={blog.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                      alt={blog.author?.name || "Author"}
                      className="w-7 h-7 rounded-full border border-gray-200 dark:border-white/10"
                    />
                    <div>
                      <span className="text-[10px] font-black text-gray-900 dark:text-white block uppercase tracking-wider leading-none">
                        {blog.author?.name}
                      </span>
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 block">
                        {blog.author?.role || "Tech Writer"}
                      </span>
                    </div>
                  </div>

                  <Link 
                    href={localizeHref(`/blog/${blog.slug}`)}
                    className="w-8 h-8 rounded-full bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-gray-400 group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-600 transition-all"
                    aria-label="Read Full Article"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

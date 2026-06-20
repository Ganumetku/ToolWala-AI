"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Calendar, Clock, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/types/blog";
import { BLOG_CATEGORIES, BLOG_PAGE_SIZE } from "@/types/blog";
import { paginate, searchBlogs } from "@/lib/blog-utils";
import BlogNewsletter from "@/components/blog/BlogNewsletter";
import BlogPagination from "@/components/blog/BlogPagination";
import { useTranslation } from "@/components/I18nContext";
import Image from "next/image";
import LazyBlogImage from "@/components/blog/LazyBlogImage";

interface BlogListClientProps {
  initialBlogs: BlogPost[];
  trendingBlogs: BlogPost[];
  initialPage?: number;
  initialSearch?: string;
  initialCategory?: string;
  basePath?: string;
  hideFeatured?: boolean;
  title?: string;
  as?: 'h1' | 'h2';
}


const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
};

const ALL_CATEGORIES = ["All", ...BLOG_CATEGORIES];

export default function BlogListClient({
  initialBlogs,
  trendingBlogs,
  initialPage = 1,
  initialSearch = "",
  initialCategory = "All",
  basePath = "/blog",
  hideFeatured = false,
  title,
  as = 'h2',
}: BlogListClientProps) {
  const { t, localizeHref } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);

  const filteredBlogs = useMemo(() => {
    let result = initialBlogs;

    if (selectedCategory !== "All") {
      result = result.filter((b) => b.category === selectedCategory);
    }

    return searchBlogs(result, search);
  }, [initialBlogs, search, selectedCategory]);

  const featuredPost =
    !hideFeatured && !search && selectedCategory === "All"
      ? filteredBlogs.find((b) => b.featured)
      : undefined;

  const listForPagination = featuredPost
    ? filteredBlogs.filter((b) => b.id !== featuredPost.id)
    : filteredBlogs;

  const { items: gridBlogs, totalPages, page: currentPage } = paginate(
    listForPagination,
    page,
    BLOG_PAGE_SIZE
  );

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    if (basePath === "/blog") {
      const params = new URLSearchParams();
      if (cat !== "All") params.set("category", cat);
      if (search) params.set("q", search);
      const qs = params.toString();
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    }
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (basePath === "/blog") {
      const params = new URLSearchParams();
      if (p > 1) params.set("page", String(p));
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (search) params.set("q", search);
      const qs = params.toString();
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    }
  };

  return (
    <div className="space-y-12">
      {title && (
        as === 'h1' ? (
          <h1 className="text-2xl font-black text-white uppercase tracking-tight text-center">{title}</h1>
        ) : (
          <h2 className="text-2xl font-black text-white uppercase tracking-tight text-center">{title}</h2>
        )
      )}

      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white/[0.01] border border-white/5 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-3 md:pb-0 no-scrollbar">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t('categories.' + cat, cat)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-3 w-full md:w-80 focus-within:border-blue-500/50 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('blog.search_placeholder', 'Search articles & tags...')}
            className="bg-transparent text-sm border-none outline-none text-white w-full placeholder-gray-600 font-semibold"
            aria-label="Search blog articles"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <AnimatePresence mode="popLayout">
            {featuredPost && (
              <motion.div
                key={`featured-${featuredPost.id}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] shadow-2xl transition-all duration-300 card-glow"
              >
                <Link href={localizeHref(`/blog/${featuredPost.slug}`)} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
                  <div className="md:col-span-7 rounded-[2rem] overflow-hidden relative min-h-[260px] max-h-[350px]">
                    <LazyBlogImage
                      src={featuredPost.thumbnail}
                      alt={featuredPost.title}
                      priority
                      aspectRatio="absolute inset-0 w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80" />
                    <span className="absolute top-5 left-5 px-3 py-1 rounded-lg bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/30">
                      {t('blog.featured_badge', 'Featured')}
                    </span>
                  </div>

                  <div className="md:col-span-5 flex flex-col justify-between py-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-500">
                        <span>{t('categories.' + featuredPost.category, featuredPost.category)}</span>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center gap-1 text-gray-500 font-sans">
                          <Clock className="w-3 h-3" /> {t('blog.minutes_read', '{count} min read').replace('{count}', featuredPost.readingTime.replace(/[^0-9]/g, ''))}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase group-hover:text-blue-400 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-400 text-sm font-semibold leading-relaxed line-clamp-3 font-sans">
                        {featuredPost.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
                      {featuredPost.author.avatar && (
                        <Image
                          src={featuredPost.author.avatar}
                          alt={featuredPost.author.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full border border-white/10 shrink-0"
                        />
                      )}
                      <div>
                        <span className="text-xs font-black text-white block">{featuredPost.author.name}</span>
                        <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">
                          {featuredPost.author.role || t('blog.writer_role', 'Writer')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {gridBlogs.length > 0 ? (
              <div key="remaining-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {gridBlogs.map((blog) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={blog.id}
                    className="group flex flex-col justify-between rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative card-glow"
                  >
                    <Link href={localizeHref(`/blog/${blog.slug}`)} className="flex flex-col h-full">
                      <div className="relative aspect-video overflow-hidden">
                        <LazyBlogImage
                          src={blog.thumbnail}
                          alt={blog.title}
                          aspectRatio="w-full h-full"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent" />
                        <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400">
                          {t('categories.' + blog.category, blog.category)}
                        </span>
                      </div>

                      <div className="p-6 flex flex-col flex-1 justify-between space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-500 font-sans">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(blog.publishedAt || blog.createdAt)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {t('blog.minutes_read', '{count} min read').replace('{count}', blog.readingTime.replace(/[^0-9]/g, ''))}
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-white uppercase tracking-tight leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                            {blog.title}
                          </h3>
                          <p className="text-gray-400 text-xs font-semibold leading-relaxed line-clamp-3 font-sans">
                            {blog.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                          <span className="text-[10px] font-black text-white">{blog.author.name}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            {t('blog.read_post', 'Read Post')} <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : !featuredPost ? (
              <div key="no-articles" className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.01]">
                <Sparkles className="w-8 h-8 text-blue-500/50 mx-auto mb-4 animate-bounce" />
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">
                  {t('blog.no_articles_found', 'No articles found matching criteria.')}
                </h3>
              </div>
            ) : null}
          </AnimatePresence>

          <BlogPagination
            page={currentPage}
            totalPages={totalPages}
            basePath={basePath === "/blog" ? basePath : undefined}
            onPageChange={handlePageChange}
          />
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" /> {t('blog.trending_topics', 'Trending Topics')}
            </h3>
            <div className="space-y-6 divide-y divide-white/5">
              {trendingBlogs.map((trending, idx) => (
                <Link
                  href={localizeHref(`/blog/${trending.slug}`)}
                  key={trending.id}
                  className="flex gap-4 group pt-5 first:pt-0"
                >
                  <span className="text-3xl font-black text-white/10 group-hover:text-blue-500/20 transition-colors leading-none shrink-0 font-sans">
                    0{idx + 1}
                  </span>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                      {t('categories.' + trending.category, trending.category)}
                    </span>
                    <h4 className="text-sm font-black text-white uppercase leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                      {trending.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3">
              {t('blog.try_featured_tools', 'Try Featured Tools')}
            </h3>
            <div className="space-y-3">
              <Link
                href={localizeHref('/tools/pdf-tools/edit-pdf')}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <span className="text-lg">✍️</span>
                <span className="text-xs font-black text-white uppercase group-hover:text-blue-400 line-clamp-1">
                  {t('tools.edit-pdf.title', 'Edit PDF Online')}
                </span>
              </Link>
              <Link
                href={localizeHref('/tools/pdf-ocr')}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <span className="text-lg">🔍</span>
                <span className="text-xs font-black text-white uppercase group-hover:text-blue-400 line-clamp-1">
                  {t('tools.pdf-ocr.title', 'PDF OCR Scanner')}
                </span>
              </Link>
              <Link
                href={localizeHref('/tools/image-compressor')}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <span className="text-lg">📉</span>
                <span className="text-xs font-black text-white uppercase group-hover:text-blue-400 line-clamp-1">
                  {t('tools.image-compressor.title', 'Image Compressor')}
                </span>
              </Link>
            </div>
          </div>

          <BlogNewsletter />
        </div>
      </div>
    </div>
  );
}

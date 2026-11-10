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
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight text-center">{title}</h1>
        ) : (
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight text-center">{title}</h2>
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
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {t('categories.' + cat, cat)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/5 rounded-2xl px-5 py-3 w-full md:w-80 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 shadow-sm transition-all">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('blog.search_placeholder', 'Search articles & tags...')}
            className="bg-transparent text-sm border-none outline-none focus:outline-none focus:ring-0 focus:border-none text-gray-900 dark:text-white w-full placeholder-gray-400 dark:placeholder-gray-600 font-semibold pl-2 h-auto"
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
                className="group relative overflow-hidden rounded-[2.5rem] border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.01] hover:bg-gray-50 dark:hover:bg-white/[0.02] shadow-sm hover:shadow-md dark:shadow-2xl transition-all duration-300 card-glow"
              >
                <Link href={localizeHref(`/blog/${featuredPost.slug}`)} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
                  <div className="md:col-span-7 rounded-[2rem] overflow-hidden relative aspect-video md:aspect-auto md:min-h-[260px] md:max-h-[350px] bg-[#0d082d]/90 dark:bg-black/60 flex items-center justify-center">
                    <LazyBlogImage
                      src={featuredPost.thumbnail}
                      alt={featuredPost.title}
                      priority
                      objectFit="contain"
                      aspectRatio="w-full h-full"
                      className="w-full h-full group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-lg bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white shadow-md">
                      {t('blog.featured_badge', 'Featured')}
                    </span>
                  </div>

                  <div className="md:col-span-5 flex flex-col justify-between py-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500">
                        <span>{t('categories.' + featuredPost.category, featuredPost.category)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-1 text-gray-500 font-sans">
                          <Clock className="w-3 h-3" /> {t('blog.minutes_read', '{count} min read').replace('{count}', featuredPost.readingTime.replace(/[^0-9]/g, ''))}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold leading-relaxed line-clamp-3 font-sans">
                        {featuredPost.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                      {featuredPost.author.avatar && (
                        <Image
                          src={featuredPost.author.avatar}
                          alt={featuredPost.author.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 shrink-0"
                        />
                      )}
                      <div>
                        <span className="text-xs font-black text-gray-900 dark:text-white block">{featuredPost.author.name}</span>
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
                    className="group flex flex-col justify-between rounded-[2rem] border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.01] hover:bg-gray-50 dark:hover:bg-white/[0.02] shadow-sm hover:shadow-md dark:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative card-glow"
                  >
                    <Link href={localizeHref(`/blog/${blog.slug}`)} className="flex flex-col h-full">
                      <div className="relative aspect-video overflow-hidden bg-[#0d082d]/90 dark:bg-black/60 flex items-center justify-center">
                        <LazyBlogImage
                          src={blog.thumbnail}
                          alt={blog.title}
                          objectFit="contain"
                          aspectRatio="w-full h-full"
                          className="w-full h-full group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/30 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
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
                          <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {blog.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold leading-relaxed line-clamp-3 font-sans">
                            {blog.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
                          <span className="text-[10px] font-black text-gray-900 dark:text-white">{blog.author.name}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            {t('blog.read_post', 'Read Post')} <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : !featuredPost ? (
              <div key="no-articles" className="text-center py-20 border border-gray-200 dark:border-white/5 rounded-3xl bg-white dark:bg-white/[0.01]">
                <Sparkles className="w-8 h-8 text-blue-500/50 mx-auto mb-4 animate-bounce" />
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
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
          <div className="rounded-[2rem] border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0f172a] p-6 sm:p-8 space-y-6 shadow-sm dark:glass">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-500" /> {t('blog.trending_topics', 'Trending Topics')}
            </h3>
            <div className="space-y-6 divide-y divide-gray-100 dark:divide-white/5">
              {trendingBlogs.map((trending, idx) => (
                <Link
                  href={localizeHref(`/blog/${trending.slug}`)}
                  key={trending.id}
                  className="flex gap-4 group pt-5 first:pt-0"
                >
                  <span className="text-3xl font-black text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-none shrink-0 font-sans">
                    0{idx + 1}
                  </span>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500">
                      {t('categories.' + trending.category, trending.category)}
                    </span>
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {trending.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white dark:glass rounded-[2rem] border border-gray-200 dark:border-white/5 p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
              {t('blog.try_featured_tools', 'Try Featured Tools')}
            </h3>
            <div className="space-y-3">
              <Link
                href={localizeHref('/tools/edit-pdf/')}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <span className="text-lg">✍️</span>
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                  {t('tools.edit-pdf.title', 'Edit PDF Online')}
                </span>
              </Link>
              <Link
                href={localizeHref('/tools/pdf-ocr')}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <span className="text-lg">🔍</span>
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                  {t('tools.pdf-ocr.title', 'PDF OCR Scanner')}
                </span>
              </Link>
              <Link
                href={localizeHref('/tools/image-compressor')}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <span className="text-lg">📉</span>
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
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

"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowRight, User, Sparkles } from "lucide-react";
import type { Tool } from "@/data/tools";
import type { BlogPost } from "@/types/blog";
import type { BreadcrumbItem, TocItem } from "@/lib/blog-seo";
import { matchRelatedBlogs } from "@/lib/blog-utils";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import BlogShareButtons from "@/components/blog/BlogShareButtons";
import BlogRichContent from "@/components/blog/BlogRichContent";
import BlogFaqSection from "@/components/blog/BlogFaqSection";
import RelatedTools from "@/components/blog/RelatedTools";
import BlogNewsletter from "@/components/blog/BlogNewsletter";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import BlogBreadcrumbs from "@/components/blog/BlogBreadcrumbs";
import LazyBlogImage from "@/components/blog/LazyBlogImage";
import { useTranslation } from "@/components/I18nContext";
import { categoriesData } from "@/data/categories";
import ToolIcon from "@/components/ToolIcon";
import Image from "next/image";

const formatDateLong = (dateString: string, locale: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
};

const formatDateShort = (dateString: string, locale: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

interface BlogDetailClientProps {
  blog: BlogPost;
  allBlogs: BlogPost[];
  relatedTools: Tool[];
  allTools: Tool[];
  pageUrl: string;
  breadcrumbs: BreadcrumbItem[];
  tocItems: TocItem[];
  processedHtml?: string;
}

export default function BlogDetailClient({
  blog,
  allBlogs,
  relatedTools,
  allTools,
  pageUrl,
  breadcrumbs,
  tocItems,
  processedHtml,
}: BlogDetailClientProps) {
  const { t, locale, localizeHref } = useTranslation();

  const relatedPosts = matchRelatedBlogs(blog, allBlogs, 4);
  const currentIndex = allBlogs.findIndex((b) => b.id === blog.id);
  const prevPost = currentIndex > 0 ? allBlogs[currentIndex - 1] : null;
  const nextPost = currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null;

  const toolsBySlug = Object.fromEntries(relatedTools.map((t) => [t.slug, t]));

  const relatedCategories = useMemo(() => {
    return categoriesData.filter(cat => 
      cat.title.toLowerCase() === blog.category.toLowerCase() ||
      relatedTools.some(tool => tool.category === cat.title) ||
      blog.tags.some(tag => cat.keywords.some(kw => kw.toLowerCase() === tag.toLowerCase()) || cat.title.toLowerCase().includes(tag.toLowerCase()))
    ).slice(0, 3);
  }, [blog.category, blog.tags, relatedTools]);

  useEffect(() => {
    fetch(`/api/blogs/${blog.slug}/view/`, { method: "POST" }).catch(() => {});
  }, [blog.slug]);

  const translatedTitle = t(`blogs.${blog.slug}.title`, blog.title);
  const translatedExcerpt = t(`blogs.${blog.slug}.excerpt`, blog.excerpt);
  const translatedContent = t(`blogs.${blog.slug}.content`, blog.content);
  const translatedCategory = t(`categories.${blog.category}`, blog.category);

  const formatReadingTime = (readingTime: string) => {
    const match = readingTime.match(/(\d+)\s*min\s*read/i);
    if (match) {
      const mins = match[1];
      return t('blog.minutes_read', `${mins} min read`).replace('{count}', mins);
    }
    return readingTime;
  };
  const translatedReadingTime = formatReadingTime(blog.readingTime);

  const translatedFaqs = useMemo(() => {
    return blog.faqs.map((faq, idx) => ({
      ...faq,
      question: t(`blogs.${blog.slug}.faqs.${idx}.question`, faq.question),
      answer: t(`blogs.${blog.slug}.faqs.${idx}.answer`, faq.answer),
    }));
  }, [blog.faqs, blog.slug, t]);

  return (
    <>
      <ReadingProgressBar />

      {/* Breadcrumb Navigation */}
      <BlogBreadcrumbs items={breadcrumbs} className="mb-6 sm:mb-8" />

      {/* Article Hero Header - Above the Fold Clarity */}
      <header className="mb-8 sm:mb-10 space-y-5 max-w-4xl">
        {/* Category & Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={localizeHref(`/blog/category/${blog.category.toLowerCase().replace(/\s+/g, "-")}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            {translatedCategory}
          </Link>
          {blog.trending && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
              {t('blog.trending_badge', 'Trending')}
            </span>
          )}
        </div>

        {/* H1 Main Title: Clear, bold, readable natural capitalization */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2]">
          {translatedTitle}
        </h1>

        {/* Subtitle / Excerpt lead paragraph if present */}
        {translatedExcerpt && (
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            {translatedExcerpt}
          </p>
        )}

        {/* Author Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-3">
            {blog.author.avatar ? (
              <Image
                src={blog.author.avatar}
                alt={blog.author.name}
                width={40}
                height={40}
                unoptimized
                className="w-10 h-10 rounded-full border-2 border-blue-500/20 object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="text-slate-900 dark:text-white font-bold text-sm block">
                {blog.author.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                {blog.author.role || t('blog.writer_role', 'Writer')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              {formatDateLong(blog.publishedAt || blog.createdAt, locale)}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              {translatedReadingTime}
            </span>
          </div>
        </div>
      </header>

      {/* Featured Visual Showcase - Well proportioned, bounded height */}
      {blog.thumbnail && (
        <div className="w-full mb-10 sm:mb-14">
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/10] max-h-[440px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-blue-500/5 bg-[#0d082d] flex items-center justify-center group">
            <LazyBlogImage
              src={blog.thumbnail}
              alt={translatedTitle}
              priority
              objectFit="contain"
              className="w-full h-full transform group-hover:scale-[1.01] transition-transform duration-500"
              aspectRatio="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* 3-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12" data-no-translate>
        {/* Left Sticky Share Bar */}
        <div className="lg:col-span-1 lg:sticky lg:top-28 h-fit hidden lg:block">
          <BlogShareButtons title={translatedTitle} url={pageUrl} layout="vertical" />
        </div>

        {/* Center Main Reading Column (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          <article className="bg-white dark:bg-[#0c1222]/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-10 md:p-12">
            {/* Mobile TOC */}
            {tocItems.length > 0 && (
              <div className="lg:hidden mb-8 pb-6 border-b border-slate-200 dark:border-white/10">
                <BlogTableOfContents items={tocItems} syncFromDom contentKey={translatedContent} />
              </div>
            )}

            {/* Main Content Body */}
            <div id="blog-article-body">
              <BlogRichContent
                content={translatedContent}
                toolsBySlug={toolsBySlug}
                allTools={allTools}
                allBlogs={allBlogs}
                currentSlug={blog.slug}
                processedHtml={processedHtml}
              />
            </div>

            {/* FAQs Accordion */}
            <BlogFaqSection faqs={translatedFaqs} />

            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-8 mt-10 border-t border-slate-200 dark:border-white/10">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Tags:</span>
                {blog.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={localizeHref(`/blog/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`)}
                    className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 font-semibold hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Author Bio Box */}
            <div className="mt-10 p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {blog.author.avatar ? (
                <Image
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  width={56}
                  height={56}
                  unoptimized
                  className="w-14 h-14 rounded-full border-2 border-blue-500/20 object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <User className="w-7 h-7" />
                </div>
              )}
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Written By</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{blog.author.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {blog.author.role ? `${blog.author.role} at ToolWala AI.` : "Content specialist at ToolWala AI."} Writing clear, in-depth guides to simplify complex workflows with client-side, privacy-first tools.
                </p>
              </div>
            </div>

            {/* Mobile Share Buttons */}
            <div className="lg:hidden pt-6 mt-6 border-t border-slate-200 dark:border-white/10">
              <span className="text-xs font-bold text-slate-500 block mb-3">Share this article:</span>
              <BlogShareButtons title={translatedTitle} url={pageUrl} layout="horizontal" />
            </div>

            {/* Related Categories Pills */}
            {relatedCategories.length > 0 && (
              <div className="pt-8 mt-8 border-t border-slate-200 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                  {t('blog.related_categories', 'Related Categories')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={localizeHref(`/categories/${cat.slug}`)}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ToolIcon icon={cat.icon} className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white truncate">
                          {t(`categories.${cat.title}`, cat.title)}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Related Tools */}
          <RelatedTools tools={relatedTools} />

          {/* Prev / Next Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                href={localizeHref(`/blog/${prevPost.slug}`)}
                className="group p-5 rounded-2xl bg-white dark:bg-[#0c1222]/90 border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/30 shadow-sm transition-all flex items-center gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-blue-600/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    {t('blog.previous', 'Previous')}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 block">
                    {t(`blogs.${prevPost.slug}.title`, prevPost.title)}
                  </span>
                </div>
              </Link>
            ) : <div />}

            {nextPost ? (
              <Link
                href={localizeHref(`/blog/${nextPost.slug}`)}
                className="group p-5 rounded-2xl bg-white dark:bg-[#0c1222]/90 border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/30 shadow-sm transition-all flex items-center justify-end gap-3.5 text-right sm:ml-auto w-full"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    {t('blog.next', 'Next')}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 block">
                    {t(`blogs.${nextPost.slug}.title`, nextPost.title)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-blue-600/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ) : <div />}
          </div>

          {/* Related Insights */}
          <div className="space-y-5 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 rounded-full bg-blue-600 dark:bg-blue-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('blog.related_insights', 'Related Insights')}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {relatedPosts.map((rBlog) => (
                <Link
                  key={rBlog.id}
                  href={localizeHref(`/blog/${rBlog.slug}`)}
                  className="group p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1222]/90 hover:border-blue-500/30 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {t(`categories.${rBlog.category}`, rBlog.category)}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mt-2 leading-snug">
                      {t(`blogs.${rBlog.slug}.title`, rBlog.title)}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-white/5 text-[11px] font-medium text-slate-500">
                    <span>{formatReadingTime(rBlog.readingTime)}</span>
                    <span>•</span>
                    <span>{formatDateShort(rBlog.publishedAt || rBlog.createdAt, locale)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <BlogNewsletter />
        </div>

        {/* Right Sticky Sidebar (3 cols) */}
        <div className="lg:col-span-3 lg:sticky lg:top-28 h-fit space-y-6 hidden lg:block">
          <BlogTableOfContents items={tocItems} syncFromDom contentKey={translatedContent} />

          {relatedTools.length > 0 && (
            <div className="bg-white dark:bg-[#0c1222]/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm p-5 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-3 flex items-center justify-between">
                <span>{t('blog.try_tools', 'Try These Tools')}</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold lowercase">free & private</span>
              </h3>
              <div className="space-y-2.5">
                {relatedTools.slice(0, 3).map((tool) => (
                  <Link
                    key={tool.slug}
                    href={localizeHref(tool.href)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <ToolIcon icon={tool.icon} className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-tight">
                      {t(`tools.${tool.slug}.title`, tool.title)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relatedCategories.length > 0 && (
            <div className="bg-white dark:bg-[#0c1222]/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm p-5 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-3">
                {t('blog.explore_categories_title', 'Explore Related Categories')}
              </h3>
              <div className="space-y-2">
                {relatedCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={localizeHref(`/categories/${cat.slug}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ToolIcon icon={cat.icon} className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {t(`categories.${cat.title}`, cat.title)}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

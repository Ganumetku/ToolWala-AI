"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowRight, User } from "lucide-react";
import type { Tool } from "@/data/tools";
import type { BlogPost } from "@/types/blog";
import type { TocItem } from "@/lib/blog-seo";
import { matchRelatedBlogs } from "@/lib/blog-utils";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import BlogShareButtons from "@/components/blog/BlogShareButtons";
import BlogRichContent from "@/components/blog/BlogRichContent";
import BlogFaqSection from "@/components/blog/BlogFaqSection";
import RelatedTools from "@/components/blog/RelatedTools";
import BlogNewsletter from "@/components/blog/BlogNewsletter";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import { useTranslation } from "@/components/I18nContext";
import { categoriesData } from "@/data/categories";

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
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
};

interface BlogDetailClientProps {
  blog: BlogPost;
  allBlogs: BlogPost[];
  relatedTools: Tool[];
  allTools: Tool[];
  pageUrl: string;
  tocItems: TocItem[];
}

export default function BlogDetailClient({
  blog,
  allBlogs,
  relatedTools,
  allTools,
  pageUrl,
  tocItems,
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12" data-no-translate>
        <div className="lg:col-span-1 lg:sticky lg:top-32 h-fit hidden lg:block">
          <BlogShareButtons title={translatedTitle} url={pageUrl} layout="vertical" />
        </div>

        <div className="lg:col-span-8 space-y-12">
          <article className="glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl p-6 sm:p-14 bg-white/[0.01]">
            <header className="border-b border-white/5 pb-8 mb-10 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={localizeHref(`/blog/category/${blog.category.toLowerCase().replace(/\s+/g, "-")}`)}
                  className="px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-xs font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  {translatedCategory}
                </Link>
                {blog.trending && (
                  <span className="px-3 py-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-xs font-black uppercase tracking-widest text-purple-400">
                    {t('blog.trending_badge', 'Trending')}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
                {translatedTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-black uppercase tracking-widest text-gray-500">
                <div className="flex items-center gap-2">
                  {blog.author.avatar ? (
                    <img
                      src={blog.author.avatar}
                      alt={blog.author.name}
                      loading="lazy"
                      decoding="async"
                      className="w-8 h-8 rounded-full border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <span className="text-white block">{blog.author.name}</span>
                    <span className="text-[9px] text-gray-500 font-bold block mt-0.5">
                      {blog.author.role || t('blog.writer_role', 'Writer')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-8">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDateLong(blog.publishedAt || blog.createdAt, locale)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {translatedReadingTime}
                  </span>
                </div>
              </div>

              {tocItems.length > 0 && (
                <div className="lg:hidden pt-4 border-t border-white/5">
                  <BlogTableOfContents items={tocItems} syncFromDom contentKey={translatedContent} />
                </div>
              )}

              <div className="lg:hidden pt-2">
                <BlogShareButtons title={translatedTitle} url={pageUrl} layout="horizontal" />
              </div>
            </header>

            <div id="blog-article-body">
              <BlogRichContent
                content={translatedContent}
                toolsBySlug={toolsBySlug}
                allTools={allTools}
                allBlogs={allBlogs}
                currentSlug={blog.slug}
              />
            </div>

            <BlogFaqSection faqs={translatedFaqs} />

            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-8 mt-12 border-t border-white/5">
                {blog.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={localizeHref(`/blog/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`)}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-gray-400 font-bold hover:text-blue-400 hover:border-blue-500/30 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {relatedCategories.length > 0 && (
              <div className="pt-8 mt-8 border-t border-white/5">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                  {t('blog.related_categories', 'Related Categories')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={localizeHref(`/categories/${cat.slug}`)}
                      className="p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:border-blue-500/20 hover:bg-blue-600/5 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg shrink-0">{cat.icon}</span>
                        <span className="text-xs font-black text-gray-300 group-hover:text-white uppercase truncate">
                          {t(`categories.${cat.title}`, cat.title)}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-500 transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          <RelatedTools tools={relatedTools} />

          <div className="flex flex-col sm:flex-row gap-6 justify-between items-center bg-white/[0.01] border border-white/5 p-6 rounded-3xl backdrop-blur-md">
            {prevPost ? (
              <Link href={localizeHref(`/blog/${prevPost.slug}`)} className="flex items-center gap-4 group text-left w-full sm:w-auto">
                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-blue-600/10 border border-white/5 group-hover:border-blue-500/20 text-gray-400 group-hover:text-blue-400 transition-all">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block">{t('blog.previous', 'Previous')}</span>
                  <span className="text-xs font-black uppercase text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {t(`blogs.${prevPost.slug}.title`, prevPost.title)}
                  </span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextPost ? (
              <Link href={localizeHref(`/blog/${nextPost.slug}`)} className="flex items-center gap-4 group text-right w-full sm:w-auto justify-end ml-auto">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block text-right">{t('blog.next', 'Next')}</span>
                  <span className="text-xs font-black uppercase text-white group-hover:text-blue-400 transition-colors line-clamp-1 text-right">
                    {t(`blogs.${nextPost.slug}.title`, nextPost.title)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-blue-600/10 border border-white/5 group-hover:border-blue-500/20 text-gray-400 group-hover:text-blue-400 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>

          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-black text-white uppercase tracking-widest">{t('blog.related_insights', 'Related Insights')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {relatedPosts.map((rBlog) => (
                <Link
                  key={rBlog.id}
                  href={localizeHref(`/blog/${rBlog.slug}`)}
                  className="group p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">{t(`categories.${rBlog.category}`, rBlog.category)}</span>
                  <h4 className="text-sm font-black text-white uppercase group-hover:text-blue-400 transition-colors line-clamp-2 mt-2">
                    {t(`blogs.${rBlog.slug}.title`, rBlog.title)}
                  </h4>
                  <div className="flex items-center gap-3 pt-4 mt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <span>{formatReadingTime(rBlog.readingTime)}</span>
                    <span>•</span>
                    <span>{formatDateShort(rBlog.publishedAt || rBlog.createdAt, locale)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <BlogNewsletter />
        </div>

        <div className="lg:col-span-3 lg:sticky lg:top-32 h-fit space-y-8 hidden lg:block">
          <BlogTableOfContents items={tocItems} syncFromDom contentKey={translatedContent} />

          {relatedTools.length > 0 && (
            <div className="glass rounded-[2rem] border border-white/5 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3">
                {t('blog.try_tools', 'Try These Tools')}
              </h3>
              <div className="space-y-3">
                {relatedTools.slice(0, 3).map((tool) => (
                  <Link
                    key={tool.slug}
                    href={localizeHref(tool.href)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group"
                  >
                    <span className="text-lg">{tool.icon}</span>
                    <span className="text-xs font-black text-white uppercase group-hover:text-blue-400 line-clamp-2">
                      {t(`tools.${tool.slug}.title`, tool.title)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relatedCategories.length > 0 && (
            <div className="glass rounded-[2rem] border border-white/5 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3">
                {t('blog.explore_categories_title', 'Explore Related Categories')}
              </h3>
              <div className="space-y-3">
                {relatedCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={localizeHref(`/categories/${cat.slug}`)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg shrink-0">{cat.icon}</span>
                      <span className="text-xs font-black text-white uppercase group-hover:text-blue-400 truncate">
                        {t(`categories.${cat.title}`, cat.title)}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
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


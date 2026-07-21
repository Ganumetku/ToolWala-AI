"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  ChevronDown, 
  Sparkles, 
  TrendingUp, 
  Grid, 
  Search, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Layers,
  Cpu
} from 'lucide-react';
import { toolsData, Tool } from '@/data/tools';
import { fetchPublicTools } from '@/lib/tools';
import { categoriesData, getToolsByCategory, CategoryMetadata } from '@/data/categories';
import ToolCard from '@/components/ToolCard';
import CategoryHeader from '@/components/CategoryHeader';
import CategorySidebar from '@/components/CategorySidebar';
import CategorySearch from '@/components/CategorySearch';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import Link from 'next/link';
import { useTranslation } from '@/components/I18nContext';
import type { BlogPost } from '@/types/blog';

interface CategoryPageClientProps {
  slug: string;
  category: CategoryMetadata;
  relatedBlogs?: BlogPost[];
}

// Markdown parser helper for inline links
function parseMarkdownLinks(text: string, localizeHref: (h: string) => string) {
  if (!text) return null;
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const linkText = match[1];
    const linkHref = match[2];

    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    parts.push(
      <Link
        key={matchIndex}
        href={localizeHref(linkHref)}
        className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors"
      >
        {linkText}
      </Link>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function CategoryPageClient({ slug, category, relatedBlogs = [] }: CategoryPageClientProps) {
  const { t, locale, localizeHref } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'trending'>('all');
  const [publicTools, setPublicTools] = useState<Tool[]>(toolsData);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPublicTools().then(setPublicTools).catch(() => {});
  }, []);

  const categoryTools = useMemo(() => {
    return getToolsByCategory(category.id, publicTools);
  }, [category, publicTools]);

  // Filter tools based on query and tabs
  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = categoryTools.filter(tool => {
      if (!tool.isVisible) return false;
      return (
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });

    if (activeFilter === 'popular') {
      result = result.filter(tool => tool.popular);
    } else if (activeFilter === 'trending') {
      result = result.filter(tool => tool.trending);
    }

    return result;
  }, [categoryTools, searchQuery, activeFilter]);

  // Popular Tools Section (max 4 tools)
  const popularToolsList = useMemo(() => {
    return categoryTools.filter(tool => tool.popular && tool.isVisible).slice(0, 4);
  }, [categoryTools]);

  // Recently Added Tools Section (sorted by createdAt, max 3 tools)
  const recentlyAddedToolsList = useMemo(() => {
    return [...categoryTools]
      .filter(tool => tool.isVisible)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [categoryTools]);

  // Localized long description, whyUse, howItWorks
  const localizedLongDesc = useMemo(() => {
    return t(`categories.${category.id}.longDescription`, category.longDescription);
  }, [category, t]);

  const whyUseList = useMemo(() => {
    return t(`categories.${category.id}.whyUse`, category.whyUse);
  }, [category, t]);

  const howItWorksSteps = useMemo(() => {
    return t(`categories.${category.id}.howItWorks`, category.howItWorks);
  }, [category, t]);

  // Enabled server-side pre-rendering by default so crawlers see full details

  return (
    <>
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#030712] text-gray-900 dark:text-white relative overflow-hidden font-sans transition-colors duration-250">
        <MeshGradient />
        <FloatingParticles />

        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-blue-900/10 via-transparent to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 relative z-10">
          
          {/* Modular Reusable Header Component with H1 */}
          <CategoryHeader 
            title={category.title}
            icon={category.icon}
            description={t('categories.' + category.id + '.intro', category.intro)}
          />

          {/* Grid Layout: Left Sidebar Navigation & Right Content Dashboard */}
          <div className="flex flex-col lg:flex-row gap-8 items-start mt-10">
            
            {/* Sidebar Navigation */}
            <CategorySidebar activeSlug={slug} />

            {/* Content Deck */}
            <div className="flex-1 w-full space-y-16">

              {/* 1. Category H1/SEO Long Description Section with Stats Card */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 sm:p-8 rounded-[2.5rem] shadow-sm dark:glass">
                <div className="lg:col-span-2 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      {t('categories.hub_badge', 'Categorized Hub')}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    {t(`categories.${category.id}.seoTitle`, category.seoTitle)}
                  </h1>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium space-y-3">
                    <p className="whitespace-pre-line">
                      {parseMarkdownLinks(localizedLongDesc, localizeHref)}
                    </p>
                  </div>
                </div>

                {/* Key Quick Stats Card */}
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 space-y-5 w-full">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-200 dark:border-white/5 pb-3">
                    {t('categories.folder_stats', 'Folder Quick Facts')}
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                        <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Total Tools</span>
                      </div>
                      <span className="text-xs font-black text-gray-900 dark:text-white">{categoryTools.length} Tools</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        <span>Security Status</span>
                      </div>
                      <span className="text-xs font-black text-green-600 dark:text-green-400">100% Local</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                        <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Execution Speed</span>
                      </div>
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400">&lt; 120ms</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                        <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
                        <span>Privacy Level</span>
                      </div>
                      <span className="text-xs font-black text-amber-600 dark:text-yellow-400">No Server Uploads</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Popular Tools Shelf */}
              {popularToolsList.length > 0 && !searchQuery && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 dark:text-yellow-400" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                      {t('categories.popular_shelf_title', 'Popular Utilities')}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {popularToolsList.map((tool) => (
                      <ToolCard 
                        key={tool.id} 
                        {...tool} 
                        isPopular={true}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 3. Recently Added Tools Shelf */}
              {recentlyAddedToolsList.length > 0 && !searchQuery && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                      {t('categories.recently_added_title', 'Recently Added')}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {recentlyAddedToolsList.map((tool) => (
                      <ToolCard 
                        key={tool.id} 
                        {...tool}
                        isTrending={tool.trending}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 4. Why Use These Tools Section */}
              {whyUseList && whyUseList.length > 0 && (
                <section className="space-y-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                      {t('categories.why_use_title', `Why Use These ${category.title}`)}
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-500 font-semibold mt-1">
                      Designed with security, speed, and standard compliance in mind.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {whyUseList.map((benefit: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="p-6 rounded-2xl bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-all shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center text-xl mb-4 border border-blue-100 dark:border-white/5">
                          {benefit.icon}
                        </div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                          {benefit.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                          {parseMarkdownLinks(benefit.desc, localizeHref)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 5. How It Works Steps Component */}
              {howItWorksSteps && howItWorksSteps.length > 0 && (
                <section className="space-y-8 bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 p-6 sm:p-8 rounded-[2.5rem] shadow-sm dark:glass">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                      {t('categories.how_it_works_title', 'How It Works')}
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-500 font-semibold mt-1">
                      Start using tools inside this directory in three simple steps.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Horizontal connecting line for desktop */}
                    <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-dashed bg-gradient-to-r from-transparent via-gray-300 dark:via-white/10 to-transparent pointer-events-none z-0" />

                    {howItWorksSteps.map((step: any, idx: number) => (
                      <div key={idx} className="flex flex-col items-center text-center relative z-10 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center shadow-sm">
                          {step.step || (idx + 1)}
                        </div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold max-w-xs">
                          {step.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 6. Tools Deck Panel */}
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 p-4 rounded-[2rem] shadow-sm dark:glass">
                  <div className="w-full md:max-w-md">
                    <CategorySearch 
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder={t('categories.search_placeholder', 'Search tools inside this folder...')}
                    />
                  </div>

                  {/* Switch Filters Tab */}
                  <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl w-full md:w-auto overflow-x-auto">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                        activeFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {t('categories.All', 'All')} ({categoryTools.filter(t => t.isVisible).length})
                    </button>
                    <button
                      onClick={() => setActiveFilter('popular')}
                      className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                        activeFilter === 'popular' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {t('categories.Popular', 'Popular')} ({categoryTools.filter(t => t.popular && t.isVisible).length})
                    </button>
                    <button
                      onClick={() => setActiveFilter('trending')}
                      className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                        activeFilter === 'trending' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {t('categories.Trending', 'Trending')}
                    </button>
                  </div>
                </div>

                {/* Grid layout (2 columns on mobile) */}
                <div className="w-full">
                  {filteredTools.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6">
                      {filteredTools.map((tool) => (
                        <ToolCard 
                          key={tool.id} 
                          {...tool}
                          isPopular={tool.popular}
                          isTrending={tool.trending}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white dark:glass rounded-[2.5rem] border border-gray-200 dark:border-white/5 border-dashed shadow-sm">
                      <div className="bg-blue-50 dark:bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-white/5">
                        <Search className="w-8 h-8 text-blue-600 dark:text-gray-400" />
                      </div>
                      <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                        {t('categories.no_tools_match', 'No tools match criteria')}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-500 max-w-xs mx-auto font-medium">
                        {t('categories.no_tools_sub', 'Try checking description filters or reset active tabs.')}
                      </p>
                      <button
                        onClick={() => { setSearchQuery(""); setActiveFilter('all'); }}
                        className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] shadow-md animate-fade-in cursor-pointer"
                      >
                        {t('categories.reset_view', 'Reset Directory View')}
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* 7. FAQs Accordion */}
              {category.faqs && category.faqs.length > 0 && (
                <section className="border-t border-gray-200 dark:border-white/5 pt-12">
                  <div className="flex items-center gap-2 mb-8">
                    <HelpCircle className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">
                      {t('categories.faq_title', 'Frequently Asked Questions')}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {category.faqs.map((faq, index) => (
                      <details 
                        key={index} 
                        className="group border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.01] rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden shadow-sm"
                      >
                        <summary className="flex items-center justify-between p-5.5 text-left cursor-pointer focus:outline-none select-none hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors">
                          <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white group-open:text-blue-600 dark:group-open:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {t('categories.' + category.id + '.faq.q' + (index + 1), faq.question)}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300 group-open:rotate-180 group-open:text-blue-600 dark:group-open:text-blue-400" />
                        </summary>
                        <div className="px-5.5 pb-5.5 pt-0.5 border-t border-gray-100 dark:border-white/5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                          {t('categories.' + category.id + '.faq.a' + (index + 1), faq.answer)}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Blogs Section */}
              {relatedBlogs && relatedBlogs.length > 0 && (
                <section className="border-t border-gray-200 dark:border-white/5 pt-12 text-left">
                  <div className="flex items-center gap-2 mb-8">
                    <Sparkles className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">
                      {t('categories.related_blogs_title', 'Related Blog Insights')}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedBlogs.map((rBlog, idx) => {
                      const formatReadingTime = (readingTime: string) => {
                        const match = readingTime.match(/(\d+)\s*min\s*read/i);
                        if (match) {
                          const mins = match[1];
                          return t('blog.minutes_read', `${mins} min read`).replace('{count}', mins);
                        }
                        return readingTime;
                      };
                      return (
                        <Link
                          key={rBlog.id}
                          href={localizeHref(`/blog/${rBlog.slug}`)}
                          className="p-6 rounded-[2rem] bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-blue-600/5 transition-all flex flex-col justify-between group h-52 text-left shadow-sm"
                        >
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500">
                              {t(`categories.${rBlog.category}`, rBlog.category)}
                            </span>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mt-2 leading-tight">
                              {rBlog.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-2 mt-2 font-sans leading-relaxed">
                              {rBlog.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                              {formatReadingTime(rBlog.readingTime)}
                            </span>
                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest flex items-center gap-1 select-none">
                              {t('blog.read_post', 'Read Post')}
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 8. Related Categories Grid */}
              <section className="border-t border-gray-200 dark:border-white/5 pt-12 text-left">
                <div className="flex items-center gap-2 mb-8">
                  <Grid className="w-4.5 h-4.5 text-blue-600 dark:text-blue-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">
                    {t('categories.explore_other_folders', 'Explore Other Folders')}
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categoriesData
                    .filter(c => c.slug !== slug)
                    .slice(0, 4)
                    .map((cat) => (
                      <Link
                        key={cat.id}
                        href={localizeHref(`/categories/${cat.slug}`)}
                        className="p-5 rounded-2xl bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-blue-600/5 transition-all group flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-xs font-black text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-white uppercase truncate">
                            {t('categories.' + cat.title, cat.title)}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors shrink-0" />
                      </Link>
                    ))}
                </div>
              </section>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}

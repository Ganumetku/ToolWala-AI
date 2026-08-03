"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { toolsData, Tool } from '@/data/tools';
import { useTranslation } from '@/components/I18nContext';

interface RelatedToolsSectionProps {
  currentSlug: string;
  category?: string;
  limit?: number; // Default 8
}

export default function RelatedToolsSection({
  currentSlug,
  category,
  limit = 8,
}: RelatedToolsSectionProps) {
  const { t, localizeHref } = useTranslation();

  // Find current tool object
  const currentTool = useMemo(() => {
    const cleanSlug = currentSlug.replace(/\/$/, '');
    return toolsData.find((t) => t.slug === cleanSlug) ||
           toolsData.find((t) => cleanSlug.startsWith(t.slug) || cleanSlug.includes(t.slug));
  }, [currentSlug]);

  const activeCategory = category || currentTool?.category || 'Utility Tools';

  // Automatically determine 6 to 8 related tools based on category & tag matching
  const relatedTools = useMemo(() => {
    const cleanSlug = currentSlug.replace(/\/$/, '');

    // Filter candidate tools
    const candidates = toolsData.filter(
      (t) => t.isVisible && t.status === 'published' && t.slug !== cleanSlug
    );

    // Score candidates based on relevance
    const scored = candidates.map((toolItem) => {
      let score = 0;

      // Same category match (highest weight)
      if (toolItem.category === activeCategory) {
        score += 50;
      }

      // Shared tags match
      if (currentTool && currentTool.tags) {
        const sharedTags = toolItem.tags.filter((tag) =>
          currentTool.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
        );
        score += sharedTags.length * 10;
      }

      // Trending/featured bonus
      if (toolItem.popular) score += 5;
      if (toolItem.trending) score += 5;
      if (toolItem.featured) score += 5;

      return { tool: toolItem, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((item) => item.tool);
  }, [currentSlug, activeCategory, currentTool, limit]);

  if (relatedTools.length === 0) return null;

  return (
    <section className="my-16 w-full max-w-7xl mx-auto font-sans relative z-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {t('tools.related_category', `${activeCategory} Suite`)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {t('tools.related_tools_heading', `Related ${activeCategory}`)}
          </h2>
        </div>

        <Link
          href={localizeHref('/tools')}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group cursor-pointer"
        >
          <span>{t('tools.view_all_tools', 'View All Tools')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Responsive 6 to 8 Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {relatedTools.map((toolItem) => (
          <Link
            key={toolItem.id}
            href={localizeHref(toolItem.href)}
            className="group relative p-6 rounded-[1.25rem] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all duration-300 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)] flex flex-col justify-between cursor-pointer"
          >
            {/* Top Row: Icon + Category Badge */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all shadow-sm">
                  {toolItem.icon}
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/5">
                  {toolItem.category}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight mb-2 line-clamp-1">
                {t(`tools.${toolItem.slug}.title`, toolItem.title)}
              </h3>
              <p className="text-xs font-medium text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-sans mb-6">
                {t(`tools.${toolItem.slug}.desc`, toolItem.description)}
              </p>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                {t('tools.use_tool', 'Use Tool')}
              </span>
              <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { toolsData, Tool } from '@/data/tools';
import { useTranslation } from '@/components/I18nContext';
import ToolCard from '@/components/ToolCard';

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
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {relatedTools.map((toolItem) => (
          <ToolCard
            key={toolItem.id}
            {...toolItem}
            isPopular={toolItem.popular}
            isTrending={toolItem.trending}
          />
        ))}
      </div>
    </section>
  );
}

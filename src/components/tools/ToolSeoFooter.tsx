"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { toolsData } from '@/data/tools';
import { getRelatedTools } from '@/lib/relatedTools';
import { categoriesData } from '@/data/categories';
import blogsData from '@/data/dynamic_blogs.json';
import { useTranslation } from '@/components/I18nContext';
import RelatedToolsSection from './RelatedToolsSection';

interface ToolSeoFooterProps {
  currentSlug: string;
}

export default function ToolSeoFooter({ currentSlug }: ToolSeoFooterProps) {
  const { t, locale, localizeHref } = useTranslation();

  // Find current tool matching slug (or matching landing page prefixes like compress-pdf-to-100kb -> compress-pdf)
  const tool = useMemo(() => {
    return toolsData.find(t => t.slug === currentSlug) || 
           toolsData.find(t => currentSlug.startsWith(t.slug) || currentSlug.includes(t.slug));
  }, [currentSlug]);

  // Find parent category
  const parentCategory = useMemo(() => {
    if (!tool) return null;
    return categoriesData.find(c => c.title === tool.category);
  }, [tool]);

  if (!tool) return null;

  return (
    <div className="mt-16 border-t border-slate-200/80 dark:border-white/5 pt-12 space-y-12 text-left max-w-7xl mx-auto w-full relative z-20 font-sans">
      
      {/* 1. Parent Category Link Banner */}
      {parentCategory && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 p-5 sm:p-6 bg-white dark:bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">{parentCategory.icon}</span>
            <div>
              <h4 className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                {t('tools.parent_category', 'Parent Category')}
              </h4>
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase mt-0.5 block">
                {t(`categories.${parentCategory.title}`, parentCategory.title)}
              </span>
            </div>
          </div>
          <Link 
            href={localizeHref(`/categories/${parentCategory.slug}/`)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            {t('tools.explore_category_dir', 'Explore Category Directory')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 2. Compact Trust Strip (2-3 lines) */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 p-5 sm:p-6 bg-white dark:bg-white/[0.01] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Client-Side Privacy Guarantee
            </h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 font-medium leading-relaxed mt-0.5">
              All operations execute locally inside your web browser. Documents are not uploaded to remote servers or stored in any database. Free with no account required.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-1.5 rounded-full shrink-0 border border-emerald-200 dark:border-emerald-500/20">
          100% In-Browser
        </div>
      </div>

      {/* 3. Single Curated Related Tools Section (Max 5 tools) */}
      <RelatedToolsSection currentSlug={currentSlug} category={tool?.category} limit={5} />
    </div>
  );
}

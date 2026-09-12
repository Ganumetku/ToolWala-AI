"use client";

import Link from 'next/link';
import { ToolCategory } from '@/data/tools';
import { ArrowRight, Star } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import PdfToolIcon from '@/components/PdfToolIcon';
import { startTopProgress } from '@/components/TopProgressBar';

export interface ToolCardProps {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  isPopular?: boolean;
  isTrending?: boolean;
  category?: ToolCategory;
}

export default function ToolCard({ id, slug, title, description, icon, href, isPopular, isTrending, category }: ToolCardProps) {
  const { t, localizeHref } = useTranslation();

  // Extract the tool's ID/slug from the href to look up translations
  const urlParts = href.replace(/\/$/, '').split('/');
  const rawSlug = urlParts[urlParts.length - 1] || '';
  const toolId = id || slug || rawSlug;

  const displayTitle = toolId ? t(`tools.${toolId}.title`, title) : title;
  const displayDescription = toolId ? t(`tools.${toolId}.description`, description) : description;
  const displayCategory = category ? t(`categories.${category}`, category) : category;
  const localizedHref = localizeHref(href);

  // Selective visual hierarchy for 1-2 top essential tools per category (clean UX, no badge overload)
  const TOP_PICK_IDS = new Set([
    'merge-pdf',
    'compress-pdf',
    'image-compressor',
    'passport-photo-maker',
    'resume-builder',
    'govt-photo-resizer',
    'gst-calculator',
  ]);
  const isTopFeatured = Boolean(isPopular && toolId && TOP_PICK_IDS.has(toolId));

  return (
    <div className="h-full relative group">
      <Link 
        href={localizedHref}
        onClick={() => startTopProgress()}
        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-[#0c1222] p-4.5 sm:p-5 transition-all duration-300 ease-out hover:-translate-y-1 w-full h-full shadow-[0_2px_8px_-2px_rgba(37,99,235,0.05),0_1px_4px_rgba(15,23,42,0.03)] hover:shadow-[0_14px_30px_-6px_rgba(37,99,235,0.12),0_4px_10px_-2px_rgba(15,23,42,0.04)] dark:shadow-none ${
          isTopFeatured
            ? 'border border-blue-400/50 dark:border-blue-500/40 ring-1 ring-blue-500/10 dark:ring-blue-400/15 hover:border-blue-500 dark:hover:border-blue-400 hover:ring-blue-500/20'
            : 'border border-slate-200/70 dark:border-white/[0.08] hover:border-blue-500 dark:hover:border-blue-400 hover:ring-1 hover:ring-blue-500/15 dark:hover:ring-blue-400/20'
        }`}
      >
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            {/* Top Row: Icon with rotation on hover + Subtle Top Pick Badge */}
            <div className="flex items-center justify-between mb-3.5">
              <PdfToolIcon 
                toolId={toolId || rawSlug} 
                iconName={icon} 
                category={category} 
                size="md" 
                className="transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3"
              />

              {isTopFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50/80 dark:bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 shrink-0">
                  <Star className="w-2.5 h-2.5 fill-blue-600 dark:fill-blue-400" />
                  <span>Top Pick</span>
                </span>
              )}
            </div>

            {/* Title — matching exact iLovePDF font weight and color */}
            <h3 className="text-[16px] sm:text-[17px] font-semibold leading-snug text-[#33333b] dark:text-white mb-1.5 group-hover:text-[#161616] dark:group-hover:text-blue-400 transition-colors tracking-tight line-clamp-2">
              {displayTitle}
            </h3>

            {/* Description — matching exact iLovePDF font color and line-height */}
            <p className="text-[12.5px] sm:text-[13px] font-normal leading-[1.5] text-[#707078] dark:text-slate-400 line-clamp-2 sm:line-clamp-3">
              {displayDescription}
            </p>
          </div>

          {/* Minimal Bottom Action Indicator */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100/90 dark:border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
              {displayCategory}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </div>
  );
}

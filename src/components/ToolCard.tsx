"use client";

import Link from 'next/link';
import { ToolCategory } from '@/data/tools';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import ToolIcon from '@/components/ToolIcon';

export interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  isPopular?: boolean;
  isTrending?: boolean;
  category?: ToolCategory;
}

export default function ToolCard({ title, description, icon, href, isPopular, isTrending, category }: ToolCardProps) {
  const { t, localizeHref } = useTranslation();

  // Extract the tool's ID/slug from the href to look up translations
  const urlParts = href.replace(/\/$/, '').split('/');
  const toolId = urlParts[urlParts.length - 1] || '';

  const displayTitle = toolId ? t(`tools.${toolId}.title`, title) : title;
  const displayDescription = toolId ? t(`tools.${toolId}.description`, description) : description;
  const displayCategory = category ? t(`categories.${category}`, category) : category;
  const localizedHref = localizeHref(href);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full relative group"
    >
      {/* Premium Outer Glow Gradient */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/25 via-indigo-500/25 to-purple-500/25 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <Link 
        href={localizedHref}
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[20px] border border-[#E8ECF4] dark:border-white/5 bg-white dark:bg-white/[0.02] p-4 sm:p-6 transition-all duration-300 hover:-translate-y-[5px] hover:border-[#2563EB]/40 w-full h-full shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_35px_rgba(15,23,42,0.1)] dark:glass dark:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
      >
        {/* Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 dark:from-blue-600/10 via-transparent to-[#7C3AED]/5 dark:to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Desktop Badges Container */}
        <div className="absolute top-4 right-4 hidden sm:flex flex-col gap-1.5 items-end z-10">
          {isPopular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50/80 dark:bg-blue-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 backdrop-blur-md shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              {t('home.popular', 'Popular')}
            </span>
          )}
          {isTrending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50/80 dark:bg-purple-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 backdrop-blur-md shadow-sm">
              <TrendingUp className="w-2.5 h-2.5" />
              {t('home.trending', 'Trending')}
            </span>
          )}
          {category && (
            <span className="inline-flex items-center rounded-full bg-[#F8FAFC] dark:bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#475569] dark:text-gray-400 border border-[#E8ECF4] dark:border-white/10 backdrop-blur-md">
              {displayCategory}
            </span>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-between">
          <div>
            {/* Icon & Category/Status Badge Row */}
            <div className="flex items-start justify-between mb-3 sm:mb-5 gap-2">
              <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-50/80 dark:bg-gradient-to-br dark:from-blue-500/10 dark:to-indigo-500/10 text-2xl sm:text-4xl shadow-sm border border-blue-100 dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative shrink-0">
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-[#2563EB]/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <ToolIcon icon={icon} className="w-6 h-6 sm:w-9 sm:h-9 text-2xl sm:text-3xl" />
              </div>
              
              {/* Category & Status Badge on Mobile */}
              <div className="flex flex-col gap-1 items-end sm:hidden z-10 max-w-[60%]">
                {isPopular && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50/80 dark:bg-blue-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 backdrop-blur-md">
                    <Sparkles className="w-2 h-2" />
                    Popular
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center rounded-full bg-[#F8FAFC] dark:bg-white/5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#475569] dark:text-gray-400 border border-[#E8ECF4] dark:border-white/10 backdrop-blur-md truncate max-w-full">
                    {displayCategory}
                  </span>
                )}
              </div>
            </div>

            <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-xl font-bold sm:font-black text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors tracking-tight leading-snug line-clamp-2 min-h-[2.25rem] sm:min-h-[2.75rem]">{displayTitle}</h3>
            <p className="text-[11px] sm:text-sm text-[#475569] dark:text-gray-400 leading-relaxed font-medium line-clamp-2 sm:line-clamp-3 group-hover:text-[#0F172A] dark:group-hover:text-gray-300 transition-colors">{displayDescription}</p>
          </div>

          {/* Action Button & quick open hover link */}
          <div className="relative z-10 mt-4 sm:mt-6 pt-2.5 sm:pt-3 border-t border-[#E8ECF4]/60 dark:border-white/5 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-xs font-black uppercase tracking-wider sm:tracking-[0.2em] text-[#2563EB] dark:text-blue-500 transition-all group-hover:text-[#1D4ED8] dark:group-hover:text-blue-400 whitespace-nowrap">
              {t('home.open_tool', 'Open Tool')}
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1 shrink-0" />
            </div>
            <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-[#64748B] dark:text-gray-500 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap">
              {t('home.instant_run', 'Instant Run')}
            </span>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-transparent to-blue-600/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </motion.div>
  );
}

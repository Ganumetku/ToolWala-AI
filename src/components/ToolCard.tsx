"use client";

import Link from 'next/link';
import { ToolCategory } from '@/data/tools';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import ToolIcon, { getCategoryStyle } from '@/components/ToolIcon';
import PdfToolIcon, { isPdfTool } from '@/components/PdfToolIcon';

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

  // Category specific accent styles
  const catStyle = getCategoryStyle(category);
  const isPdf = category === 'PDF Tools' || isPdfTool(toolId) || isPdfTool(rawSlug);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="h-full relative group"
    >
      {/* Subtle Hover Glow Gradient */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

      <Link 
        href={localizedHref}
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/90 dark:border-white/10 bg-white dark:bg-[#0c1222] p-4 sm:p-5 transition-all duration-300 hover:border-blue-500/50 dark:hover:border-blue-500/50 w-full h-full shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.08)] dark:shadow-none"
      >
        {/* Subtle Ambient Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] dark:from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            {/* Top Row: Icon & Minimal Badge */}
            <div className="flex items-center justify-between mb-3.5 gap-2">
              <PdfToolIcon 
                toolId={toolId || rawSlug} 
                iconName={icon} 
                category={category} 
                size="md" 
                className="group-hover:scale-105" 
              />
              
              {isPopular && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 truncate">
                  <Sparkles className="w-2.5 h-2.5 shrink-0" />
                  <span>Popular</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-[15px] sm:text-[16px] font-bold leading-snug text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight line-clamp-2 min-h-[2.3rem]">
              {displayTitle}
            </h3>

            {/* Description */}
            <p className="text-[12px] sm:text-[12.5px] font-normal leading-relaxed text-slate-500 dark:text-gray-400 line-clamp-3 group-hover:text-slate-700 dark:group-hover:text-gray-300 transition-colors min-h-[3.2rem]">
              {displayDescription}
            </p>
          </div>

          {/* Minimal Bottom Action Indicator */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {displayCategory}
            </span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

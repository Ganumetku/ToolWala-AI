"use client";

import Link from 'next/link';
import { ToolCategory } from '@/data/tools';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

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
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full relative group"
    >
      {/* Premium Outer Glow Gradient */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/25 via-indigo-500/25 to-purple-500/25 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <Link 
        href={localizedHref}
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/40 w-full h-full glass shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
      >
        {/* Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badges Container */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end z-10">
          {isPopular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 backdrop-blur-md shadow-lg">
              <Sparkles className="w-2.5 h-2.5" />
              Popular
            </span>
          )}
          {isTrending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20 backdrop-blur-md shadow-lg">
              <TrendingUp className="w-2.5 h-2.5" />
              Trending
            </span>
          )}
          {category && (
            <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
              {displayCategory}
            </span>
          )}
        </div>

        <div className="relative z-10 mt-2">
          {/* Icon frame with micro-glow */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-4xl shadow-2xl border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">{icon}</span>
          </div>
          <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight uppercase leading-none">{displayTitle}</h3>
          <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">{displayDescription}</p>
        </div>

        {/* Action Button & quick open hover link */}
        <div className="relative z-10 mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:text-blue-400">
            {t('home.open_tool', 'Open Tool')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
            {t('home.instant_run', 'Instant Run')}
          </span>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-blue-600/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </motion.div>
  );
}


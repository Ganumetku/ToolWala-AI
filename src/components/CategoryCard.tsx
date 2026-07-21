"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CategoryMetadata } from '@/data/categories';
import { useTranslation } from '@/components/I18nContext';

interface CategoryCardProps {
  category: CategoryMetadata;
  toolCount: number;
  featured?: boolean;
}

export default function CategoryCard({ category, toolCount, featured = false }: CategoryCardProps) {
  const { t, localizeHref } = useTranslation();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full relative group"
    >
      {/* Outer border glow gradient */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${
        featured 
          ? 'from-blue-500/25 via-indigo-500/25 to-purple-500/25' 
          : 'from-blue-600/10 via-transparent to-purple-600/10'
      } rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

      <Link
        href={localizeHref(`/categories/${category.slug}`)}
        className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.01] hover:bg-gray-50 dark:hover:bg-white/[0.03] hover:border-blue-500/30 p-7 transition-all duration-300 w-full h-full shadow-sm hover:shadow-md dark:glass"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div>
          {/* Glowing Icon Frame */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-white/5 text-3xl shadow-sm dark:shadow-xl border border-blue-100 dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/15 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">{category.icon}</span>
          </div>

          <h3 className="mb-2 text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase leading-none tracking-tight">
            {t('categories.' + category.title, category.title)}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-500 leading-relaxed font-semibold line-clamp-3 group-hover:text-gray-700 dark:group-hover:text-gray-400 transition-colors">
            {t('categories.' + category.id + '.desc', category.description)}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between text-xs font-black uppercase tracking-widest relative z-10">
          <span className="text-blue-600 dark:text-blue-500 group-hover:text-blue-700 dark:group-hover:text-blue-400 flex items-center gap-1 text-[10px]">
            {t('categories.explore_category', 'Explore Category')}
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="text-[10px] text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/5 font-mono font-bold">
            {toolCount} {toolCount === 1 ? t('categories.tool', 'tool') : t('categories.tools_plural', 'tools')}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

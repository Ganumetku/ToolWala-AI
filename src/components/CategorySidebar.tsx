"use client";

import Link from 'next/link';
import { categoriesData } from '@/data/categories';
import { Grid, Sparkles } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

interface CategorySidebarProps {
  activeSlug: string;
}

export default function CategorySidebar({ activeSlug }: CategorySidebarProps) {
  const { t, localizeHref } = useTranslation();

  return (
    <aside className="glass border border-white/5 bg-white/[0.01] p-6.5 rounded-[2rem] space-y-6 sticky top-28 hidden lg:block w-72">
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <Grid className="w-4.5 h-4.5 text-blue-500" />
        <h3 className="text-xs font-black uppercase tracking-widest text-white">{t('categories.sidebar_title', 'Categories')}</h3>
      </div>

      <nav className="space-y-1.5">
        {categoriesData.map((cat) => {
          const isActive = cat.slug === activeSlug;
          return (
            <Link
              key={cat.id}
              href={localizeHref(`/categories/${cat.slug}`)}
              className={`flex items-center justify-between px-4.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className={`text-base transition-transform group-hover:scale-110 duration-300`}>{cat.icon}</span>
                <span>{t('categories.' + cat.title, cat.title)}</span>
              </span>
              {isActive && <Sparkles className="w-3.5 h-3.5 text-white" />}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-white/5 pt-4 text-center">
        <Link 
          href={localizeHref('/categories')}
          className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400"
        >
          {t('categories.view_all_folders', 'View All Folders')} →
        </Link>
      </div>
    </aside>
  );
}

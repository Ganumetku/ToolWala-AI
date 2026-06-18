"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

interface CategoryHeaderProps {
  title: string;
  icon: string;
  description: string;
}

export default function CategoryHeader({ title, icon, description }: CategoryHeaderProps) {
  const { t, localizeHref } = useTranslation();
  const translatedTitle = t(`categories.${title}`, title);

  return (
    <div className="text-center max-w-4xl mx-auto mb-16 animate-in fade-in duration-500">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8">
        <Link href={localizeHref("/")} className="hover:text-white transition-colors">{t('nav.home', 'Home')}</Link>
        <ChevronRight className="w-3 h-3 text-gray-600" />
        <Link href={localizeHref("/categories")} className="hover:text-white transition-colors">{t('nav.categories', 'Categories')}</Link>
        <ChevronRight className="w-3 h-3 text-gray-600" />
        <span className="text-blue-400">{translatedTitle}</span>
      </nav>

      {/* Category Icon Badge */}
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600/10 to-purple-600/10 text-5xl border border-white/10 shadow-2xl mb-8 scale-100 hover:scale-105 transition-transform duration-300">
        {icon}
      </div>

      {/* Category Page Title */}
      <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 uppercase leading-none">
        {translatedTitle} <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
          {t('categories.local_utilities', 'Local Utilities')}
        </span>
      </h1>

      {/* Description copy */}
      <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium max-w-2xl mx-auto">
        {description}
      </p>

    </div>
  );
}

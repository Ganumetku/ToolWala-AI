"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import PdfToolIcon from '@/components/PdfToolIcon';

interface CategoryHeaderProps {
  title: string;
  icon: string;
  description: string;
}

export default function CategoryHeader({ title, icon, description }: CategoryHeaderProps) {
  const { t, localizeHref } = useTranslation();
  const translatedTitle = t(`categories.${title}`, title);

  return (
    <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10 animate-in fade-in duration-500">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 sm:mb-5">
        <Link href={localizeHref("/")} className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('nav.home', 'Home')}</Link>
        <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-600" />
        <Link href={localizeHref("/categories")} className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('nav.categories', 'Categories')}</Link>
        <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-600" />
        <span className="text-blue-600 dark:text-blue-400">{translatedTitle}</span>
      </nav>

      {/* Category Icon Badge */}
      <div className="inline-flex items-center justify-center mb-4 sm:mb-5">
        <PdfToolIcon 
          toolId={title.toLowerCase().replace(/\s+/g, '-')} 
          iconName={icon} 
          category={title} 
          size="xl" 
          className="hover:scale-105 transition-transform duration-300 shadow-lg"
        />
      </div>

      {/* Category Page Title */}
      <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3 sm:mb-4 uppercase leading-tight">
        {translatedTitle} <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
          {t('categories.local_utilities', 'Local Utilities')}
        </span>
      </h1>

      {/* Description copy */}
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-2xl mx-auto">
        {description}
      </p>

    </div>
  );
}

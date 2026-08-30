"use client";

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { t, localizeHref } = useTranslation();

  // Strip redundant Home item if caller already passed Home as first item
  const filteredItems = items.filter(
    (it, idx) => !(idx === 0 && (it.href === '/' || it.label.toLowerCase() === 'home' || it.label.toLowerCase() === t('nav.home', 'Home').toLowerCase()))
  );

  return (
    <nav className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest mb-6 select-none">
      <Link
        href={localizeHref('/')}
        className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
      >
        <Home className="w-3.5 h-3.5 shrink-0" />
        <span>{t('nav.home', 'Home')}</span>
      </Link>

      {filteredItems.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600 shrink-0" />
          {item.href ? (
            <Link
              href={localizeHref(item.href)}
              className="hover:text-blue-500 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-gray-300 font-black truncate max-w-[150px] sm:max-w-xs">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

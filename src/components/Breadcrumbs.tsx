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

  return (
    <nav className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest mb-8 select-none">
      <Link
        href={localizeHref('/')}
        className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        {t('nav.home', 'Home')}
      </Link>

      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
          {item.href ? (
            <Link
              href={localizeHref(item.href)}
              className="hover:text-blue-500 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-300 font-black truncate max-w-[150px] sm:max-w-xs">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

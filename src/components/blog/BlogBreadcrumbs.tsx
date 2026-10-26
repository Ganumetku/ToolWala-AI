"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { BreadcrumbItem } from "@/lib/blog-seo";
import { useTranslation } from "@/components/I18nContext";

interface BlogBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function BlogBreadcrumbs({ items, className = "" }: BlogBreadcrumbsProps) {
  const { t, localizeHref } = useTranslation();
  if (items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-6 sm:mb-8 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          
          let displayName = item.name;
          if (item.name.toLowerCase() === 'home') {
            displayName = t('nav.home', 'Home');
          } else if (item.name.toLowerCase() === 'blog') {
            displayName = t('nav.blog', 'Blog');
          } else {
            displayName = t(`categories.${item.name}`, item.name);
          }

          const href = localizeHref(item.href);

          return (
            <li key={item.href} className="flex items-center gap-1.5 sm:gap-2">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />}
              {isLast ? (
                <span className="text-slate-800 dark:text-slate-200 font-bold line-clamp-1 max-w-[200px] sm:max-w-md" aria-current="page">
                  {displayName}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {i === 0 && <Home className="w-3.5 h-3.5" />}
                  <span className={i === 0 ? "sr-only sm:not-sr-only" : ""}>{displayName}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

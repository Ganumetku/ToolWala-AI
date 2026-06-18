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
    <nav aria-label="Breadcrumb" className={`mb-8 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
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
            <li key={item.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />}
              {isLast ? (
                <span className="text-gray-400 line-clamp-1 max-w-[200px] sm:max-w-none" aria-current="page">
                  {displayName}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 shrink-0"
                >
                  {i === 0 && <Home className="w-3 h-3" />}
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

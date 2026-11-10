"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPaginationProps {
  page: number;
  totalPages: number;
  basePath?: string;
  onPageChange?: (page: number) => void;
}

export default function BlogPagination({
  page,
  totalPages,
  basePath,
  onPageChange,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const normalizedBase = basePath
    ? basePath.endsWith('/')
      ? basePath
      : `${basePath}/`
    : undefined;

  const PageButton = ({ p }: { p: number }) => {
    const isActive = p === page;
    const className = `min-w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
      isActive
        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-600"
        : "bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-white/10 border border-slate-200/90 dark:border-white/10 shadow-sm"
    }`;

    if (normalizedBase) {
      const href = p === 1 ? normalizedBase : `${normalizedBase}?page=${p}`;
      return (
        <Link href={href} className={className}>
          {p}
        </Link>
      );
    }

    return (
      <button type="button" onClick={() => onPageChange?.(p)} className={`${className} cursor-pointer`}>
        {p}
      </button>
    );
  };

  return (
    <nav className="flex items-center justify-center gap-2 pt-10" aria-label="Blog pagination">
      {page > 1 ? (
        normalizedBase ? (
          <Link
            href={page === 2 ? normalizedBase : `${normalizedBase}?page=${page - 1}`}
            className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-white/10 transition-colors shadow-sm"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onPageChange?.(page - 1)}
            className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-sm"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )
      ) : (
        <div className="w-10" />
      )}

      <div className="flex items-center gap-2">
        {pages.map((p) => (
          <PageButton key={p} p={p} />
        ))}
      </div>

      {page < totalPages ? (
        normalizedBase ? (
          <Link
            href={`${normalizedBase}?page=${page + 1}`}
            className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-white/10 transition-colors shadow-sm"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onPageChange?.(page + 1)}
            className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-sm"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )
      ) : (
        <div className="w-10" />
      )}
    </nav>
  );
}

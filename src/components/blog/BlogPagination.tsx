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

  const PageButton = ({ p }: { p: number }) => {
    const isActive = p === page;
    const className = `min-w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
      isActive
        ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]"
        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
    }`;

    if (basePath) {
      const href = p === 1 ? basePath : `${basePath}?page=${p}`;
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
        basePath ? (
          <Link
            href={page === 2 ? basePath : `${basePath}?page=${page - 1}`}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onPageChange?.(page - 1)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
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
        basePath ? (
          <Link
            href={`${basePath}?page=${page + 1}`}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onPageChange?.(page + 1)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
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

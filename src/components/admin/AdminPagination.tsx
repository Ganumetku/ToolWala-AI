"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  itemLabel?: string;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = "items"
}: AdminPaginationProps) {
  if (totalItems === 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.005]">
      {/* Items Range & Page Size */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-gray-400">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{startIndex + 1}</strong> to <strong className="text-slate-900 dark:text-white">{endIndex}</strong> of <strong className="text-slate-900 dark:text-white">{totalItems}</strong> {itemLabel}
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-slate-400">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090d16] px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`gap-${idx}`} className="px-1 text-slate-400 font-bold">
                  ...
                </span>
              );
            }
            const pageNum = Number(p);
            const isActive = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`h-8 w-8 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/10'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

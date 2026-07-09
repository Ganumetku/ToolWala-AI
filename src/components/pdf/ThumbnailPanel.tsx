"use client";

import { Copy, Trash, RefreshCw } from 'lucide-react';
import type { PageItem } from '@/types/pdf';

interface ThumbnailPanelProps {
  pageList: PageItem[];
  activePageId: string | null;
  thumbnailUrls: Record<number, string>;
  onPageClick: (pageId: string) => void;
  onDuplicatePage: (idx: number) => void;
  onDeletePage: (idx: number) => void;
}

export function ThumbnailPanel({
  pageList,
  activePageId,
  thumbnailUrls,
  onPageClick,
  onDuplicatePage,
  onDeletePage,
}: ThumbnailPanelProps) {
  return (
    <aside className="w-48 bg-slate-950 border-r border-slate-900 flex flex-col overflow-hidden select-none">
      <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-slate-900/20">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Pages</span>
        <span className="text-xs font-bold text-slate-400">{pageList.length} total</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 custom-scrollbar">
        {pageList.map((item, idx) => {
          const isActive = item.id === activePageId;
          const thumb = thumbnailUrls[item.originalPageNum];
          return (
            <div
              key={item.id}
              className={`flex flex-col items-center gap-2 p-2 rounded-2xl border transition-all relative group ${
                isActive
                  ? 'bg-blue-950/20 border-blue-500/80 shadow-md shadow-blue-500/5'
                  : 'bg-slate-900/10 border-slate-900 hover:border-slate-800'
              }`}
            >
              {/* Page thumbnail click */}
              <div onClick={() => onPageClick(item.id)} className="cursor-pointer w-full flex justify-center">
                {thumb ? (
                  <img src={thumb} alt={`Page ${idx + 1}`} className="w-28 h-auto shadow-md rounded-lg border border-slate-800 object-contain" />
                ) : (
                  <div className="w-28 h-36 bg-slate-900 animate-pulse rounded-lg border border-slate-800 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-slate-600 animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Page Actions */}
              <div className="flex items-center justify-between w-full px-1">
                <span className={`text-[10px] font-bold ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                  P. {idx + 1}
                </span>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                  <button
                    onClick={() => onDuplicatePage(idx)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    title="Duplicate page"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeletePage(idx)}
                    className="p-1 hover:bg-red-950/30 rounded text-slate-400 hover:text-red-400"
                    title="Delete page"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

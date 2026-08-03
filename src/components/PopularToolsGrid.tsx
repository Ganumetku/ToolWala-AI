"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Wrench, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

export interface EssentialToolItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  category: string;
  badge?: string;
}

export const ESSENTIAL_TOOLS: EssentialToolItem[] = [
  {
    id: "edit-pdf",
    title: "Edit & Organize PDF",
    description: "Reorder pages, rotate canvas, split sections, and clean PDF documents online for free.",
    icon: "✏️",
    href: "/tools/organize-pdf",
    category: "PDF Tools",
    badge: "Popular"
  },
  {
    id: "pdf-to-word",
    title: "PDF to Word Converter",
    description: "Convert PDF files into editable Microsoft Word (.docx) documents with layout accuracy.",
    icon: "📄",
    href: "/tools/pdf-to-word-converter",
    category: "PDF Tools",
    badge: "High Demand"
  },
  {
    id: "image-compressor",
    title: "Image Compressor",
    description: "Compress JPG, PNG, and WebP images up to 90% without visible quality loss.",
    icon: "📉",
    href: "/tools/image-compressor",
    category: "Image Tools",
    badge: "Fast"
  },
  {
    id: "merge-pdf",
    title: "Merge PDF Files",
    description: "Combine multiple PDF documents into a single organized PDF file instantly in your browser.",
    icon: "🧩",
    href: "/tools/merge-pdf",
    category: "PDF Tools",
    badge: "Top Utility"
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Extract specific pages or split large PDF files into separate individual documents.",
    icon: "✂️",
    href: "/tools/split-pdf",
    category: "PDF Tools"
  },
  {
    id: "jpg-to-pdf",
    title: "JPG to PDF Converter",
    description: "Convert JPG, PNG, and WebP images into a clean PDF document with custom margins.",
    icon: "🖼️",
    href: "/tools/jpg-to-pdf",
    category: "PDF Tools"
  },
  {
    id: "passport-photo-maker",
    title: "Passport Photo Maker",
    description: "Create official passport photos for any country with AI background cleaning & exact sizing.",
    icon: "📸",
    href: "/tools/passport-photo-maker",
    category: "Image Tools",
    badge: "AI Powered"
  },
  {
    id: "bg-remover",
    title: "AI Background Remover",
    description: "Remove image backgrounds instantly in your browser using high-precision local AI.",
    icon: "✨",
    href: "/tools/bg-remover",
    category: "Image Tools",
    badge: "100% Private"
  }
];

export default function PopularToolsGrid() {
  const { t, localizeHref } = useTranslation();

  return (
    <section className="py-20 relative overflow-hidden bg-slate-50/50 dark:bg-black/10 border-b border-gray-200 dark:border-white/5 transition-colors duration-250 font-sans">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-4 shadow-sm">
              <Wrench className="w-3.5 h-3.5" />
              {t('tools.badge_essential', 'ESSENTIAL SUITE')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              {t('tools.popular_tools_title', 'Popular & Essential Tools')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium text-sm max-w-2xl">
              {t('tools.popular_tools_subtitle', 'Fast, free, and 100% browser-based tools for PDF editing, image compression, format conversion, and document processing.')}
            </p>
          </div>

          <Link 
            href={localizeHref('/tools')}
            className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-white/10 hover:border-blue-500/40 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <span>{t('tools.explore_all', 'Explore All 60+ Tools')}</span>
            <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </Link>
        </div>

        {/* Essential Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ESSENTIAL_TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={localizeHref(tool.href)}
              className="group relative p-6 rounded-[1.5rem] bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:bg-slate-50/80 dark:hover:bg-white/[0.04] transition-all duration-300 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)] flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all shadow-sm">
                    {tool.icon}
                  </div>
                  {tool.badge && (
                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
                      {tool.badge}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight mb-2 line-clamp-1">
                  {t(`tools.${tool.id}.title`, tool.title)}
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-sans mb-6">
                  {t(`tools.${tool.id}.desc`, tool.description)}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  {t('tools.open_tool', 'Open Tool')}
                </span>
                <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Wrench, Star } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import ToolIcon, { getCategoryStyle } from '@/components/ToolIcon';
import PdfToolIcon, { isPdfTool } from '@/components/PdfToolIcon';

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
    id: "merge-pdf",
    title: "Merge PDF Files",
    description: "Combine multiple PDF documents into a single organized PDF file instantly in your browser.",
    icon: "Merge",
    href: "/tools/merge-pdf/",
    category: "PDF Tools",
    badge: "Top Pick"
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Extract specific pages or split large PDF files into separate individual documents.",
    icon: "SplitSquareHorizontal",
    href: "/tools/split-pdf/",
    category: "PDF Tools"
  },
  {
    id: "edit-pdf",
    title: "Edit & Organize PDF",
    description: "Reorder pages, rotate canvas, split sections, and clean PDF documents online for free.",
    icon: "FilePenLine",
    href: "/tools/organize-pdf/",
    category: "PDF Tools",
  },
  {
    id: "pdf-to-word",
    title: "PDF to Word Converter",
    description: "Convert PDF files into editable Microsoft Word (.docx) documents with layout accuracy.",
    icon: "FileText",
    href: "/tools/pdf-to-word-converter/",
    category: "PDF Tools",
  },
  {
    id: "image-compressor",
    title: "Image Compressor Online",
    description: "Reduce JPG, PNG, and WebP image file sizes with adjustable compression settings and quality controls.",
    icon: "ImageDown",
    href: "/tools/image-compressor/",
    category: "Image Tools",
    badge: "Top Pick"
  },
  {
    id: "jpg-to-pdf",
    title: "JPG to PDF Converter",
    description: "Convert JPG, PNG, and WebP images into a clean PDF document with custom margins.",
    icon: "Image",
    href: "/tools/jpg-to-pdf/",
    category: "PDF Tools"
  },
  {
    id: "passport-photo-maker",
    title: "Passport Photo Maker",
    description: "Create official passport photos for any country with AI background cleaning and exact sizing.",
    icon: "IdCard",
    href: "/tools/passport-photo-maker/",
    category: "Image Tools",
    badge: "Top Pick"
  },
  {
    id: "bg-remover",
    title: "AI Background Remover",
    description: "Remove image backgrounds instantly in your browser using high-precision local AI.",
    icon: "Wand2",
    href: "/tools/bg-remover/",
    category: "Image Tools",
  }
];

export default function PopularToolsGrid() {
  const { t, localizeHref } = useTranslation();

  return (
    <section className="py-20 relative overflow-hidden bg-gray-50/50 dark:bg-black/10 border-b border-gray-200 dark:border-white/5 transition-colors duration-250 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-4 shadow-sm">
              <Wrench className="w-3.5 h-3.5" />
              {t('tools.badge_essential', 'ESSENTIAL SUITE')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t('tools.popular_tools_title', 'Popular & Essential Tools')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium text-sm max-w-2xl">
              {t('tools.popular_tools_subtitle', 'Fast, free, and 100% browser-based tools for PDF editing, image compression, format conversion, and document processing.')}
            </p>
          </div>

          <Link 
            href={localizeHref('/tools/')}
            className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-white/10 hover:border-blue-500/40 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <span>{t('tools.explore_all', 'Explore All 60+ Tools')}</span>
            <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </Link>
        </div>

        {/* Essential Tools Grid */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {ESSENTIAL_TOOLS.map((tool) => {
            const catStyle = getCategoryStyle(tool.category);
            const isPdf = tool.category === 'PDF Tools' || isPdfTool(tool.id);
            const isTopPick = tool.badge === 'Top Pick';
            return (
              <Link
                key={tool.id}
                href={localizeHref(tool.href)}
                className={`group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c1222] transition-all duration-300 ease-out hover:-translate-y-1 shadow-[0_2px_8px_-2px_rgba(37,99,235,0.05),0_1px_4px_rgba(15,23,42,0.03)] hover:shadow-[0_14px_30px_-6px_rgba(37,99,235,0.12),0_4px_10px_-2px_rgba(15,23,42,0.04)] dark:shadow-none flex flex-col justify-between cursor-pointer ${
                  isTopPick
                    ? 'border border-blue-400/50 dark:border-blue-500/40 ring-1 ring-blue-500/10 dark:ring-blue-400/15 hover:border-blue-500 dark:hover:border-blue-400 hover:ring-blue-500/20'
                    : 'border border-slate-200/70 dark:border-white/[0.08] hover:border-blue-500 dark:hover:border-blue-400 hover:ring-1 hover:ring-blue-500/15 dark:hover:ring-blue-400/20'
                }`}
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <PdfToolIcon 
                      toolId={tool.id} 
                      iconName={tool.icon} 
                      category={tool.category} 
                      size="md" 
                      className="transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3" 
                    />
                    {tool.badge && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50/90 dark:bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/25 shrink-0">
                        {isTopPick && <Star className="w-2.5 h-2.5 fill-blue-600 dark:fill-blue-400" />}
                        <span>{tool.badge}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description — matching exact ToolCard font weight and styling */}
                  <h3 className="text-[16px] sm:text-[17px] font-semibold leading-snug text-[#33333b] dark:text-white mb-1.5 group-hover:text-[#161616] dark:group-hover:text-blue-400 transition-colors tracking-tight line-clamp-2 min-h-[2.3rem]">
                    {t(`tools.${tool.id}.title`, tool.title)}
                  </h3>
                  <p className="text-[12.5px] sm:text-[13px] font-normal leading-[1.5] text-[#707078] dark:text-slate-400 line-clamp-3 min-h-[3.2rem]">
                    {t(`tools.${tool.id}.desc`, tool.description)}
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-3 mt-4 border-t border-slate-100/90 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {t(`categories.${tool.category}`, tool.category)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}

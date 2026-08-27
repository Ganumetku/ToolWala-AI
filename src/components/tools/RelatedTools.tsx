"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { toolsData } from '@/data/tools';
import ToolIcon, { getCategoryStyle } from '@/components/ToolIcon';

interface RelatedToolsProps {
  currentSlug: string;
  maxTools?: number;
}

export default function RelatedTools({ currentSlug, maxTools = 3 }: RelatedToolsProps) {
  // Find current tool
  const currentTool = toolsData.find(t => t.slug === currentSlug);
  const category = currentTool?.category || "PDF Tools";

  // Filter tools: must be visible, published, not the current tool, and preferably in the same category
  const related = toolsData
    .filter(t => t.isVisible && t.status === 'published' && t.slug !== currentSlug)
    .sort((a, b) => {
      // Prioritize same category
      if (a.category === category && b.category !== category) return -1;
      if (a.category !== category && b.category === category) return 1;
      // Then prioritize trending/featured
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;
      return 0;
    })
    .slice(0, maxTools);

  if (related.length === 0) return null;

  return (
    <div className="mb-12 animate-fade-in relative z-10">
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 ml-1">
        Explore Related Utilities
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((tool) => {
          const catStyle = getCategoryStyle(tool.category);
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-7 transition-all duration-500 hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:border-blue-500/50 shadow-sm dark:glass cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className={`inline-flex items-center rounded-full ${catStyle.badgeBg} px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${catStyle.badgeText} border ${catStyle.badgeBorder} backdrop-blur-md`}>
                  {tool.category.replace(" Tools", "")}
                </span>
              </div>

              <div className="relative z-10 mt-2">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${catStyle.bg} ${catStyle.text} border ${catStyle.border} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm`}>
                  <ToolIcon icon={tool.icon} className="w-7 h-7" strokeWidth={1.75} />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-bold leading-[1.3] text-[#0F172A] dark:text-[#F1F5F9] mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                  {tool.title}
                </h3>
                <p className="text-[14px] font-normal leading-[1.6] text-[#6B7280] dark:text-[#9CA3AF] line-clamp-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {tool.description}
                </p>
              </div>

              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

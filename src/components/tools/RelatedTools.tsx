"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { toolsData } from '@/data/tools';

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
        {related.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
              <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                {tool.category.replace(" Tools", "")}
              </span>
            </div>

            <div className="relative z-10 mt-2">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 text-2xl">
                {tool.icon}
              </div>
              <h3 className="mb-3 text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors tracking-tight uppercase">
                {tool.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                {tool.description}
              </p>
            </div>

            <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
              Launch Utility
              <ArrowRight className="w-4 h-4 animate-pulse" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

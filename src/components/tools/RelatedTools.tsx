"use client";

import React from 'react';
import { toolsData } from '@/data/tools';
import ToolCard from '@/components/ToolCard';

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
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {related.map((tool) => (
          <ToolCard
            key={tool.id}
            {...tool}
            isPopular={tool.popular}
            isTrending={tool.trending}
          />
        ))}
      </div>
    </div>
  );
}

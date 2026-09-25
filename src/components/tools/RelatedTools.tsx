"use client";

import React from 'react';
import ToolCard from '@/components/ToolCard';
import { getRelatedTools } from '@/lib/relatedTools';

interface RelatedToolsProps {
  currentSlug: string;
  maxTools?: number;
}

export default function RelatedTools({ currentSlug, maxTools = 3 }: RelatedToolsProps) {
  const related = getRelatedTools(currentSlug, maxTools);

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

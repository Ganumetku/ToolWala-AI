"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import ToolSeoFooter from '@/components/tools/ToolSeoFooter';
import AutoToolSchema from '@/components/analytics/AutoToolSchema';

interface ToolsLayoutProps {
  children: React.ReactNode;
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  const pathname = usePathname();

  // Extract the slug from the path
  const segments = pathname.split('/').filter(Boolean);
  
  // Find index of 'tools' segment
  const toolsIndex = segments.indexOf('tools');
  const slug = toolsIndex !== -1 && segments[toolsIndex + 1] ? segments[toolsIndex + 1] : null;

  // Render schema and footer only for individual tool routes
  // (Skip root /tools directory and category-like /tools/pdf-tools suite page)
  const isToolPage = slug && slug !== 'pdf-tools';
  const hasCustomLayoutSchema = slug === 'exam-marks-calculator' || slug === 'base64-encoder-decoder';
  const shouldRenderAutoSchema = isToolPage && !hasCustomLayoutSchema;

  return (
    <>
      {shouldRenderAutoSchema && <AutoToolSchema slug={slug} />}
      {children}
      {isToolPage && (
        <div className="w-full bg-[#F6F8FC] dark:bg-[#030712] border-t border-[#E6ECF5] dark:border-white/5 pb-20 relative z-20 transition-colors duration-250 font-sans">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <ToolSeoFooter currentSlug={slug} />
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { MeshGradient } from '@/components/BackgroundEffects';
import React from 'react';
import { useTranslation } from '@/components/I18nContext';
import { usePathname } from 'next/navigation';
import WorkflowRecommendations from '@/components/tools/WorkflowRecommendations';

interface ToolLayoutProps {
  children: React.ReactNode;
}

export default function ToolLayout({ children }: ToolLayoutProps) {
  const { t, localizeHref } = useTranslation();
  const pathname = usePathname();

  // Extract the active tool slug from pathname (works for localized routes and subpaths)
  const parts = pathname.split('/').filter(Boolean);
  const slug = parts[parts.length - 1] || '';
  const isToolPage = slug && slug !== 'tools' && slug !== 'categories';

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250">
      <MeshGradient />
      
      {/* Decorative Glow Grid */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-blue-900/20 via-transparent to-transparent pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Navigation Link */}
        <Link 
          href={localizeHref('/tools')} 
          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('tools.back_to_directory', 'Back to Directory')}
        </Link>

        {children}

        {/* Dynamic Workflow Recommendations */}
        {isToolPage && (
          <WorkflowRecommendations slug={slug} />
        )}
      </div>
    </div>
  );
}

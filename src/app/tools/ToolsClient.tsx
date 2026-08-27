"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SectionTitle from '@/components/SectionTitle';
import ToolsDirectory from '@/components/ToolsDirectory';
import { MeshGradient } from '@/components/BackgroundEffects';
import { useTranslation } from '@/components/I18nContext';

function ToolsSearch() {
  const searchParams = useSearchParams();
  const search = searchParams?.get('search') || '';
  return <ToolsDirectory initialSearchQuery={search} />;
}

export default function ToolsClient() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#030712] min-h-screen pt-8 sm:pt-10 pb-20 sm:pb-28 relative overflow-hidden font-sans transition-colors duration-250">
      {/* Background Glow */}
      <MeshGradient />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3 uppercase leading-tight">
            {t('home.directory_title', 'Tools Directory')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            {t('home.directory_subtitle', 'Instant-run local utilities. Search by keywords or filter by tags.')}
          </p>
        </div>
        
        <div>
          <Suspense fallback={
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-2 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <ToolsSearch />
          </Suspense>
        </div>
      </div>
    </div>
  );
}


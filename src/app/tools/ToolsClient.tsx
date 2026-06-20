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
    <div className="bg-[#030712] min-h-screen py-24 sm:py-32 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <MeshGradient />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle 
          title={t('home.directory_title', 'Tools Directory')} 
          subtitle={t('home.directory_subtitle', 'Explore our full collection of professional AI utilities. No signup required, zero cost during beta, and 100% privacy focused.')}
          centered
          as="h1"
        />
        
        <div className="mt-20">
          <Suspense fallback={
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <ToolsSearch />
          </Suspense>
        </div>
      </div>
    </div>
  );
}


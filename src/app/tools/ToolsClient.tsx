"use client";

import SectionTitle from '@/components/SectionTitle';
import ToolsDirectory from '@/components/ToolsDirectory';
import { MeshGradient } from '@/components/BackgroundEffects';
import { useTranslation } from '@/components/I18nContext';

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
          <ToolsDirectory />
        </div>
      </div>
    </div>
  );
}

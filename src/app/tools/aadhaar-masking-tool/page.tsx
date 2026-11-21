"use client";

import { ShieldCheck } from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import AadhaarMaskingEngine from '@/components/AadhaarMaskingEngine';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';

export default function AadhaarMaskingTool() {
  return (
    <ToolVisibilityGuard slug="aadhaar-masking-tool">
      <ToolLayout>
        {/* Main Workspace Card */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <ToolHero
            title="Aadhaar Masking Tool"
            description="Automatically or manually mask the first 8 digits of your Aadhaar card for secure privacy protection."
            icon={<ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />}
          />

          <div className="p-4 sm:p-8 lg:p-10">
            <AadhaarMaskingEngine
              toolSlug="aadhaar-masking-tool"
              title="Aadhaar Masking Tool"
              description="Automatically detect and mask the first 8 digits of your Aadhaar card for secure privacy protection."
            />
          </div>
        </div>

        {/* SEO Article */}
        {toolArticles['aadhaar-masking-tool'] && (
          <ToolArticle {...toolArticles['aadhaar-masking-tool']} />
        )}
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

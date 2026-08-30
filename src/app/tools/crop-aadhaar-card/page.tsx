"use client";

import Link from 'next/link';
import { Crop } from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import ImageCropperEngine, { CropperPreset } from '@/components/ImageCropperEngine';
import WorkflowRecommendations from '@/components/tools/WorkflowRecommendations';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';

const AADHAAR_PRESETS: CropperPreset[] = [
  {
    id: "uidai-aadhaar",
    label: "Official UIDAI Spec (3.5x4.5 cm)",
    width: 413,
    height: 531,
    targetKb: 50,
    allowBgRemoval: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#eff6ff" },
      { name: "Off White", hex: "#fafafa" },
    ],
    description: "Standard UIDAI specifications for Indian Aadhaar Card updates.",
    specs: "3.5 x 4.5 cm, Target size: 20KB - 50KB",
  }
];

export default function CropAadhaarCardPage() {
  const article = toolArticles['crop-aadhaar-card'] || toolArticles['aadhaar-photo-resizer'];

  return (
    <ToolVisibilityGuard slug="crop-aadhaar-card">
      <ToolLayout>
        {/* Main Workspace Card */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <ToolHero
            title="Crop Aadhaar Card & Photo"
            description="Crop and resize Aadhaar photos to official UIDAI specifications (3.5x4.5 cm, <50KB) securely in browser."
            icon={<Crop className="w-6 h-6 sm:w-7 sm:h-7" />}
          />

          <div className="p-4 sm:p-8 lg:p-10">
            <ImageCropperEngine
              toolSlug="crop-aadhaar-card"
              title="Crop Aadhaar Card"
              description="Crop Aadhaar Card online quickly and securely. Remove unwanted background, white space, and margins from your Aadhaar Card image instantly."
              presets={AADHAAR_PRESETS}
            />
          </div>
        </div>

        {/* Contextual Hub Banner */}
        <div className="my-12 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wide">UIDAI e-Aadhaar & Privacy Toolkit</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 font-medium">Need to mask your 12-digit Aadhaar number, unlock password-protected e-Aadhaar PDFs, or compress files under 300KB?</p>
          </div>
          <Link href="/hubs/aadhaar-utilities/" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shrink-0">
            Visit Aadhaar Hub →
          </Link>
        </div>

        {/* SEO Article */}
        {article && (
          <ToolArticle {...article} />
        )}

        {/* Workflow Recommendations */}
        <WorkflowRecommendations slug="crop-aadhaar-card" />
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

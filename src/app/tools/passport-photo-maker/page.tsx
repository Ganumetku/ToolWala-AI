"use client";

import Link from 'next/link';
import { Camera } from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import ImageCropperEngine, { CropperPreset } from '@/components/ImageCropperEngine';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';

const PASSPORT_PRESETS: CropperPreset[] = [
  {
    id: "india-passport",
    label: "India Passport (3.5x4.5 cm)",
    width: 413,
    height: 531,
    targetKb: 100,
    allowBgRemoval: true,
    allowPrintSheet: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#eff6ff" },
      { name: "Light Gray", hex: "#f3f4f6" },
    ],
    description: "Standard dimensions for Indian passport photographs.",
    specs: "35 x 45 mm, Target size: < 100KB",
  },
  {
    id: "us-passport",
    label: "US Passport / Visa (2x2 inch)",
    width: 600,
    height: 600, // 1:1 aspect ratio
    targetKb: 240,
    allowBgRemoval: true,
    allowPrintSheet: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Off White", hex: "#fafafa" },
    ],
    description: "Standard US government passport photo dimensions.",
    specs: "2 x 2 inches (600 x 600 px), Target size: < 240KB",
  },
  {
    id: "visa-photo",
    label: "Schengen Visa Photo (35x45 mm)",
    width: 413,
    height: 531,
    targetKb: 100,
    allowBgRemoval: true,
    allowPrintSheet: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Gray", hex: "#f3f4f6" },
    ],
    description: "Standard Schengen Europe Visa photograph specifications.",
    specs: "3.5 x 4.5 cm, Target size: < 100KB",
  },
  {
    id: "custom-square",
    label: "Custom Photo (1:1 Ratio)",
    width: 600,
    height: 600,
    targetKb: 100,
    allowBgRemoval: true,
    allowPrintSheet: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Transparent", hex: "transparent" },
    ],
    description: "General square layout for badges, avatars, or portals.",
    specs: "600 x 600 px, Target size: < 100KB",
  }
];

export default function PassportPhotoMaker() {
  return (
    <ToolVisibilityGuard slug="passport-photo-maker">
      <ToolLayout>
        {/* Main Workspace Card */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <ToolHero
            title="Passport Photo Maker"
            description="Create professional passport size photos with AI background removal and multi-country specs."
            icon={<Camera className="w-6 h-6 sm:w-7 sm:h-7" />}
          />

          <div className="p-4 sm:p-8 lg:p-10">
            <ImageCropperEngine
              toolSlug="passport-photo-maker"
              title="Passport Photo Maker"
              description="Create perfectly sized passport photos for any country with AI background removal."
              presets={PASSPORT_PRESETS}
            />
          </div>
        </div>

        {/* Contextual Hub Banner */}
        <div className="my-12 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wide">Passport Seva & PSK Document Guidance</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 font-medium">Need help formatting passport application certificates, birth proofs, and size limits for PSK uploads?</p>
          </div>
          <Link href="/hubs/passport-seva-utilities/" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shrink-0">
            Visit Passport Seva Hub →
          </Link>
        </div>

        {/* SEO Article */}
        {toolArticles['passport-photo-maker'] && (
          <ToolArticle preferArticleCopy {...toolArticles['passport-photo-maker']} />
        )}
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

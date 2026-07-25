"use client";

import Link from 'next/link';
import { ChevronLeft, Sparkles } from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import ImageCropperEngine, { CropperPreset } from '@/components/ImageCropperEngine';
import WorkflowRecommendations from '@/components/tools/WorkflowRecommendations';

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

export default function AadhaarPhotoResizer() {
  return (
    <ToolVisibilityGuard slug="aadhaar-photo-resizer">
      <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712] text-slate-900 dark:text-gray-100 relative overflow-hidden font-sans">
        <MeshGradient />

        {/* Decorative Glow Grid */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10">
          
          {/* Navigation Breadcrumb */}
          <Link 
            href="/tools" 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white cursor-pointer transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Directory
          </Link>

          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Sparkles className="w-3.5 h-3.5" />
              100% Client-Side Image Processing
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 uppercase">
              Aadhaar Photo Resizer <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Official UIDAI standard
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium">
              Format your photo for Aadhaar updates and Indian portals. Automatically remove background borders, center faces properly, and compress to exact KB limits.
            </p>
          </div>

          {/* Workspace Console */}
          <div className="max-w-6xl mx-auto">
            <ImageCropperEngine
              toolSlug="aadhaar-photo-resizer"
              title="Aadhaar Photo Resizer"
              description="Resize, crop, and compress passport photos for Aadhaar, UIDAI, and official government updates."
              presets={AADHAAR_PRESETS}
            />
          </div>

          {/* SEO Article */}
          {toolArticles['aadhaar-photo-resizer'] && (
            <div className="mt-24 border-t border-white/5 pt-20 max-w-6xl mx-auto">
              <ToolArticle {...toolArticles['aadhaar-photo-resizer']} />
            </div>
          )}

          {/* Workflow Recommendations */}
          <div className="max-w-6xl mx-auto">
            <WorkflowRecommendations slug="aadhaar-photo-resizer" />
          </div>

        </div>
      </div>
    </ToolVisibilityGuard>
  );
}

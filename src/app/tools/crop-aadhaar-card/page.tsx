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

export default function CropAadhaarCardPage() {
  const article = toolArticles['crop-aadhaar-card'] || toolArticles['aadhaar-photo-resizer'];

  return (
    <ToolVisibilityGuard slug="crop-aadhaar-card">
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
              Crop & Resize Aadhaar Photo <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Official UIDAI Size & Spec
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium">
              Crop and resize Aadhaar card photos online free to official UIDAI specifications (3.5x4.5 cm, &lt;50KB). Remove extra margins, set a compliant white background, and compress file size instantly with 100% browser privacy.
            </p>
          </div>

          {/* Workspace Console */}
          <div className="max-w-6xl mx-auto">
            <ImageCropperEngine
              toolSlug="crop-aadhaar-card"
              title="Crop Aadhaar Card"
              description="Crop Aadhaar Card online quickly and securely. Remove unwanted background, white space, and margins from your Aadhaar Card image instantly."
              presets={AADHAAR_PRESETS}
            />
          </div>

          {/* Contextual Hub Banner */}
          <div className="my-12 max-w-6xl mx-auto bg-blue-50/60 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
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
            <div className="mt-12 border-t border-white/5 pt-12 max-w-6xl mx-auto">
              <ToolArticle {...article} />
            </div>
          )}

          {/* Workflow Recommendations */}
          <div className="max-w-6xl mx-auto">
            <WorkflowRecommendations slug="crop-aadhaar-card" />
          </div>

        </div>
      </div>
    </ToolVisibilityGuard>
  );
}

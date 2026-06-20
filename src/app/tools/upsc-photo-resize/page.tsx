"use client";

import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import ToolArticle from "@/components/ToolArticle";
import { toolArticles } from "@/data/toolArticles";
import { MeshGradient } from "@/components/BackgroundEffects";
import ToolVisibilityGuard from "@/components/ToolVisibilityGuard";
import ImageCropperEngine, { CropperPreset } from "@/components/ImageCropperEngine";

const UPSC_PRESETS: CropperPreset[] = [
  {
    id: "upsc-photo",
    label: "UPSC Registration Photo",
    width: 350,
    height: 350, // 1:1 aspect ratio
    targetKb: 40,
    allowBgRemoval: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#eff6ff" },
    ],
    description: "Official Union Public Service Commission specifications.",
    specs: "350 x 350 px, Target size: 20KB - 40KB",
  }
];

export default function UPSCPhotoResize() {
  return (
    <ToolVisibilityGuard slug="upsc-photo-resize">
      <div className="min-h-screen bg-[#030712] text-gray-100 relative overflow-hidden font-sans">
        <MeshGradient />

        {/* Decorative Radial Glow */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10">
          {/* Breadcrumb */}
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white cursor-pointer transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Directory
          </Link>

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Sparkles className="w-3.5 h-3.5" />
              100% Client-Side Processing
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 uppercase">
              UPSC Photo Resize <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Official UPSC specs
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium">
              Resize and format passport photos for Union Public Service Commission (UPSC) OTR registrations. Centering alignment controls check head proportions to prevent cuts.
            </p>
          </div>

          {/* Main Cropper Console */}
          <div className="max-w-6xl mx-auto">
            <ImageCropperEngine
              toolSlug="upsc-photo-resize"
              title="UPSC Photo Resize"
              description="Format and resize passport photos to official Union Public Service Commission (UPSC) guidelines."
              presets={UPSC_PRESETS}
              seoArticle={
                toolArticles["upsc-photo-resize"] && (
                  <div className="mt-24 border-t border-white/5 pt-20">
                    <ToolArticle {...toolArticles["upsc-photo-resize"]} />
                  </div>
                )
              }
            />
          </div>
        </div>
      </div>
    </ToolVisibilityGuard>
  );
}

"use client";

import { IdCard } from "lucide-react";
import ToolArticle from "@/components/ToolArticle";
import { toolArticles } from "@/data/toolArticles";
import ToolVisibilityGuard from "@/components/ToolVisibilityGuard";
import ImageCropperEngine, { CropperPreset } from "@/components/ImageCropperEngine";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolHero from "@/components/tools/ToolHero";

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
      <ToolLayout>
        {/* Main Workspace Card */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <ToolHero
            title="UPSC Photo Resize"
            description="Format and resize passport photos to official Union Public Service Commission (UPSC) specifications."
            icon={<IdCard className="w-6 h-6 sm:w-7 sm:h-7" />}
          />

          <div className="p-4 sm:p-8 lg:p-10">
            <ImageCropperEngine
              toolSlug="upsc-photo-resize"
              title="UPSC Photo Resize"
              description="Format and resize passport photos to official Union Public Service Commission (UPSC) guidelines."
              presets={UPSC_PRESETS}
            />
          </div>
        </div>

        {/* SEO Article */}
        {toolArticles["upsc-photo-resize"] && (
          <ToolArticle {...toolArticles["upsc-photo-resize"]} />
        )}
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

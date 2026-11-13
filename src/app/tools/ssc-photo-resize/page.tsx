"use client";

import { IdCard } from "lucide-react";
import ToolArticle from "@/components/ToolArticle";
import { toolArticles } from "@/data/toolArticles";
import ToolVisibilityGuard from "@/components/ToolVisibilityGuard";
import ImageCropperEngine, { CropperPreset } from "@/components/ImageCropperEngine";
import WorkflowRecommendations from "@/components/tools/WorkflowRecommendations";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolHero from "@/components/tools/ToolHero";

const SSC_PRESETS: CropperPreset[] = [
  {
    id: "ssc-photo",
    label: "SSC Exam Photo (3.5x4.5 cm)",
    width: 354,
    height: 472, // ~7:9 aspect ratio
    targetKb: 50,
    allowBgRemoval: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#eff6ff" },
    ],
    description: "Official Staff Selection Commission (SSC) guidelines.",
    specs: "3.5 x 4.5 cm, Target size: 20KB - 50KB",
  }
];

export default function SSCPhotoResize() {
  return (
    <ToolVisibilityGuard slug="ssc-photo-resize">
      <ToolLayout>
        {/* Main Workspace Card */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <ToolHero
            title="SSC Photo Resize"
            description="Resize and format passport photos to official Staff Selection Commission (SSC) guidelines."
            icon={<IdCard className="w-6 h-6 sm:w-7 sm:h-7" />}
          />

          <div className="p-4 sm:p-8 lg:p-10">
            <ImageCropperEngine
              toolSlug="ssc-photo-resize"
              title="SSC Photo Resize"
              description="Format and resize passport photos to official Staff Selection Commission (SSC) guidelines."
              presets={SSC_PRESETS}
            />
          </div>
        </div>

        {/* SEO Article */}
        {toolArticles["ssc-photo-resize"] && (
          <ToolArticle preferArticleCopy {...toolArticles["ssc-photo-resize"]} />
        )}

        {/* Workflow Recommendations */}
        <WorkflowRecommendations slug="ssc-photo-resize" />
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

"use client";

import { IdCard } from "lucide-react";
import ToolArticle from "@/components/ToolArticle";
import { toolArticles } from "@/data/toolArticles";
import ToolVisibilityGuard from "@/components/ToolVisibilityGuard";
import ImageCropperEngine, { CropperPreset } from "@/components/ImageCropperEngine";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolHero from "@/components/tools/ToolHero";

const SSC_PRESETS: CropperPreset[] = [
  {
    id: "ssc-photo",
    label: "SSC Exam Photo (3.5×4.5 cm / 20–50 KB)",
    width: 354,
    height: 472, // ~7:9 aspect ratio
    targetKb: 50,
    allowBgRemoval: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#eff6ff" },
    ],
    description: "Standard 3.5×4.5 cm photo for examinations permitting uploaded portrait photos.",
    specs: "3.5 × 4.5 cm (approx 354×472 px). Target size: 20KB – 50KB.",
  },
  {
    id: "ssc-signature-standard",
    label: "SSC Signature (Standard 4.0×2.0 cm / 10–20 KB)",
    width: 280,
    height: 140, // 2:1 aspect ratio
    targetKb: 20,
    allowBgRemoval: false,
    bgColors: [
      { name: "White", hex: "#ffffff" },
    ],
    description: "Common specification for SSC notices specifying 4.0 cm × 2.0 cm.",
    specs: "4.0 × 2.0 cm. File size: strictly 10.0 KB – 20.0 KB. JPEG format.",
  },
  {
    id: "ssc-signature-wide",
    label: "SSC Signature (Wide 6.0×2.0 cm / 10–20 KB)",
    width: 360,
    height: 120, // 3:1 aspect ratio
    targetKb: 20,
    allowBgRemoval: false,
    bgColors: [
      { name: "White", hex: "#ffffff" },
    ],
    description: "Specified in notifications such as SSC Stenographer Grade C & D / LDC.",
    specs: "6.0 × 2.0 cm (approx 300 DPI). File size: strictly 10.0 KB – 20.0 KB. JPEG format.",
  },
  {
    id: "ssc-signature-custom",
    label: "Custom Exam Signature (Adjustable / 10–20 KB)",
    width: 300,
    height: 100,
    targetKb: 20,
    allowBgRemoval: false,
    bgColors: [
      { name: "White", hex: "#ffffff" },
    ],
    description: "Customizable signature crop for state recruitment boards and notifications with unique dimension rules.",
    specs: "Adjustable dimensions. Target size: 10KB – 20KB. JPEG format.",
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
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

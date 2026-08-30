"use client";

import { PenTool } from "lucide-react";
import ToolArticle from "@/components/ToolArticle";
import { toolArticles } from "@/data/toolArticles";
import ToolVisibilityGuard from "@/components/ToolVisibilityGuard";
import ImageCropperEngine, { CropperPreset } from "@/components/ImageCropperEngine";
import WorkflowRecommendations from "@/components/tools/WorkflowRecommendations";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolHero from "@/components/tools/ToolHero";

const SIGNATURE_PRESETS: CropperPreset[] = [
  {
    id: "bank-signature",
    label: "Bank / General Signature",
    width: 256,
    height: 64, // 4:1 aspect ratio
    targetKb: 20,
    allowBgRemoval: false,
    bgColors: [
      { name: "Transparent", hex: "transparent" },
      { name: "White", hex: "#ffffff" },
    ],
    description: "Standard 4:1 signature crop for online banking portals.",
    specs: "Ratio: 4:1, Target size: < 20KB",
  },
  {
    id: "ssc-signature",
    label: "SSC Exam Signature (6x3 cm)",
    width: 280,
    height: 140, // 2:1 aspect ratio
    targetKb: 20,
    allowBgRemoval: false,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Transparent", hex: "transparent" },
    ],
    description: "Official Staff Selection Commission (SSC) signature size specifications.",
    specs: "6.0 x 3.0 cm, Target size: 10KB - 20KB",
  },
  {
    id: "ibps-signature",
    label: "IBPS / Banking Exam Signature",
    width: 140,
    height: 60, // ~7:3 aspect ratio
    targetKb: 20,
    allowBgRemoval: false,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Transparent", hex: "transparent" },
    ],
    description: "Institute of Banking Personnel Selection signature size specifications.",
    specs: "140 x 60 px, Target size: 10KB - 20KB",
  }
];

export default function SignatureResize() {
  return (
    <ToolVisibilityGuard slug="signature-resize">
      <ToolLayout>
        {/* Main Workspace Card */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <ToolHero
            title="Signature Resize"
            description="Crop and resize signature scans to official standards for recruitment, banks, and online exam portals."
            icon={<PenTool className="w-6 h-6 sm:w-7 sm:h-7" />}
          />

          <div className="p-4 sm:p-8 lg:p-10">
            <ImageCropperEngine
              toolSlug="signature-resize"
              title="Signature Resize"
              description="Crop and resize signature scans to official standards for recruitment, banks, and exams."
              presets={SIGNATURE_PRESETS}
            />
          </div>
        </div>

        {/* SEO Article */}
        {toolArticles["signature-resize"] && (
          <ToolArticle {...toolArticles["signature-resize"]} />
        )}

        {/* Workflow Recommendations */}
        <WorkflowRecommendations slug="signature-resize" />
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

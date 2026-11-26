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
    id: "ssc-cgl-gd-2026-signature",
    label: "SSC CGL 2026 & GD 2026 Official Signature (6.0×2.0 cm / 10–20 KB)",
    width: 709,
    height: 236, // 3:1 aspect ratio (6.0 cm × 2.0 cm at 300 DPI)
    targetKb: 20,
    minKb: 10,
    targetDpi: 300,
    allowBgRemoval: false,
    bgColors: [
      { name: "White", hex: "#ffffff" },
    ],
    description: "Verified in official SSC CGL 2026 and GD 2026 notifications: ~6.0 × 2.0 cm, JPEG format, 10.0 KB to 20.0 KB.",
    specs: "6.0 × 2.0 cm (approx 3:1 aspect ratio). File size: strictly 10.0 KB – 20.0 KB. Format: JPEG.",
  },
  {
    id: "ssc-steno-2026-signature",
    label: "SSC Stenographer 2026 Official Signature (6.0×2.0 cm / 300 DPI / 10–20 KB)",
    width: 709,
    height: 236, // 3:1 aspect ratio (~300 DPI)
    targetKb: 20,
    minKb: 10,
    targetDpi: 300,
    allowBgRemoval: false,
    bgColors: [
      { name: "White", hex: "#ffffff" },
    ],
    description: "Verified in SSC Stenographer 2026 notice: ~6.0 × 2.0 cm at ~300 DPI resolution, JPEG format, 10.0 KB to 20.0 KB.",
    specs: "6.0 × 2.0 cm (approx 3:1 aspect ratio, ~300 DPI). File size: strictly 10.0 KB – 20.0 KB. Format: JPEG.",
  },
  {
    id: "ssc-chsl-mts-signature",
    label: "SSC CHSL & MTS Signature Preset (6.0×2.0 cm / 10–20 KB — Confirm Notice)",
    width: 709,
    height: 236, // 3:1 aspect ratio
    targetKb: 20,
    minKb: 10,
    targetDpi: 300,
    allowBgRemoval: false,
    bgColors: [
      { name: "White", hex: "#ffffff" },
    ],
    description: "Commonly specified as ~6.0 × 2.0 cm, 10–20 KB in recent CHSL and MTS cycles. Verify specific notification before submission.",
    specs: "6.0 × 2.0 cm (3:1 aspect ratio). File size: strictly 10.0 KB – 20.0 KB. Format: JPEG.",
  },
  {
    id: "ssc-signature-4x2",
    label: "Legacy Annexure Signature (4.0×2.0 cm / 10–20 KB — Non-Universal)",
    width: 472,
    height: 236, // 2:1 aspect ratio (4.0 cm × 2.0 cm at 300 DPI)
    targetKb: 20,
    minKb: 10,
    targetDpi: 300,
    allowBgRemoval: false,
    bgColors: [
      { name: "White", hex: "#ffffff" },
    ],
    description: "Referenced in select legacy application sub-forms or older regional annexures. Not universally applicable.",
    specs: "4.0 × 2.0 cm (2:1 aspect ratio). File size: strictly 10.0 KB – 20.0 KB. Format: JPEG.",
  },
  {
    id: "ssc-photo",
    label: "SSC Exam Photo (3.5×4.5 cm / 20–50 KB — Offline / Special Submissions Only)",
    width: 354,
    height: 472, // ~7:9 aspect ratio
    targetKb: 50,
    minKb: 20,
    targetDpi: 300,
    allowBgRemoval: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#eff6ff" },
    ],
    description: "For offline forms or state boards. Note: Major exams on ssc.gov.in (CGL/GD/CHSL) require live webcam capture.",
    specs: "3.5 × 4.5 cm (approx 354×472 px). Target size: 20KB – 50KB. Format: JPEG.",
  },
  {
    id: "ssc-signature-custom",
    label: "Custom Exam Signature (Adjustable Dimensions / 10–20 KB)",
    width: 300,
    height: 100,
    targetKb: 20,
    minKb: 10,
    targetDpi: 300,
    allowBgRemoval: false,
    bgColors: [
      { name: "White", hex: "#ffffff" },
    ],
    description: "Customizable signature crop for state recruitment boards and notifications with unique dimension rules.",
    specs: "Adjustable dimensions. Target size: 10KB – 20KB. Format: JPEG.",
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

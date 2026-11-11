import { Camera } from "lucide-react";
import ToolArticle from "@/components/ToolArticle";
import { toolArticles } from "@/data/toolArticles";
import ToolVisibilityGuard from "@/components/ToolVisibilityGuard";
import { CropperPreset } from "@/components/ImageCropperEngine";
import ImageCropperClientWrapper from "@/components/ImageCropperClientWrapper";
import WorkflowRecommendations from "@/components/tools/WorkflowRecommendations";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolHero from "@/components/tools/ToolHero";

const EXAM_PRESETS: CropperPreset[] = [
  {
    id: "ssc-photo",
    label: "SSC Exam Photo (3.5x4.5 cm)",
    width: 354,
    height: 472,
    targetKb: 50,
    allowBgRemoval: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#eff6ff" },
    ],
    description: "Official Staff Selection Commission (SSC) guidelines.",
    specs: "3.5 x 4.5 cm, Target size: 20KB - 50KB",
  },
  {
    id: "upsc-photo",
    label: "UPSC Exam Photo (350x450 px)",
    width: 350,
    height: 450,
    targetKb: 300,
    allowBgRemoval: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Off White", hex: "#fafafa" },
    ],
    description: "Union Public Service Commission (UPSC) guidelines.",
    specs: "350 x 450 px, Target size: 20KB - 300KB",
  },
  {
    id: "ibps-bank",
    label: "IBPS / Bank Exam Photo",
    width: 324,
    height: 424,
    targetKb: 50,
    allowBgRemoval: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#eff6ff" },
    ],
    description: "Institute of Banking Personnel Selection (IBPS) specs.",
    specs: "4.5 x 3.5 cm (324 x 424 px), Target size: 20KB - 50KB",
  }
];

export default function ExamPhotoResizerPage() {
  return (
    <ToolVisibilityGuard slug="exam-photo-resizer">
      <ToolLayout>
        {/* Main Workspace Card */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <ToolHero
            title="Exam Photo Resizer"
            description="Resize, crop, and compress passport photos to official guidelines for SSC, UPSC, and IBPS banking exams."
            icon={<Camera className="w-6 h-6 sm:w-7 sm:h-7" />}
          />

          <div className="p-4 sm:p-8 lg:p-10">
            <ImageCropperClientWrapper
              toolSlug="exam-photo-resizer"
              title="Exam Photo Resizer"
              description="Resize and format passport photos for SSC, UPSC, and banking online application portals."
              presets={EXAM_PRESETS}
            />
          </div>
        </div>

        {/* SEO Article */}
        {toolArticles["exam-photo-resizer"] && (
          <ToolArticle {...toolArticles["exam-photo-resizer"]} />
        )}

        {/* Workflow Recommendations */}
        <WorkflowRecommendations slug="exam-photo-resizer" />
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

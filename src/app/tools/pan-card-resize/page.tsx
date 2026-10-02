import { IdCard } from "lucide-react";
import ToolArticle from "@/components/ToolArticle";
import { toolArticles } from "@/data/toolArticles";
import ToolVisibilityGuard from "@/components/ToolVisibilityGuard";
import { CropperPreset } from "@/components/ImageCropperEngine";
import ImageCropperClientWrapper from "@/components/ImageCropperClientWrapper";
import WorkflowRecommendations from "@/components/tools/WorkflowRecommendations";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolHero from "@/components/tools/ToolHero";
import {
  buildFAQSchema,
  buildWebPageSchema,
  buildEnrichedToolJsonLd,
  buildBreadcrumbJsonLd
} from "@/lib/seo";

const PAN_PRESETS: CropperPreset[] = [
  {
    id: "nsdl-pan",
    label: "NSDL PAN Card Photo (3.5x2.5 cm)",
    width: 213,
    height: 213,
    targetKb: 50,
    allowBgRemoval: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#eff6ff" },
      { name: "Off White", hex: "#fafafa" },
    ],
    description: "Official NSDL portal photo specifications.",
    specs: "3.5 x 2.5 cm (213 x 213 px), Target size: < 50KB",
  },
  {
    id: "utiitsl-pan",
    label: "UTIITSL PAN Card Photo",
    width: 213,
    height: 213,
    targetKb: 30,
    allowBgRemoval: true,
    bgColors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#eff6ff" },
    ],
    description: "Official UTIITSL portal photo specifications.",
    specs: "213 x 213 px, Target size: 10KB - 30KB",
  }
];

export default function PANCardResizePage() {
  const article = toolArticles["pan-card-resize"];
  const faqs = article?.faqs || [];
  const faqSchema = buildFAQSchema(faqs);
  const toolUrl = "https://toolwala.co/tools/pan-card-resize/";

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Tools", href: "/tools" },
    { name: "PAN Card Resize", href: "/tools/pan-card-resize" }
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      buildEnrichedToolJsonLd(
        {
          title: "PAN Card Resize Online",
          description: "Format, crop, and resize passport photos to official NSDL and UTIITSL PAN card specifications. Complies with the mandatory 213 x 213 pixels dimension and whiteness checks."
        },
        toolUrl,
        "Image Tools"
      ),
      buildWebPageSchema(
        "PAN Card Resize Online",
        "Format, crop, and resize passport photos to official NSDL and UTIITSL PAN card specifications. Complies with the mandatory 213 x 213 pixels dimension and whiteness checks.",
        toolUrl,
        "en"
      ),
      buildBreadcrumbJsonLd(breadcrumbItems),
      ...(faqSchema ? [faqSchema] : [])
    ]
  };

  return (
    <ToolVisibilityGuard slug="pan-card-resize">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolLayout>
        {/* Main Workspace Card */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <ToolHero
            title="PAN Card Photo Resize"
            description="Resize and format passport photos to official NSDL & UTIITSL PAN card specifications."
            icon={<IdCard className="w-6 h-6 sm:w-7 sm:h-7" />}
          />

          <div className="p-4 sm:p-8 lg:p-10">
            <ImageCropperClientWrapper
              toolSlug="pan-card-resize"
              title="PAN Card Resize"
              description="Format and resize passport photos to official NSDL/UTIITSL PAN card specifications."
              presets={PAN_PRESETS}
            />
          </div>
        </div>

        {/* SEO Article */}
        {toolArticles["pan-card-resize"] && (
          <ToolArticle {...toolArticles["pan-card-resize"]} />
        )}

        {/* Workflow Recommendations */}
        <WorkflowRecommendations slug="pan-card-resize" />
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

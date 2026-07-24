import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import ToolArticle from "@/components/ToolArticle";
import { toolArticles } from "@/data/toolArticles";
import { MeshGradient } from "@/components/BackgroundEffects";
import ToolVisibilityGuard from "@/components/ToolVisibilityGuard";
import { CropperPreset } from "@/components/ImageCropperEngine";
import ImageCropperClientWrapper from "@/components/ImageCropperClientWrapper";
import WorkflowRecommendations from "@/components/tools/WorkflowRecommendations";
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
      <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712] text-slate-900 dark:text-gray-100 relative overflow-hidden font-sans">
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
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 uppercase">
              PAN Card Resize <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                NSDL & UTIITSL Specs
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium">
              Resize and format passport photos to official Indian PAN card specifications. Automatically isolate subjects, replace backgrounds with compliant colors, and compress under 50KB safely.
            </p>
          </div>

          {/* Main Cropper Console */}
          <div className="max-w-6xl mx-auto">
            <ImageCropperClientWrapper
              toolSlug="pan-card-resize"
              title="PAN Card Resize"
              description="Format and resize passport photos to official NSDL/UTIITSL PAN card specifications."
              presets={PAN_PRESETS}
            />
          </div>

          {/* SEO Article */}
          {toolArticles["pan-card-resize"] && (
            <div className="mt-24 border-t border-white/5 pt-20 max-w-6xl mx-auto">
              <ToolArticle {...toolArticles["pan-card-resize"]} />
            </div>
          )}

          {/* Workflow Recommendations */}
          <WorkflowRecommendations slug="pan-card-resize" />
        </div>
      </div>
    </ToolVisibilityGuard>
  );
}

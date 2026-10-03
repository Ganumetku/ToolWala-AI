"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import {
  GitMerge,
  GitCompare,
  Scissors,
  Minimize2,
  RotateCw,
  FileText,
  Table,
  Presentation,
  Image as ImageIcon,
  FileOutput,
  FileSpreadsheet,
  MonitorPlay,
  ImagePlus,
  PenLine,
  PenTool,
  Stamp,
  LockKeyholeOpen,
  ShieldCheck,
  LayoutGrid,
  ScanText,
  Trash2,
  Crop,
  Hash,
  Sparkles,
  ArrowRightLeft,
  Camera,
  ImageDown,
  Palette,
  QrCode,
  KeyRound,
  FileJson2,
  Binary,
  Type,
  Receipt,
  Cake,
  TrendingUp,
  Landmark,
  Percent,
  Tag,
  Play,
  IndianRupee,
  IdCard,
  HeartPulse,
  Mic,
  Video,
  Eye,
  UserCheck,
  MessageSquare,
  Folder,
  Wrench,
  Briefcase,
  Code2,
  Share2,
  Calculator,
  type LucideIcon,
} from "lucide-react";

export interface PremiumTileConfig {
  id: string;
  icon: LucideIcon;
  solidColor: string; // Flat solid background color
  conversionBadge?: {
    from?: string;
    to: string;
  };
}

// 100% Comprehensive Bright, Vibrant Palette for ALL Sitewide Tools
export const ALL_TOOL_TILES: Record<string, PremiumTileConfig> = {
  // ==========================================
  // 1. PDF Tools: Organize & Manage (Blue/Cyan)
  // ==========================================
  "pdf-compare": {
    id: "pdf-compare",
    icon: GitCompare,
    solidColor: "#6366F1",
  },
  "merge-pdf": {
    id: "merge-pdf",
    icon: GitMerge,
    solidColor: "#6366F1",
  },
  "split-pdf": {
    id: "split-pdf",
    icon: Scissors,
    solidColor: "#06B6D4",
  },
  "compress-pdf": {
    id: "compress-pdf",
    icon: Minimize2,
    solidColor: "#3B82F6",
  },
  "rotate-pdf": {
    id: "rotate-pdf",
    icon: RotateCw,
    solidColor: "#0EA5E9",
  },
  "organize-pdf": {
    id: "organize-pdf",
    icon: LayoutGrid,
    solidColor: "#3B82F6",
  },
  "crop-pdf": {
    id: "crop-pdf",
    icon: Crop,
    solidColor: "#06B6D4",
  },
  "remove-pages": {
    id: "remove-pages",
    icon: Trash2,
    solidColor: "#F43F5E",
  },
  "add-page-numbers-to-pdf": {
    id: "add-page-numbers-to-pdf",
    icon: Hash,
    solidColor: "#3B82F6",
  },
  "pdf-tools": {
    id: "pdf-tools",
    icon: ArrowRightLeft,
    solidColor: "#3B82F6",
  },

  // ==========================================
  // 2. PDF Tools: Convert TO PDF (Green/Teal)
  // ==========================================
  "word-to-pdf-converter": {
    id: "word-to-pdf-converter",
    icon: FileOutput,
    solidColor: "#10B981",
    conversionBadge: { to: "PDF" },
  },
  "word-to-pdf": {
    id: "word-to-pdf",
    icon: FileOutput,
    solidColor: "#10B981",
    conversionBadge: { to: "PDF" },
  },
  "excel-to-pdf-converter": {
    id: "excel-to-pdf-converter",
    icon: FileSpreadsheet,
    solidColor: "#22C55E",
    conversionBadge: { to: "PDF" },
  },
  "excel-to-pdf": {
    id: "excel-to-pdf",
    icon: FileSpreadsheet,
    solidColor: "#22C55E",
    conversionBadge: { to: "PDF" },
  },
  "powerpoint-to-pdf": {
    id: "powerpoint-to-pdf",
    icon: MonitorPlay,
    solidColor: "#14B8A6",
    conversionBadge: { to: "PDF" },
  },
  "ppt-to-pdf": {
    id: "ppt-to-pdf",
    icon: MonitorPlay,
    solidColor: "#14B8A6",
    conversionBadge: { to: "PDF" },
  },
  "jpg-to-pdf": {
    id: "jpg-to-pdf",
    icon: ImagePlus,
    solidColor: "#10B981",
    conversionBadge: { to: "PDF" },
  },

  // ==========================================
  // 3. PDF Tools: Convert FROM PDF (Amber/Orange)
  // ==========================================
  "pdf-to-word-converter": {
    id: "pdf-to-word-converter",
    icon: FileText,
    solidColor: "#F59E0B",
    conversionBadge: { to: "DOC" },
  },
  "pdf-to-word": {
    id: "pdf-to-word",
    icon: FileText,
    solidColor: "#F59E0B",
    conversionBadge: { to: "DOC" },
  },
  "pdf-to-excel-converter": {
    id: "pdf-to-excel-converter",
    icon: Table,
    solidColor: "#F97316",
    conversionBadge: { to: "XLS" },
  },
  "pdf-to-excel": {
    id: "pdf-to-excel",
    icon: Table,
    solidColor: "#F97316",
    conversionBadge: { to: "XLS" },
  },
  "pdf-to-powerpoint": {
    id: "pdf-to-powerpoint",
    icon: Presentation,
    solidColor: "#EF4444",
    conversionBadge: { to: "PPT" },
  },
  "pdf-to-ppt": {
    id: "pdf-to-ppt",
    icon: Presentation,
    solidColor: "#EF4444",
    conversionBadge: { to: "PPT" },
  },
  "pdf-to-jpg": {
    id: "pdf-to-jpg",
    icon: ImageIcon,
    solidColor: "#F43F5E",
    conversionBadge: { to: "JPG" },
  },

  // ==========================================
  // 4. PDF Tools: Edit / Create / Security
  // ==========================================
  "edit-pdf": {
    id: "edit-pdf",
    icon: PenLine,
    solidColor: "#D946EF",
  },
  "sign-pdf": {
    id: "sign-pdf",
    icon: PenTool,
    solidColor: "#8B5CF6",
  },
  "watermark-pdf": {
    id: "watermark-pdf",
    icon: Stamp,
    solidColor: "#A855F7",
  },
  "pdf-ocr": {
    id: "pdf-ocr",
    icon: ScanText,
    solidColor: "#8B5CF6",
  },
  "pdf-summarizer": {
    id: "pdf-summarizer",
    icon: Sparkles,
    solidColor: "#6366F1",
  },
  "unlock-pdf": {
    id: "unlock-pdf",
    icon: LockKeyholeOpen,
    solidColor: "#F43F5E",
  },
  "protect-pdf": {
    id: "protect-pdf",
    icon: ShieldCheck,
    solidColor: "#EF4444",
  },

  // ==========================================
  // 5. Calculator Tools (Bright Amber / Emerald / Indigo / Cyan)
  // ==========================================
  "age-calculator": {
    id: "age-calculator",
    icon: Cake,
    solidColor: "#F59E0B",
  },
  "sip-calculator": {
    id: "sip-calculator",
    icon: TrendingUp,
    solidColor: "#10B981",
  },
  "emi-calculator": {
    id: "emi-calculator",
    icon: Landmark,
    solidColor: "#6366F1",
  },
  "gst-calculator": {
    id: "gst-calculator",
    icon: Percent,
    solidColor: "#F97316",
  },
  "discount-calculator": {
    id: "discount-calculator",
    icon: Tag,
    solidColor: "#D946EF",
  },
  "income-tax-calculator": {
    id: "income-tax-calculator",
    icon: IndianRupee,
    solidColor: "#F59E0B",
  },
  "adsense-revenue-calculator": {
    id: "adsense-revenue-calculator",
    icon: IndianRupee,
    solidColor: "#F59E0B",
  },
  "youtube-money-calculator": {
    id: "youtube-money-calculator",
    icon: Play,
    solidColor: "#EF4444",
  },
  "bmi-calculator": {
    id: "bmi-calculator",
    icon: HeartPulse,
    solidColor: "#F43F5E",
  },
  "exam-marks-calculator": {
    id: "exam-marks-calculator",
    icon: Percent,
    solidColor: "#06B6D4",
  },

  // ==========================================
  // 6. Image & Document Tools
  // ==========================================
  "image-compressor": {
    id: "image-compressor",
    icon: ImageDown,
    solidColor: "#10B981",
  },
  "bg-remover": {
    id: "bg-remover",
    icon: Scissors,
    solidColor: "#EC4899",
  },
  "background-remover": {
    id: "background-remover",
    icon: Scissors,
    solidColor: "#EC4899",
  },
  "passport-photo-maker": {
    id: "passport-photo-maker",
    icon: Camera,
    solidColor: "#3B82F6",
  },
  "heic-to-jpg-png-converter": {
    id: "heic-to-jpg-png-converter",
    icon: ImageIcon,
    solidColor: "#F97316",
    conversionBadge: { to: "JPG" },
  },
  "webp-to-jpg-png-converter": {
    id: "webp-to-jpg-png-converter",
    icon: ImageIcon,
    solidColor: "#06B6D4",
    conversionBadge: { to: "PNG" },
  },
  "jpg-to-webp": {
    id: "jpg-to-webp",
    icon: ImagePlus,
    solidColor: "#14B8A6",
    conversionBadge: { to: "WEBP" },
  },
  "png-to-webp": {
    id: "png-to-webp",
    icon: ImagePlus,
    solidColor: "#0EA5E9",
    conversionBadge: { to: "WEBP" },
  },
  "color-palette-generator": {
    id: "color-palette-generator",
    icon: Palette,
    solidColor: "#8B5CF6",
  },
  "ai-image-upscaler": {
    id: "ai-image-upscaler",
    icon: Sparkles,
    solidColor: "#6366F1",
  },
  "video-compressor": {
    id: "video-compressor",
    icon: Video,
    solidColor: "#EF4444",
  },

  // ==========================================
  // 7. Govt & Exam Photo Resizer Hub Tools
  // ==========================================
  "aadhaar-photo-resizer": {
    id: "aadhaar-photo-resizer",
    icon: IdCard,
    solidColor: "#8B5CF6",
  },
  "crop-aadhaar-card": {
    id: "crop-aadhaar-card",
    icon: Crop,
    solidColor: "#F97316",
  },
  "pan-card-resize": {
    id: "pan-card-resize",
    icon: IdCard,
    solidColor: "#3B82F6",
  },
  "ssc-photo-resize": {
    id: "ssc-photo-resize",
    icon: IdCard,
    solidColor: "#06B6D4",
  },
  "upsc-photo-resize": {
    id: "upsc-photo-resize",
    icon: IdCard,
    solidColor: "#10B981",
  },
  "signature-resize": {
    id: "signature-resize",
    icon: PenTool,
    solidColor: "#A855F7",
  },
  "exam-photo-resizer": {
    id: "exam-photo-resizer",
    icon: Camera,
    solidColor: "#0EA5E9",
  },
  "gov-form-pdf-compressor": {
    id: "gov-form-pdf-compressor",
    icon: Minimize2,
    solidColor: "#3B82F6",
  },
  "gov-form-image-compressor": {
    id: "gov-form-image-compressor",
    icon: ImageDown,
    solidColor: "#10B981",
  },
  "aadhaar-pdf-compressor": {
    id: "aadhaar-pdf-compressor",
    icon: Minimize2,
    solidColor: "#6366F1",
  },
  "aadhaar-masking-tool": {
    id: "aadhaar-masking-tool",
    icon: ShieldCheck,
    solidColor: "#14B8A6",
  },

  // ==========================================
  // 8. Utilities & AI Suite
  // ==========================================
  "word-counter": {
    id: "word-counter",
    icon: Type,
    solidColor: "#0EA5E9",
  },
  "json-formatter-validator": {
    id: "json-formatter-validator",
    icon: FileJson2,
    solidColor: "#3B82F6",
  },
  "base64-encoder-decoder": {
    id: "base64-encoder-decoder",
    icon: Binary,
    solidColor: "#10B981",
    conversionBadge: { to: "B64" },
  },
  "base64-url-encoder-decoder": {
    id: "base64-encoder-decoder",
    icon: Binary,
    solidColor: "#10B981",
    conversionBadge: { to: "B64" },
  },
  "qr-code-generator": {
    id: "qr-code-generator",
    icon: QrCode,
    solidColor: "#6366F1",
  },
  "password-generator": {
    id: "password-generator",
    icon: KeyRound,
    solidColor: "#F43F5E",
  },
  "invoice-generator": {
    id: "invoice-generator",
    icon: Receipt,
    solidColor: "#F97316",
  },
  "invoice-cropper": {
    id: "invoice-cropper",
    icon: Crop,
    solidColor: "#14B8A6",
  },
  "resume-builder": {
    id: "resume-builder",
    icon: FileText,
    solidColor: "#10B981",
  },
  "ats-resume-checker": {
    id: "ats-resume-checker",
    icon: ShieldCheck,
    solidColor: "#14B8A6",
  },
  "resume-bullet-generator": {
    id: "resume-bullet-generator",
    icon: Sparkles,
    solidColor: "#8B5CF6",
  },
  "cover-letter-generator": {
    id: "cover-letter-generator",
    icon: FileText,
    solidColor: "#6366F1",
  },
  "ai-logo-maker": {
    id: "ai-logo-maker",
    icon: Sparkles,
    solidColor: "#D946EF",
  },
  "ai-image-describer": {
    id: "ai-image-describer",
    icon: Eye,
    solidColor: "#0EA5E9",
  },
  "text-humanizer": {
    id: "text-humanizer",
    icon: UserCheck,
    solidColor: "#10B981",
  },
  "voice-generator": {
    id: "voice-generator",
    icon: Mic,
    solidColor: "#8B5CF6",
  },
  "caption-generator": {
    id: "caption-generator",
    icon: MessageSquare,
    solidColor: "#EC4899",
  },
  "ocr-to-text": {
    id: "ocr-to-text",
    icon: ScanText,
    solidColor: "#8B5CF6",
  },

  // ==========================================
  // 9. Categories Direct Hub Tiles
  // ==========================================
  "image-tools": {
    id: "image-tools",
    icon: ImageIcon,
    solidColor: "#14B8A6",
  },
  "ai-tools": {
    id: "ai-tools",
    icon: Sparkles,
    solidColor: "#8B5CF6",
  },
  "document-tools": {
    id: "document-tools",
    icon: Folder,
    solidColor: "#0EA5E9",
  },
  "utility-tools": {
    id: "utility-tools",
    icon: Wrench,
    solidColor: "#F97316",
  },
  "resume-career": {
    id: "resume-career",
    icon: Briefcase,
    solidColor: "#10B981",
  },
  "seo-tools": {
    id: "seo-tools",
    icon: TrendingUp,
    solidColor: "#6366F1",
  },
  "developer-tools": {
    id: "developer-tools",
    icon: Code2,
    solidColor: "#3B82F6",
  },
  "social-media-tools": {
    id: "social-media-tools",
    icon: Share2,
    solidColor: "#EC4899",
  },
  "calculator-tools": {
    id: "calculator-tools",
    icon: Calculator,
    solidColor: "#F59E0B",
  },
  "video-tools": {
    id: "video-tools",
    icon: Video,
    solidColor: "#EF4444",
  },
};

// Fallback gradient generator based on category or raw icon name
export function getFallbackTileConfig(
  toolIdOrSlug?: string,
  rawIconName?: string,
  category?: string
): PremiumTileConfig {
  const cleanId = (toolIdOrSlug || "").toLowerCase().trim().replace(/^\/tools\//, "").replace(/\/$/, "");

  if (ALL_TOOL_TILES[cleanId]) {
    return ALL_TOOL_TILES[cleanId];
  }

  // Resolve Lucide Icon component
  let IconComponent: LucideIcon = Sparkles;
  if (rawIconName) {
    IconComponent =
      (LucideIcons as any)[rawIconName] ||
      (LucideIcons as any)[rawIconName + "Icon"] ||
      Sparkles;
  }

  // Assign flat solid color based on category
  switch (category) {
    case "Calculator Tools":
      return {
        id: cleanId || "calc",
        icon: IconComponent,
        solidColor: "#F59E0B",
      };
    case "Image Tools":
      return {
        id: cleanId || "img",
        icon: IconComponent,
        solidColor: "#10B981",
      };
    case "AI Tools":
      return {
        id: cleanId || "ai",
        icon: IconComponent,
        solidColor: "#8B5CF6",
      };
    case "Resume & Career":
      return {
        id: cleanId || "resume",
        icon: IconComponent,
        solidColor: "#14B8A6",
      };
    case "Social Media Tools":
      return {
        id: cleanId || "social",
        icon: IconComponent,
        solidColor: "#F97316",
      };
    case "Developer Tools":
    case "Utility Tools":
    case "Document Tools":
    default:
      return {
        id: cleanId || "util",
        icon: IconComponent,
        solidColor: "#0EA5E9",
      };
  }
}

export function isPdfTool(toolIdOrSlug?: string): boolean {
  return true; // We now render the gorgeous tile sitewide for all tools
}

export function getPdfToolConfig(
  toolIdOrSlug?: string,
  rawIconName?: string,
  category?: string
): PremiumTileConfig {
  const clean = (toolIdOrSlug || "").toLowerCase().trim().replace(/^\/tools\//, "").replace(/\/$/, "");
  return ALL_TOOL_TILES[clean] || getFallbackTileConfig(clean, rawIconName, category);
}

export interface PdfToolIconProps {
  toolId?: string;
  iconName?: string;
  category?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  loading?: "eager" | "lazy";
}

/**
 * Duotone two-layer icon tile — light back tile at top-left,
 * darker front tile with icon overlapping at bottom-right.
 * Forms one cohesive stacked-paper icon element.
 */
export default function PdfToolIcon({
  toolId = "merge-pdf",
  iconName,
  category,
  className = "",
  size = "md",
  loading = "eager",
}: PdfToolIconProps) {
  const config = getPdfToolConfig(toolId, iconName, category);
  const IconComponent = config.icon;
  const solidColor = config.solidColor;

  // Each size defines: container (holds both tiles), back tile, front tile, icon, and offset
  const sizeMap = {
    sm: {
      container: "w-10 h-10",          // back(32) + offset(8) = 40
      back: "w-8 h-8 rounded-lg",      // 32px
      front: "w-7 h-7 rounded-md",     // 28px
      iconSize: "w-3.5 h-3.5",
      offset: 6,                        // px overlap
    },
    md: {
      container: "w-[52px] h-[52px]",  // back(40) + offset(12) = 52
      back: "w-10 h-10 rounded-xl",    // 40px
      front: "w-9 h-9 rounded-lg",     // 36px
      iconSize: "w-4.5 h-4.5",
      offset: 7,
    },
    lg: {
      container: "w-[60px] h-[60px]",
      back: "w-12 h-12 rounded-xl",
      front: "w-10 h-10 rounded-lg",
      iconSize: "w-5 h-5",
      offset: 8,
    },
    xl: {
      container: "w-[72px] h-[72px]",
      back: "w-14 h-14 rounded-2xl",
      front: "w-12 h-12 rounded-xl",
      iconSize: "w-6 h-6",
      offset: 8,
    },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative shrink-0 ${s.container} ${className}`}
      data-loading={loading}
    >
      {/* Back layer — light tinted tile, pinned top-left */}
      <div
        className={`absolute top-0 left-0 ${s.back}`}
        style={{ backgroundColor: `${solidColor}18` }}
      />
      {/* Front layer — solid tile with icon, overlapping bottom-right */}
      <div
        className={`absolute ${s.front} flex items-center justify-center text-white shadow-xs`}
        style={{
          backgroundColor: solidColor,
          bottom: 0,
          right: 0,
        }}
      >
        <IconComponent
          className={`${s.iconSize} text-white`}
          strokeWidth={2}
        />
      </div>

      {/* Tiny format badge — attached to top-right corner of front tile */}
      {config.conversionBadge && (
        <div
          className="absolute z-20 flex items-center rounded-sm px-[3px] py-[1px] pointer-events-none shadow-xs"
          style={{
            backgroundColor: solidColor,
            bottom: s.offset === 6 ? 22 : s.offset === 7 ? 28 : 38,
            right: 0,
          }}
        >
          <span className="text-[5.5px] font-bold text-white leading-none tracking-tight uppercase">
            {config.conversionBadge.to}
          </span>
        </div>
      )}
    </div>
  );
}

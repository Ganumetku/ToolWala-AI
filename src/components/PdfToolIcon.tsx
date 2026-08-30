"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import {
  GitMerge,
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
  gradient: string; // 2-tone light-to-medium bright gradient
  glowColor: string; // Vibrant matching outer drop shadow
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
  "merge-pdf": {
    id: "merge-pdf",
    icon: GitMerge,
    gradient: "from-[#8B5CF6] to-[#6366F1]", // Bright Violet -> Indigo
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
  "split-pdf": {
    id: "split-pdf",
    icon: Scissors,
    gradient: "from-[#22D3EE] to-[#06B6D4]", // Bright Cyan
    glowColor: "rgba(6, 182, 212, 0.4)",
  },
  "compress-pdf": {
    id: "compress-pdf",
    icon: Minimize2,
    gradient: "from-[#60A5FA] to-[#3B82F6]", // Bright Blue
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  "rotate-pdf": {
    id: "rotate-pdf",
    icon: RotateCw,
    gradient: "from-[#38BDF8] to-[#0EA5E9]", // Bright Sky
    glowColor: "rgba(14, 165, 233, 0.4)",
  },
  "organize-pdf": {
    id: "organize-pdf",
    icon: LayoutGrid,
    gradient: "from-[#60A5FA] to-[#3B82F6]", // Bright Blue
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  "crop-pdf": {
    id: "crop-pdf",
    icon: Crop,
    gradient: "from-[#38BDF8] to-[#06B6D4]", // Bright Sky -> Cyan
    glowColor: "rgba(6, 182, 212, 0.4)",
  },
  "remove-pages": {
    id: "remove-pages",
    icon: Trash2,
    gradient: "from-[#FB7185] to-[#F43F5E]", // Bright Rose
    glowColor: "rgba(244, 63, 94, 0.4)",
  },
  "add-page-numbers-to-pdf": {
    id: "add-page-numbers-to-pdf",
    icon: Hash,
    gradient: "from-[#60A5FA] to-[#3B82F6]", // Bright Blue
    glowColor: "rgba(37, 99, 235, 0.4)",
  },
  "pdf-tools": {
    id: "pdf-tools",
    icon: ArrowRightLeft,
    gradient: "from-[#60A5FA] to-[#3B82F6]",
    glowColor: "rgba(37, 99, 235, 0.4)",
  },

  // ==========================================
  // 2. PDF Tools: Convert TO PDF (Green/Teal)
  // ==========================================
  "word-to-pdf-converter": {
    id: "word-to-pdf-converter",
    icon: FileOutput,
    gradient: "from-[#34D399] to-[#10B981]", // Bright Emerald
    glowColor: "rgba(16, 185, 129, 0.4)",
    conversionBadge: { to: "PDF" },
  },
  "word-to-pdf": {
    id: "word-to-pdf",
    icon: FileOutput,
    gradient: "from-[#34D399] to-[#10B981]",
    glowColor: "rgba(16, 185, 129, 0.4)",
    conversionBadge: { to: "PDF" },
  },
  "excel-to-pdf-converter": {
    id: "excel-to-pdf-converter",
    icon: FileSpreadsheet,
    gradient: "from-[#4ADE80] to-[#22C55E]", // Bright Green
    glowColor: "rgba(34, 197, 94, 0.4)",
    conversionBadge: { to: "PDF" },
  },
  "excel-to-pdf": {
    id: "excel-to-pdf",
    icon: FileSpreadsheet,
    gradient: "from-[#4ADE80] to-[#22C55E]",
    glowColor: "rgba(34, 197, 94, 0.4)",
    conversionBadge: { to: "PDF" },
  },
  "powerpoint-to-pdf": {
    id: "powerpoint-to-pdf",
    icon: MonitorPlay,
    gradient: "from-[#2DD4BF] to-[#14B8A6]", // Bright Teal
    glowColor: "rgba(20, 184, 166, 0.4)",
    conversionBadge: { to: "PDF" },
  },
  "ppt-to-pdf": {
    id: "ppt-to-pdf",
    icon: MonitorPlay,
    gradient: "from-[#2DD4BF] to-[#14B8A6]",
    glowColor: "rgba(20, 184, 166, 0.4)",
    conversionBadge: { to: "PDF" },
  },
  "jpg-to-pdf": {
    id: "jpg-to-pdf",
    icon: ImagePlus,
    gradient: "from-[#2DD4BF] to-[#10B981]", // Bright Teal -> Emerald
    glowColor: "rgba(20, 184, 166, 0.4)",
    conversionBadge: { to: "PDF" },
  },

  // ==========================================
  // 3. PDF Tools: Convert FROM PDF (Amber/Orange)
  // ==========================================
  "pdf-to-word-converter": {
    id: "pdf-to-word-converter",
    icon: FileText,
    gradient: "from-[#FBBF24] to-[#F59E0B]", // Bright Amber
    glowColor: "rgba(245, 158, 11, 0.4)",
    conversionBadge: { to: "DOC" },
  },
  "pdf-to-word": {
    id: "pdf-to-word",
    icon: FileText,
    gradient: "from-[#FBBF24] to-[#F59E0B]",
    glowColor: "rgba(245, 158, 11, 0.4)",
    conversionBadge: { to: "DOC" },
  },
  "pdf-to-excel-converter": {
    id: "pdf-to-excel-converter",
    icon: Table,
    gradient: "from-[#FB923C] to-[#F97316]", // Bright Orange
    glowColor: "rgba(249, 115, 22, 0.4)",
    conversionBadge: { to: "XLS" },
  },
  "pdf-to-excel": {
    id: "pdf-to-excel",
    icon: Table,
    gradient: "from-[#FB923C] to-[#F97316]",
    glowColor: "rgba(249, 115, 22, 0.4)",
    conversionBadge: { to: "XLS" },
  },
  "pdf-to-powerpoint": {
    id: "pdf-to-powerpoint",
    icon: Presentation,
    gradient: "from-[#F97316] to-[#EF4444]", // Bright Orange -> Coral Red
    glowColor: "rgba(239, 68, 68, 0.4)",
    conversionBadge: { to: "PPT" },
  },
  "pdf-to-ppt": {
    id: "pdf-to-ppt",
    icon: Presentation,
    gradient: "from-[#F97316] to-[#EF4444]",
    glowColor: "rgba(239, 68, 68, 0.4)",
    conversionBadge: { to: "PPT" },
  },
  "pdf-to-jpg": {
    id: "pdf-to-jpg",
    icon: ImageIcon,
    gradient: "from-[#FB7185] to-[#F43F5E]", // Bright Rose
    glowColor: "rgba(244, 63, 94, 0.4)",
    conversionBadge: { to: "JPG" },
  },

  // ==========================================
  // 4. PDF Tools: Edit / Create / Security
  // ==========================================
  "edit-pdf": {
    id: "edit-pdf",
    icon: PenLine,
    gradient: "from-[#E879F9] to-[#D946EF]", // Bright Fuchsia
    glowColor: "rgba(217, 70, 239, 0.4)",
  },
  "sign-pdf": {
    id: "sign-pdf",
    icon: PenTool,
    gradient: "from-[#A855F7] to-[#8B5CF6]", // Bright Purple -> Violet
    glowColor: "rgba(139, 92, 246, 0.4)",
  },
  "watermark-pdf": {
    id: "watermark-pdf",
    icon: Stamp,
    gradient: "from-[#C084FC] to-[#A855F7]", // Bright Purple
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
  "pdf-ocr": {
    id: "pdf-ocr",
    icon: ScanText,
    gradient: "from-[#A78BFA] to-[#8B5CF6]", // Bright Violet
    glowColor: "rgba(139, 92, 246, 0.4)",
  },
  "pdf-summarizer": {
    id: "pdf-summarizer",
    icon: Sparkles,
    gradient: "from-[#818CF8] to-[#6366F1]", // Bright Indigo
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
  "unlock-pdf": {
    id: "unlock-pdf",
    icon: LockKeyholeOpen,
    gradient: "from-[#FB7185] to-[#F43F5E]", // Bright Rose
    glowColor: "rgba(244, 63, 94, 0.4)",
  },
  "protect-pdf": {
    id: "protect-pdf",
    icon: ShieldCheck,
    gradient: "from-[#F87171] to-[#EF4444]", // Bright Red
    glowColor: "rgba(239, 68, 68, 0.45)",
  },

  // ==========================================
  // 5. Calculator Tools (Bright Amber / Emerald / Indigo / Cyan)
  // ==========================================
  "age-calculator": {
    id: "age-calculator",
    icon: Cake,
    gradient: "from-[#FBBF24] to-[#F59E0B]", // Bright Amber
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  "sip-calculator": {
    id: "sip-calculator",
    icon: TrendingUp,
    gradient: "from-[#34D399] to-[#10B981]", // Bright Emerald
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  "emi-calculator": {
    id: "emi-calculator",
    icon: Landmark,
    gradient: "from-[#818CF8] to-[#6366F1]", // Bright Indigo
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
  "gst-calculator": {
    id: "gst-calculator",
    icon: Percent,
    gradient: "from-[#FB923C] to-[#F97316]", // Bright Orange
    glowColor: "rgba(249, 115, 22, 0.4)",
  },
  "discount-calculator": {
    id: "discount-calculator",
    icon: Tag,
    gradient: "from-[#E879F9] to-[#D946EF]", // Bright Fuchsia
    glowColor: "rgba(217, 70, 239, 0.4)",
  },
  "income-tax-calculator": {
    id: "income-tax-calculator",
    icon: IndianRupee,
    gradient: "from-[#FBBF24] to-[#F59E0B]", // Bright Gold/Amber
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  "adsense-revenue-calculator": {
    id: "adsense-revenue-calculator",
    icon: IndianRupee,
    gradient: "from-[#FBBF24] to-[#F59E0B]", // Bright Gold/Amber
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  "youtube-money-calculator": {
    id: "youtube-money-calculator",
    icon: Play,
    gradient: "from-[#F87171] to-[#EF4444]", // Bright Red
    glowColor: "rgba(239, 68, 68, 0.45)",
  },
  "bmi-calculator": {
    id: "bmi-calculator",
    icon: HeartPulse,
    gradient: "from-[#FB7185] to-[#F43F5E]", // Bright Rose
    glowColor: "rgba(244, 63, 94, 0.4)",
  },
  "exam-marks-calculator": {
    id: "exam-marks-calculator",
    icon: Percent,
    gradient: "from-[#22D3EE] to-[#06B6D4]", // Bright Cyan
    glowColor: "rgba(6, 182, 212, 0.4)",
  },

  // ==========================================
  // 6. Image & Document Tools
  // ==========================================
  "image-compressor": {
    id: "image-compressor",
    icon: ImageDown,
    gradient: "from-[#34D399] to-[#10B981]", // Bright Emerald
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  "bg-remover": {
    id: "bg-remover",
    icon: Scissors,
    gradient: "from-[#F472B6] to-[#EC4899]", // Bright Pink
    glowColor: "rgba(236, 72, 153, 0.4)",
  },
  "background-remover": {
    id: "background-remover",
    icon: Scissors,
    gradient: "from-[#F472B6] to-[#EC4899]",
    glowColor: "rgba(236, 72, 153, 0.4)",
  },
  "passport-photo-maker": {
    id: "passport-photo-maker",
    icon: Camera,
    gradient: "from-[#38BDF8] to-[#3B82F6]", // Bright Sky -> Blue
    glowColor: "rgba(37, 99, 235, 0.4)",
  },
  "heic-to-jpg-png-converter": {
    id: "heic-to-jpg-png-converter",
    icon: ImageIcon,
    gradient: "from-[#FBBF24] to-[#F97316]", // Bright Amber -> Orange
    glowColor: "rgba(245, 158, 11, 0.4)",
    conversionBadge: { to: "JPG" },
  },
  "webp-to-jpg-png-converter": {
    id: "webp-to-jpg-png-converter",
    icon: ImageIcon,
    gradient: "from-[#2DD4BF] to-[#06B6D4]", // Bright Teal -> Cyan
    glowColor: "rgba(20, 184, 166, 0.4)",
    conversionBadge: { to: "PNG" },
  },
  "jpg-to-webp": {
    id: "jpg-to-webp",
    icon: ImagePlus,
    gradient: "from-[#34D399] to-[#14B8A6]", // Bright Emerald -> Teal
    glowColor: "rgba(16, 185, 129, 0.4)",
    conversionBadge: { to: "WEBP" },
  },
  "png-to-webp": {
    id: "png-to-webp",
    icon: ImagePlus,
    gradient: "from-[#22D3EE] to-[#0EA5E9]", // Bright Cyan -> Sky
    glowColor: "rgba(6, 182, 212, 0.4)",
    conversionBadge: { to: "WEBP" },
  },
  "color-palette-generator": {
    id: "color-palette-generator",
    icon: Palette,
    gradient: "from-[#E879F9] to-[#8B5CF6]", // Bright Fuchsia -> Violet
    glowColor: "rgba(217, 70, 239, 0.4)",
  },
  "ai-image-upscaler": {
    id: "ai-image-upscaler",
    icon: Sparkles,
    gradient: "from-[#818CF8] to-[#6366F1]", // Bright Indigo
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
  "video-compressor": {
    id: "video-compressor",
    icon: Video,
    gradient: "from-[#F97316] to-[#EF4444]", // Bright Orange -> Red
    glowColor: "rgba(239, 68, 68, 0.4)",
  },

  // ==========================================
  // 7. Govt & Exam Photo Resizer Hub Tools
  // ==========================================
  "aadhaar-photo-resizer": {
    id: "aadhaar-photo-resizer",
    icon: IdCard,
    gradient: "from-[#A855F7] to-[#8B5CF6]", // Bright Violet
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
  "crop-aadhaar-card": {
    id: "crop-aadhaar-card",
    icon: Crop,
    gradient: "from-[#FB923C] to-[#F97316]", // Bright Orange
    glowColor: "rgba(249, 115, 22, 0.4)",
  },
  "pan-card-resize": {
    id: "pan-card-resize",
    icon: IdCard,
    gradient: "from-[#60A5FA] to-[#3B82F6]", // Bright Blue
    glowColor: "rgba(37, 99, 235, 0.4)",
  },
  "ssc-photo-resize": {
    id: "ssc-photo-resize",
    icon: IdCard,
    gradient: "from-[#22D3EE] to-[#06B6D4]", // Bright Cyan
    glowColor: "rgba(6, 182, 212, 0.4)",
  },
  "upsc-photo-resize": {
    id: "upsc-photo-resize",
    icon: IdCard,
    gradient: "from-[#34D399] to-[#10B981]", // Bright Emerald
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  "signature-resize": {
    id: "signature-resize",
    icon: PenTool,
    gradient: "from-[#C084FC] to-[#A855F7]", // Bright Purple
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
  "exam-photo-resizer": {
    id: "exam-photo-resizer",
    icon: Camera,
    gradient: "from-[#38BDF8] to-[#0EA5E9]", // Bright Sky
    glowColor: "rgba(14, 165, 233, 0.4)",
  },
  "gov-form-pdf-compressor": {
    id: "gov-form-pdf-compressor",
    icon: Minimize2,
    gradient: "from-[#60A5FA] to-[#3B82F6]", // Bright Blue
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  "gov-form-image-compressor": {
    id: "gov-form-image-compressor",
    icon: ImageDown,
    gradient: "from-[#34D399] to-[#10B981]", // Bright Emerald
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  "aadhaar-pdf-compressor": {
    id: "aadhaar-pdf-compressor",
    icon: Minimize2,
    gradient: "from-[#8B5CF6] to-[#6366F1]", // Bright Violet -> Indigo
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
  "aadhaar-masking-tool": {
    id: "aadhaar-masking-tool",
    icon: ShieldCheck,
    gradient: "from-[#2DD4BF] to-[#14B8A6]", // Bright Teal
    glowColor: "rgba(20, 184, 166, 0.4)",
  },

  // ==========================================
  // 8. Utilities & AI Suite
  // ==========================================
  "word-counter": {
    id: "word-counter",
    icon: Type,
    gradient: "from-[#38BDF8] to-[#0EA5E9]", // Bright Sky
    glowColor: "rgba(14, 165, 233, 0.4)",
  },
  "json-formatter-validator": {
    id: "json-formatter-validator",
    icon: FileJson2,
    gradient: "from-[#818CF8] to-[#3B82F6]", // Bright Indigo -> Blue
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
  "qr-code-generator": {
    id: "qr-code-generator",
    icon: QrCode,
    gradient: "from-[#A855F7] to-[#6366F1]", // Bright Purple -> Indigo
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
  "password-generator": {
    id: "password-generator",
    icon: KeyRound,
    gradient: "from-[#FB7185] to-[#F43F5E]", // Bright Rose
    glowColor: "rgba(244, 63, 94, 0.4)",
  },
  "invoice-generator": {
    id: "invoice-generator",
    icon: Receipt,
    gradient: "from-[#FBBF24] to-[#F97316]", // Bright Amber -> Orange
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  "invoice-cropper": {
    id: "invoice-cropper",
    icon: Crop,
    gradient: "from-[#2DD4BF] to-[#14B8A6]", // Bright Teal
    glowColor: "rgba(20, 184, 166, 0.4)",
  },
  "resume-builder": {
    id: "resume-builder",
    icon: FileText,
    gradient: "from-[#34D399] to-[#10B981]", // Bright Emerald
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  "ats-resume-checker": {
    id: "ats-resume-checker",
    icon: ShieldCheck,
    gradient: "from-[#2DD4BF] to-[#14B8A6]", // Bright Teal
    glowColor: "rgba(20, 184, 166, 0.4)",
  },
  "resume-bullet-generator": {
    id: "resume-bullet-generator",
    icon: Sparkles,
    gradient: "from-[#A855F7] to-[#8B5CF6]", // Bright Purple -> Violet
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
  "cover-letter-generator": {
    id: "cover-letter-generator",
    icon: FileText,
    gradient: "from-[#818CF8] to-[#6366F1]", // Bright Indigo
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
  "ai-logo-maker": {
    id: "ai-logo-maker",
    icon: Sparkles,
    gradient: "from-[#E879F9] to-[#D946EF]", // Bright Fuchsia
    glowColor: "rgba(217, 70, 239, 0.4)",
  },
  "ai-image-describer": {
    id: "ai-image-describer",
    icon: Eye,
    gradient: "from-[#38BDF8] to-[#0EA5E9]", // Bright Sky
    glowColor: "rgba(14, 165, 233, 0.4)",
  },
  "text-humanizer": {
    id: "text-humanizer",
    icon: UserCheck,
    gradient: "from-[#34D399] to-[#10B981]", // Bright Emerald
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  "voice-generator": {
    id: "voice-generator",
    icon: Mic,
    gradient: "from-[#A855F7] to-[#8B5CF6]", // Bright Purple -> Violet
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
  "caption-generator": {
    id: "caption-generator",
    icon: MessageSquare,
    gradient: "from-[#F472B6] to-[#EC4899]", // Bright Pink
    glowColor: "rgba(236, 72, 153, 0.4)",
  },
  "ocr-to-text": {
    id: "ocr-to-text",
    icon: ScanText,
    gradient: "from-[#A78BFA] to-[#8B5CF6]", // Bright Violet
    glowColor: "rgba(139, 92, 246, 0.4)",
  },

  // ==========================================
  // 9. Categories Direct Hub Tiles
  // ==========================================
  "image-tools": {
    id: "image-tools",
    icon: ImageIcon,
    gradient: "from-[#2DD4BF] to-[#14B8A6]", // Bright Teal
    glowColor: "rgba(20, 184, 166, 0.4)",
  },
  "ai-tools": {
    id: "ai-tools",
    icon: Sparkles,
    gradient: "from-[#A855F7] to-[#8B5CF6]", // Bright Violet
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
  "document-tools": {
    id: "document-tools",
    icon: Folder,
    gradient: "from-[#38BDF8] to-[#0EA5E9]", // Bright Sky
    glowColor: "rgba(14, 165, 233, 0.4)",
  },
  "utility-tools": {
    id: "utility-tools",
    icon: Wrench,
    gradient: "from-[#FB923C] to-[#F97316]", // Bright Orange
    glowColor: "rgba(249, 115, 22, 0.4)",
  },
  "resume-career": {
    id: "resume-career",
    icon: Briefcase,
    gradient: "from-[#34D399] to-[#10B981]", // Bright Emerald
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  "seo-tools": {
    id: "seo-tools",
    icon: TrendingUp,
    gradient: "from-[#60A5FA] to-[#6366F1]", // Bright Blue -> Indigo
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
  "developer-tools": {
    id: "developer-tools",
    icon: Code2,
    gradient: "from-[#818CF8] to-[#3B82F6]", // Bright Indigo -> Blue
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
  "social-media-tools": {
    id: "social-media-tools",
    icon: Share2,
    gradient: "from-[#F472B6] to-[#EC4899]", // Bright Pink
    glowColor: "rgba(236, 72, 153, 0.4)",
  },
  "calculator-tools": {
    id: "calculator-tools",
    icon: Calculator,
    gradient: "from-[#FBBF24] to-[#F59E0B]", // Bright Amber
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  "video-tools": {
    id: "video-tools",
    icon: Video,
    gradient: "from-[#F87171] to-[#EF4444]", // Bright Red
    glowColor: "rgba(239, 68, 68, 0.45)",
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

  // Assign bright, vibrant gradient based on category
  switch (category) {
    case "Calculator Tools":
      return {
        id: cleanId || "calc",
        icon: IconComponent,
        gradient: "from-[#FBBF24] to-[#F59E0B]", // Bright Amber
        glowColor: "rgba(245, 158, 11, 0.4)",
      };
    case "Image Tools":
      return {
        id: cleanId || "img",
        icon: IconComponent,
        gradient: "from-[#34D399] to-[#10B981]", // Bright Emerald
        glowColor: "rgba(16, 185, 129, 0.4)",
      };
    case "AI Tools":
      return {
        id: cleanId || "ai",
        icon: IconComponent,
        gradient: "from-[#A855F7] to-[#8B5CF6]", // Bright Violet
        glowColor: "rgba(168, 85, 247, 0.4)",
      };
    case "Resume & Career":
      return {
        id: cleanId || "resume",
        icon: IconComponent,
        gradient: "from-[#2DD4BF] to-[#14B8A6]", // Bright Teal
        glowColor: "rgba(20, 184, 166, 0.4)",
      };
    case "Social Media Tools":
      return {
        id: cleanId || "social",
        icon: IconComponent,
        gradient: "from-[#FB923C] to-[#F97316]", // Bright Orange
        glowColor: "rgba(249, 115, 22, 0.4)",
      };
    case "Developer Tools":
    case "Utility Tools":
    case "Document Tools":
    default:
      return {
        id: cleanId || "util",
        icon: IconComponent,
        gradient: "from-[#38BDF8] to-[#0EA5E9]", // Bright Sky Blue
        glowColor: "rgba(14, 165, 233, 0.4)",
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
}

/**
 * Sitewide Bright 2-Tone Gradient Tile with Tactile Inset Depth, Floating Glow,
 * and Micro-Format Badges.
 */
export default function PdfToolIcon({
  toolId = "merge-pdf",
  iconName,
  category,
  className = "",
  size = "md",
}: PdfToolIconProps) {
  const config = getPdfToolConfig(toolId, iconName, category);
  const IconComponent = config.icon;

  // Responsive dimensions
  const sizeMap = {
    sm: {
      // 32x32px compact tile, 8px radius, 16x16px icon
      container: "w-8 h-8 rounded-[8px]",
      iconSize: "w-4 h-4",
    },
    md: {
      // 44x44px standard tile, 10px radius, 24x24px icon
      container: "w-11 h-11 rounded-[10px]",
      iconSize: "w-6 h-6",
    },
    lg: {
      // 56x56px medium-large tile, 13px radius, 28x28px icon
      container: "w-14 h-14 rounded-[13px]",
      iconSize: "w-7 h-7",
    },
    xl: {
      // 64x64px banner/hero tile, 16px radius, 32x32px icon
      container: "w-16 h-16 rounded-[16px]",
      iconSize: "w-8 h-8",
    },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`group relative flex items-center justify-center shrink-0 ${s.container} bg-gradient-to-br ${config.gradient} text-white border border-white/30 dark:border-white/20 overflow-hidden transition-all duration-300 group-hover:scale-[1.06] ${className}`}
      style={{
        boxShadow: `0 6px 16px -2px ${config.glowColor}, inset 0 1px 1.5px rgba(255,255,255,0.45)`,
      }}
    >
      {/* Top Half Soft Glassy Bevel Highlight */}
      <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/25 to-transparent pointer-events-none rounded-t-[inherit]" />

      {/* Main Centered Icon (2.5px stroke, clean outline) */}
      <IconComponent
        className={`relative z-10 ${s.iconSize} text-white transition-transform duration-300 group-hover:scale-105`}
        strokeWidth={2.3}
      />

      {/* Format-Tag Corner Badge for Conversion Tools */}
      {config.conversionBadge && (
        <div className="absolute bottom-1 right-1 z-20 flex items-center bg-black/25 backdrop-blur-md rounded-full px-1.5 py-0.2 border border-white/30 shadow-sm pointer-events-none">
          <span className="text-[7px] font-black text-white leading-none tracking-tight">
            {config.conversionBadge.to}
          </span>
        </div>
      )}
    </div>
  );
}

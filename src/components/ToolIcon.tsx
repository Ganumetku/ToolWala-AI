"use client";

import React from 'react';
import * as LucideIcons from 'lucide-react';
import PdfToolIcon, { isPdfTool } from '@/components/PdfToolIcon';

export interface ToolIconProps {
  icon?: React.ReactNode | string;
  name?: string;
  toolId?: string;
  category?: string;
  className?: string;
  size?: number | string;
  strokeWidth?: number;
  fallback?: string;
}

// Map legacy emojis or common aliases to standard Lucide icon component names
const ICON_ALIASES: Record<string, string> = {
  // Legacy Emojis
  "💰": "IndianRupee",
  "📝": "Type",
  "⚙️": "FileJson2",
  "🔄": "Image",
  "⚖️": "HeartPulse",
  "📸": "IdCard",
  "🎨": "Palette",
  "📉": "ImageDown",
  "🖼️": "Image",
  "⚡": "ImagePlus",
  "💎": "ImagePlus",
  "📱": "QrCode",
  "📄": "FileText",
  "✍️": "FilePenLine",
  "📊": "FileSpreadsheet",
  "🔀": "Merge",
  "✂️": "SplitSquareHorizontal",
  "📑": "Image",
  "🔐": "Lock",
  "🔓": "LockOpen",
  "🏷️": "Droplets",
  "🗂️": "LayoutGrid",
  "📖": "ScanText",
  "🤖": "Sparkles",
  "🪪": "IdCard",
  "🔍": "CheckCircle2",
  "💬": "MessageSquareText",
  "👁️": "ScanEye",
  "🧠": "UserCheck",
  "🎙️": "Mic",
  "💸": "Receipt",
  "✉️": "Mail",
  "🔑": "KeyRound",
  "📘": "FileText",
  "🧮": "Cake",
  "📈": "TrendingUp",
  "🏦": "Landmark",
  "🧾": "Percent",
  "▶️": "Youtube",
  "🚀": "Sparkles",
  "🎯": "IdCard",
  "🏛️": "IdCard",
  "🎓": "IdCard",
  "🔒": "Shrink",
  "📁": "FileMinus",
  "🗑️": "FileMinus",
  "🔢": "Hash",
  "🖊️": "PenTool",
  "🎬": "Video",
  "🎥": "Video",
  "🗜️": "FileMinus",
  "✏️": "FilePenLine",
  "🧩": "Merge",
  "✨": "Wand2",
  "⭐": "Sparkles",
  // Common name aliases
  "FilePen": "FilePenLine",
  "FileEdit": "FilePenLine",
  "Split": "SplitSquareHorizontal",
  "YoutubePlay": "Youtube",
};

/**
 * Returns Tailwind color style classes based on tool category for consistent styling.
 */
export function getCategoryStyle(category?: string) {
  switch (category) {
    case 'PDF Tools':
      return {
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        border: 'border-blue-100 dark:border-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        hoverBg: 'group-hover:bg-blue-100/70 dark:group-hover:bg-blue-500/20',
        hoverBorder: 'group-hover:border-blue-300 dark:group-hover:border-blue-500/40',
        badgeBg: 'bg-blue-50 dark:bg-blue-500/10',
        badgeText: 'text-blue-600 dark:text-blue-400',
        badgeBorder: 'border-blue-200 dark:border-blue-500/20',
      };
    case 'Image Tools':
      return {
        bg: 'bg-purple-50 dark:bg-purple-500/10',
        border: 'border-purple-100 dark:border-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        hoverBg: 'group-hover:bg-purple-100/70 dark:group-hover:bg-purple-500/20',
        hoverBorder: 'group-hover:border-purple-300 dark:group-hover:border-purple-500/40',
        badgeBg: 'bg-purple-50 dark:bg-purple-500/10',
        badgeText: 'text-purple-600 dark:text-purple-400',
        badgeBorder: 'border-purple-200 dark:border-purple-500/20',
      };
    case 'AI Tools':
      return {
        bg: 'bg-violet-50 dark:bg-violet-500/10',
        border: 'border-violet-100 dark:border-violet-500/20',
        text: 'text-violet-600 dark:text-violet-400',
        hoverBg: 'group-hover:bg-violet-100/70 dark:group-hover:bg-violet-500/20',
        hoverBorder: 'group-hover:border-violet-300 dark:group-hover:border-violet-500/40',
        badgeBg: 'bg-violet-50 dark:bg-violet-500/10',
        badgeText: 'text-violet-600 dark:text-violet-400',
        badgeBorder: 'border-violet-200 dark:border-violet-500/20',
      };
    case 'Resume & Career':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-100 dark:border-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        hoverBg: 'group-hover:bg-emerald-100/70 dark:group-hover:bg-emerald-500/20',
        hoverBorder: 'group-hover:border-emerald-300 dark:group-hover:border-emerald-500/40',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
        badgeText: 'text-emerald-600 dark:text-emerald-400',
        badgeBorder: 'border-emerald-200 dark:border-emerald-500/20',
      };
    case 'Social Media Tools':
      return {
        bg: 'bg-orange-50 dark:bg-orange-500/10',
        border: 'border-orange-100 dark:border-orange-500/20',
        text: 'text-orange-600 dark:text-orange-400',
        hoverBg: 'group-hover:bg-orange-100/70 dark:group-hover:bg-orange-500/20',
        hoverBorder: 'group-hover:border-orange-300 dark:group-hover:border-orange-500/40',
        badgeBg: 'bg-orange-50 dark:bg-orange-500/10',
        badgeText: 'text-orange-600 dark:text-orange-400',
        badgeBorder: 'border-orange-200 dark:border-orange-500/20',
      };
    case 'Calculator Tools':
      return {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-100 dark:border-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        hoverBg: 'group-hover:bg-amber-100/70 dark:group-hover:bg-amber-500/20',
        hoverBorder: 'group-hover:border-amber-300 dark:group-hover:border-amber-500/40',
        badgeBg: 'bg-amber-50 dark:bg-amber-500/10',
        badgeText: 'text-amber-600 dark:text-amber-400',
        badgeBorder: 'border-amber-200 dark:border-amber-500/20',
      };
    case 'Developer Tools':
    case 'Utility Tools':
    case 'Document Tools':
    case 'Video Tools':
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-500/10',
        border: 'border-slate-200/70 dark:border-slate-500/20',
        text: 'text-slate-700 dark:text-slate-300',
        hoverBg: 'group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20',
        hoverBorder: 'group-hover:border-blue-200 dark:group-hover:border-blue-500/30',
        badgeBg: 'bg-slate-100 dark:bg-slate-500/10',
        badgeText: 'text-slate-600 dark:text-slate-300',
        badgeBorder: 'border-slate-200 dark:border-slate-500/20',
      };
  }
}

export default function ToolIcon({
  icon,
  name,
  className = "w-6 h-6",
  size,
  strokeWidth = 1.75,
  fallback = "Sparkles"
}: ToolIconProps) {
  // If icon is already a React Node (JSX component or element, not a string)
  if (icon && typeof icon !== 'string') {
    return <>{icon}</>;
  }

  const raw = (name || (typeof icon === 'string' ? icon : '')).trim();

  if (!raw) {
    const FallbackIcon = (LucideIcons as any)[fallback] || LucideIcons.Sparkles;
    return <FallbackIcon className={className} strokeWidth={strokeWidth} size={size} />;
  }

  // Check if target is an image path/URL
  const isImage =
    raw.startsWith('/') ||
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('data:image/') ||
    /\.(png|jpe?g|svg|webp|gif|ico)$/i.test(raw);

  if (isImage) {
    return (
      <img
        src={raw}
        alt=""
        className={`object-contain inline-block shrink-0 ${className}`}
        loading="lazy"
      />
    );
  }

  // Resolve alias if any
  const resolvedName = ICON_ALIASES[raw] || raw;

  // Custom Youtube SVG in matching Lucide 24x24 outline format
  if (resolvedName.toLowerCase() === 'youtube') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={size ? { width: size, height: size } : undefined}
      >
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
      </svg>
    );
  }

  // Dynamically resolve Lucide Icon component
  const IconComponent =
    (LucideIcons as any)[resolvedName] ||
    (LucideIcons as any)[resolvedName + "Icon"] ||
    (LucideIcons as any)[fallback] ||
    LucideIcons.Sparkles;

  return <IconComponent className={className} strokeWidth={strokeWidth} size={size} />;
}

export { ToolIcon };

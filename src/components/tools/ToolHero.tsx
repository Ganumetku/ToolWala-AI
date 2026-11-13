"use client";

import React from 'react';
import { Shield } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import { usePathname } from 'next/navigation';
import PdfToolIcon from '@/components/PdfToolIcon';

interface ToolHeroProps {
  title: string;
  description: string;
  badgeText?: string;
  icon?: React.ReactNode;
  toolId?: string;
  iconName?: string;
  category?: string;
}

export default function ToolHero({
  title,
  description,
  badgeText,
  icon,
  toolId,
  iconName,
  category
}: ToolHeroProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

  // Auto-detect tool ID from route pathname if not explicitly passed
  const pathParts = pathname ? pathname.replace(/\/$/, '').split('/').filter(Boolean) : [];
  const slugFromPath = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';
  const effectiveToolId = toolId || slugFromPath;
  const displayBadgeText = badgeText || t('tools.badge_client_side', 'Files stay on this device');

  return (
    <div className="p-5 sm:p-8 lg:p-10 border-b border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-6 flex-1 min-w-0">
        <PdfToolIcon
          toolId={effectiveToolId}
          iconName={iconName}
          category={category}
          size="xl"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{title}</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium mt-1 font-sans leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-emerald-200 dark:border-emerald-500/20 h-fit self-start sm:self-center shadow-xs shrink-0">
        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{displayBadgeText}</span>
      </div>
    </div>
  );
}


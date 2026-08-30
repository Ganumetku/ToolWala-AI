"use client";

import React from 'react';
import { Shield } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

interface ToolHeroProps {
  title: string;
  description: string;
  badgeText?: string;
  icon?: React.ReactNode;
}

export default function ToolHero({
  title,
  description,
  badgeText,
  icon
}: ToolHeroProps) {
  const { t } = useTranslation();
  const displayBadgeText = badgeText || t('tools.badge_client_side', '100% Client-Side & Secure');

  return (
    <div className="p-5 sm:p-8 lg:p-10 border-b border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-6 flex-1 min-w-0">
        {icon && (
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 min-w-[3rem] min-h-[3rem] sm:min-w-[3.5rem] sm:min-h-[3.5rem] aspect-square shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.25)] text-xl font-bold">
            {icon}
          </div>
        )}
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

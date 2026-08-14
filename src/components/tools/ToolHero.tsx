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
    <div className="p-8 sm:p-10 border-b border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-start justify-between gap-6">
      <div className="flex items-center gap-6">
        {icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.25)] text-xl font-bold">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{title}</h1>
          <p className="text-slate-600 dark:text-gray-400 font-medium mt-1 font-sans">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-500/20 h-fit self-start shadow-sm">
        <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{displayBadgeText}</span>
      </div>
    </div>
  );
}

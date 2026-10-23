"use client";

import { ShieldCheck, CloudOff, Cpu } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

export default function TrustBadges() {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto py-2 font-sans">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-2.5 px-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 text-[11px] font-medium text-slate-600 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-gray-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {t('privacy_hub.badges.on_device_title', '100% In-Browser')}
        </span>
        <span className="text-slate-300 dark:text-white/10 hidden sm:inline">•</span>
        <span className="inline-flex items-center gap-1.5">
          <CloudOff className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          {t('privacy_hub.badges.zero_logs_desc', 'Files are processed locally and never uploaded')}
        </span>
        <span className="text-slate-300 dark:text-white/10 hidden sm:inline">•</span>
        <span className="inline-flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          {t('privacy_hub.badges.offline_desc', 'Instant device memory compilation')}
        </span>
      </div>
    </div>
  );
}


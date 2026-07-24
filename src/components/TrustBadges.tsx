"use client";

import { motion } from 'framer-motion';
import { ShieldCheck, CloudOff, WifiOff } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

export default function TrustBadges() {
  const { t } = useTranslation();

  const badges = [
    {
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      title: t('privacy_hub.badges.on_device_title', '100% On-Device'),
      desc: t('privacy_hub.badges.on_device_desc', 'Processed on your machine'),
      bg: 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-300 dark:bg-emerald-500/5 dark:border-emerald-500/10 dark:hover:border-emerald-500/30'
    },
    {
      icon: <CloudOff className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      title: t('privacy_hub.badges.zero_logs_title', '0% Cloud Footprint'),
      desc: t('privacy_hub.badges.zero_logs_desc', 'No database files or logs'),
      bg: 'bg-blue-50/80 border-blue-200 hover:border-blue-300 dark:bg-blue-500/5 dark:border-blue-500/10 dark:hover:border-blue-500/30'
    },
    {
      icon: <WifiOff className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      title: t('privacy_hub.badges.offline_title', 'Offline Capable'),
      desc: t('privacy_hub.badges.offline_desc', 'Runs inside local browser tab'),
      bg: 'bg-purple-50/80 border-purple-200 hover:border-purple-300 dark:bg-purple-500/5 dark:border-purple-500/10 dark:hover:border-purple-500/30'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-2 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {badges.map((badge, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2, scale: 1.01 }}
            className={`flex items-center gap-3.5 p-4 rounded-[16px] border backdrop-blur-md transition-all duration-300 shadow-sm ${badge.bg}`}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white border border-[#E6ECF5] dark:bg-white/5 dark:border-white/5 flex items-center justify-center shadow-sm">
              {badge.icon}
            </div>
            <div className="text-left min-w-0">
              <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">
                {badge.title}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-semibold truncate">
                {badge.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { motion } from 'framer-motion';
import { ShieldCheck, CloudOff, WifiOff } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

export default function TrustBadges() {
  const { t } = useTranslation();

  const badges = [
    {
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      title: t('privacy_hub.badges.on_device_title', '100% On-Device'),
      desc: t('privacy_hub.badges.on_device_desc', 'Processed on your machine'),
      bg: 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30'
    },
    {
      icon: <CloudOff className="w-4 h-4 text-blue-400" />,
      title: t('privacy_hub.badges.zero_logs_title', '0% Cloud Footprint'),
      desc: t('privacy_hub.badges.zero_logs_desc', 'No database files or logs'),
      bg: 'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30'
    },
    {
      icon: <WifiOff className="w-4 h-4 text-purple-400" />,
      title: t('privacy_hub.badges.offline_title', 'Offline Capable'),
      desc: t('privacy_hub.badges.offline_desc', 'Runs inside local browser tab'),
      bg: 'bg-purple-500/5 border-purple-500/10 hover:border-purple-500/30'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {badges.map((badge, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2, scale: 1.01 }}
            className={`flex items-center gap-3.5 p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 ${badge.bg}`}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
              {badge.icon}
            </div>
            <div className="text-left min-w-0">
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider truncate">
                {badge.title}
              </h4>
              <p className="text-[9px] text-gray-500 font-semibold truncate">
                {badge.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

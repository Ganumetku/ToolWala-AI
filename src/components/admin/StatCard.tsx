"use client";

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change: string | number;
  isPositive: boolean;
  subtitle: string;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  isPositive,
  subtitle,
  delay = 0
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden bg-white dark:bg-white/[0.01] rounded-3xl p-6 border border-slate-200/80 dark:border-white/5 hover:border-blue-500/30 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md group"
    >
      {/* Blue Glow Effect */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 rounded-full transition-all duration-300" />

      <div className="flex items-center justify-between gap-4 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">{title}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg ${
            isPositive 
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/10' 
              : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/10'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {change}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-gray-500">{subtitle}</span>
        </div>
      </div>
    </motion.div>
  );
}

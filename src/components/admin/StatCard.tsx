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
      className="relative overflow-hidden glass rounded-3xl p-6 border border-white/5 bg-white/[0.01] hover:border-blue-500/20 hover:bg-white/[0.02] transition-all shadow-xl group"
    >
      {/* Blue Glow Effect */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 rounded-full transition-all duration-300" />

      <div className="flex items-center justify-between gap-4 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg ${
            isPositive 
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10' 
              : 'text-red-400 bg-red-500/10 border border-red-500/10'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {change}
          </span>
          <span className="text-[11px] font-semibold text-gray-500">{subtitle}</span>
        </div>
      </div>
    </motion.div>
  );
}

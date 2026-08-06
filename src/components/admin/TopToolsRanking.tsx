"use client";

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Flame, Eye, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ToolPerformance {
  id?: string;
  name: string;
  category?: string;
  views?: number;
  count?: number; // executions
  percentage?: string;
}

interface TopToolsRankingProps {
  tools?: ToolPerformance[];
  title?: string;
  subtitle?: string;
}



const RANK_STYLES = [
  {
    rankBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    barColor: 'bg-rose-500',
    textColor: 'text-rose-600 dark:text-rose-400',
    badgeText: 'TOP 1',
    badgeBg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    icon: '🥇',
  },
  {
    rankBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    barColor: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    badgeText: 'TOP 2',
    badgeBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    icon: '🥈',
  },
  {
    rankBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    badgeText: 'TOP 3',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    icon: '🥉',
  },
  {
    rankBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    barColor: 'bg-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    rankBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    barColor: 'bg-indigo-500',
    textColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    rankBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    barColor: 'bg-purple-500',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    rankBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    barColor: 'bg-pink-500',
    textColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    rankBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    barColor: 'bg-cyan-500',
    textColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    rankBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    barColor: 'bg-teal-500',
    textColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    rankBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    barColor: 'bg-sky-500',
    textColor: 'text-sky-600 dark:text-sky-400',
  },
];

export default function TopToolsRanking({ tools, title, subtitle }: TopToolsRankingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTools = useMemo(() => {
    return [...(tools || [])].sort((a, b) => {
      const valA = (a.views || 0) > 0 ? (a.views || 0) : (a.count || 0);
      const valB = (b.views || 0) > 0 ? (b.views || 0) : (b.count || 0);
      if (valB !== valA) return valB - valA;
      return ((b.views || 0) + (b.count || 0)) - ((a.views || 0) + (a.count || 0));
    }).slice(0, 10);
  }, [tools]);
  
  // Calculate total views for percentages & max views for bar length
  const totalViews = displayTools.reduce((acc, t) => acc + (t.views || t.count || 0), 0);
  const maxViews = Math.max(...displayTools.map(t => (t.views || t.count || 0)), 1);

  if (!mounted) {
    return (
      <div className="h-96 w-full bg-white/[0.01] border border-white/5 rounded-3xl animate-pulse flex items-center justify-center">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-600">Loading top tools leaderboard...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-white/[0.01] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full font-sans"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 uppercase">
            <Trophy className="w-5 h-5 text-amber-500" />
            {title || 'Top Performing Tools'}
          </h3>
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mt-1">
            {subtitle || 'Ranked by total page views and real-time user engagement.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Live Telemetry
          </span>
        </div>
      </div>

      {/* Top Tools Ranked Cards List */}
      <div className="space-y-3">
        {displayTools.slice(0, 10).map((tool, idx) => {
          const rank = idx + 1;
          const style = RANK_STYLES[idx % RANK_STYLES.length];
          const views = tool.views || tool.count || 0;
          const trafficPct = totalViews > 0 ? ((views / totalViews) * 100).toFixed(1) : '0.0';
          const barPct = maxViews > 0 ? (views / maxViews) * 100 : 0;

          return (
            <motion.div
              key={tool.name || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                rank <= 3
                  ? 'bg-slate-50/90 dark:bg-white/[0.02] border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-md'
                  : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                
                {/* Left: Rank & Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Rank Badge / Medal */}
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-black shrink-0 ${style.rankBg} shadow-xs`}>
                    {style.icon ? (
                      <span className="text-base">{style.icon}</span>
                    ) : (
                      <span>#{rank}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.name}
                      </h4>
                      {style.badgeText && (
                        <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider shrink-0 ${style.badgeBg}`}>
                          {style.badgeText}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <span>{trafficPct}% of total views</span>
                      {tool.category && (
                        <>
                          <span>•</span>
                          <span className="uppercase tracking-wider">{tool.category}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right: View Count */}
                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className={`text-base font-black tracking-tight block ${style.textColor}`}>
                      {views.toLocaleString()} <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">views</span>
                    </span>
                    {tool.count !== undefined && (
                      <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">
                        {tool.count.toLocaleString()} executions
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Dynamic Width Colored Progress Bar */}
              <div className="mt-3 w-full bg-slate-200/60 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${style.barColor}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

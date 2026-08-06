"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Globe, MapPin } from 'lucide-react';

interface CountryItem {
  name: string;
  value: number;
  percentage?: string;
}

interface CountryPieChartProps {
  data?: CountryItem[];
}

// Curated SaaS Color Palette for Pie Chart Slices
const COLORS = [
  '#2563EB', // Blue
  '#4F46E5', // Indigo
  '#7C3AED', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
];

const FLAG_MAP: Record<string, string> = {
  'India': '🇮🇳',
  'IN': '🇮🇳',
  'United States': '🇺🇸',
  'US': '🇺🇸',
  'Pakistan': '🇵🇰',
  'PK': '🇵🇰',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'Germany': '🇩🇪',
  'DE': '🇩🇪',
  'Canada': '🇨🇦',
  'CA': '🇨🇦',
  'Brazil': '🇧🇷',
  'BR': '🇧🇷',
  'Indonesia': '🇮🇩',
  'ID': '🇮🇩',
  'Spain': '🇪🇸',
  'ES': '🇪🇸',
  'France': '🇫🇷',
  'FR': '🇫🇷',
  'Others': '🌐',
  'Unknown': '🌐',
};

const DEFAULT_COUNTRIES: CountryItem[] = [
  { name: 'India', value: 45 },
  { name: 'United States', value: 25 },
  { name: 'Pakistan', value: 15 },
  { name: 'United Kingdom', value: 10 },
  { name: 'Others', value: 5 },
];

export default function CountryPieChart({ data }: CountryPieChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = (data && data.length > 0) ? data : DEFAULT_COUNTRIES;

  // Calculate total count & percentages
  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const formattedData = chartData.map((item, idx) => {
    const pct = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0;
    return {
      ...item,
      percentageNum: pct,
      percentageStr: `${pct}%`,
      color: COLORS[idx % COLORS.length],
      flag: FLAG_MAP[item.name] || '🌐',
    };
  });

  if (!isMounted) {
    return (
      <div className="h-80 w-full bg-white/[0.01] border border-white/5 rounded-3xl animate-pulse flex items-center justify-center">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-600">Loading country telemetry...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            Country Traffic Distribution
          </h4>
          <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mt-1">
            Global geographic percentage split of platform visitors.
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 text-[10px] font-black uppercase tracking-wider">
          Live %
        </span>
      </div>

      {/* Pie Chart & Country Legend Container */}
      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6 my-auto py-2">
        {/* Donut Pie Chart */}
        <div className="sm:col-span-6 h-56 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {formattedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs font-sans">
                        <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                          <span>{data.flag}</span>
                          <span>{data.name}</span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300 font-bold">
                          <span>Traffic Share:</span>
                          <span className="text-blue-600 dark:text-blue-400 font-black">{data.percentageStr}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                          {data.value.toLocaleString()} visitors
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Badge in Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">100%</span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Global</span>
          </div>
        </div>

        {/* Country Breakdown Legend with Percentage Bars */}
        <div className="sm:col-span-6 space-y-2.5">
          {formattedData.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.flag}</span>
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white text-xs">{item.percentageStr}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${item.percentageNum}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-blue-500" /> Top Location: {formattedData[0]?.name || 'India'} ({formattedData[0]?.percentageStr || '45%'})
        </span>
        <span>{chartData.length} Countries Tracked</span>
      </div>
    </motion.div>
  );
}

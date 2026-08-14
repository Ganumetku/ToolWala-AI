"use client";

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Mon', visitors: 1400, usage: 820 },
  { name: 'Tue', visitors: 2200, usage: 1100 },
  { name: 'Wed', visitors: 1980, usage: 1400 },
  { name: 'Thu', visitors: 2800, usage: 1850 },
  { name: 'Fri', visitors: 3600, usage: 2200 },
  { name: 'Sat', visitors: 3100, usage: 1900 },
  { name: 'Sun', visitors: 4200, usage: 2600 }
];

interface ChartOverviewProps {
  data?: Array<{ name: string; visitors?: number; views?: number; usage?: number; runs?: number }>;
}

export default function ChartOverview({ data }: ChartOverviewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = data?.map(d => ({
    name: d.name,
    visitors: d.visitors ?? d.views ?? 0,
    usage: d.usage ?? d.runs ?? 0
  })) || [];

  if (!isMounted) {
    return (
      <div className="h-80 w-full bg-white/[0.01] border border-white/5 rounded-3xl animate-pulse flex items-center justify-center">
        <span className="text-xs font-black uppercase tracking-widest text-gray-600">Loading charts telemetry...</span>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-80 w-full bg-white/[0.01] border border-white/5 rounded-3xl flex items-center justify-center">
        <span className="text-xs font-black uppercase tracking-widest text-gray-500">No chart telemetry available</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-white/[0.01] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Traffic & Usage Analytics</h4>
          <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mt-1">Comparison of total platform visitors vs. actual AI tool executions.</p>
        </div>
        
        <div className="flex gap-4 text-xs font-black uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
            <span className="text-slate-900 dark:text-white">Visitors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
            <span className="text-slate-500 dark:text-gray-400">Tool Usage</span>
          </div>
        </div>
      </div>

      <div className="h-60 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
              style={{ fontWeight: 800, textTransform: 'uppercase' }}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-5}
              style={{ fontWeight: 800 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                borderColor: '#e2e8f0',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#0f172a',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="visitors" 
              stroke="#2563eb" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVisitors)" 
            />
            <Area 
              type="monotone" 
              dataKey="usage" 
              stroke="#06b6d4" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUsage)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

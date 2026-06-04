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

export default function ChartOverview() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-80 w-full bg-white/[0.01] border border-white/5 rounded-3xl animate-pulse flex items-center justify-center">
        <span className="text-xs font-black uppercase tracking-widest text-gray-600">Loading charts telemetry...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] shadow-xl w-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest">Traffic & Usage Analytics</h4>
          <p className="text-xs font-medium text-gray-500 mt-1">Comparison of total platform visitors vs. actual AI tool executions.</p>
        </div>
        
        <div className="flex gap-4 text-xs font-black uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-white">Visitors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <span className="text-gray-400">Tool Usage</span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#4b5563" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
              style={{ fontWeight: 800, textTransform: 'uppercase' }}
            />
            <YAxis 
              stroke="#4b5563" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-5}
              style={{ fontWeight: 800 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(3, 7, 18, 0.9)', 
                borderColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#fff',
                backdropFilter: 'blur(12px)'
              }}
              labelStyle={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="visitors" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVisitors)" 
            />
            <Area 
              type="monotone" 
              dataKey="usage" 
              stroke="#22d3ee" 
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

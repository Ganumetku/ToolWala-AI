"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart2, Eye, Users, Clock, 
  ArrowUpRight, Monitor, Smartphone, Tablet, 
  TrendingUp, Globe, Compass, Share2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { motion } from 'framer-motion';
import StatCard from '@/components/admin/StatCard';

const dailyUsageData = [
  { name: 'Mon', views: 2400, runs: 1200 },
  { name: 'Tue', views: 3200, runs: 1800 },
  { name: 'Wed', views: 2900, runs: 1600 },
  { name: 'Thu', views: 4100, runs: 2400 },
  { name: 'Fri', views: 4800, runs: 2800 },
  { name: 'Sat', views: 3800, runs: 2100 },
  { name: 'Sun', views: 5200, runs: 3100 }
];

const trafficSourcesData = [
  { name: 'Google Search', value: 18500, percentage: '38%' },
  { name: 'Direct', value: 14200, percentage: '29%' },
  { name: 'Product Hunt', value: 7800, percentage: '16%' },
  { name: 'Reddit Referral', value: 4900, percentage: '10%' },
  { name: 'Twitter/X', value: 3400, percentage: '7%' }
];

const deviceData = [
  { name: 'Desktop', value: 28900, color: '#3b82f6' },
  { name: 'Mobile', value: 16800, color: '#22d3ee' },
  { name: 'Tablet', value: 3100, color: '#8b5cf6' }
];

export default function ToolAnalytics() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-10">
      
      {/* Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Page Views" 
          value="185,420" 
          icon={Eye} 
          change="+14.8%" 
          isPositive={true} 
          subtitle="runs in last 7 days"
        />
        <StatCard 
          title="Unique Visitors" 
          value="48,250" 
          icon={Users} 
          change="+8.6%" 
          isPositive={true} 
          subtitle="vs. previous month"
        />
        <StatCard 
          title="Avg. Visit Duration" 
          value="4m 12s" 
          icon={Clock} 
          change="+24s" 
          isPositive={true} 
          subtitle="average time on page"
        />
        <StatCard 
          title="Conversion Rate" 
          value="64.2%" 
          icon={TrendingUp} 
          change="+3.2%" 
          isPositive={true} 
          subtitle="runs divided by views"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Daily Views area chart */}
        <div className="lg:col-span-8 glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Daily Platform Traffic</h4>
            <p className="text-xs font-medium text-gray-500 mt-1">Tracks raw visitor views compared to active AI tool execution runs.</p>
          </div>

          <div className="h-72 w-full mt-6">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} style={{ fontWeight: 800 }} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} style={{ fontWeight: 800 }} />
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
                  />
                  <Area type="monotone" name="Page Views" dataKey="views" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" name="Tool Executions" dataKey="runs" stroke="#22d3ee" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRuns)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-white/[0.01] rounded-2xl animate-pulse" />
            )}
          </div>
        </div>

        {/* Devices breakdown pie chart */}
        <div className="lg:col-span-4 glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Device Demographics</h4>
            <p className="text-xs font-medium text-gray-500 mt-1">Breakdown of platform visits by device client profiles.</p>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="h-44 w-44 relative">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-white/[0.01] rounded-full animate-pulse" />
              )}
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">48.8k</span>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">sessions</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6 w-full text-center">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Monitor className="w-3.5 h-3.5" /> Desk
                </span>
                <span className="text-xs font-black text-white">59.2%</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> Mob
                </span>
                <span className="text-xs font-black text-white">34.4%</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Tablet className="w-3.5 h-3.5" /> Tab
                </span>
                <span className="text-xs font-black text-white">6.4%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Traffic Sources & Channel breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Traffic Channels table */}
        <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] shadow-xl">
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Traffic Referral Channels</h4>
          <div className="space-y-4">
            {trafficSourcesData.map((source, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-blue-500/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    {idx === 0 && <Globe className="w-4 h-4" />}
                    {idx === 1 && <Compass className="w-4 h-4" />}
                    {idx > 1 && <Share2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">{source.name}</h5>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-white block">{source.value.toLocaleString()}</span>
                  <span className="text-[9px] font-black text-gray-500 mt-0.5 block">{source.percentage} share</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Acquisition Graph */}
        <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Acquisition Distribution</h4>
            <p className="text-xs font-medium text-gray-500 mt-1">Comparison of absolute session counts for key traffic channels.</p>
          </div>

          <div className="h-72 w-full mt-6">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficSourcesData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" stroke="#4b5563" fontSize={9} tickLine={false} axisLine={false} style={{ fontWeight: 800 }} />
                  <YAxis dataKey="name" type="category" stroke="#4b5563" fontSize={9} tickLine={false} axisLine={false} style={{ fontWeight: 800 }} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(3, 7, 18, 0.9)', 
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="value" name="Sessions" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-white/[0.01] rounded-2xl animate-pulse" />
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

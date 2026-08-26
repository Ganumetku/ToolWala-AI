"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart2, Eye, Users, Clock, 
  ArrowUpRight, Monitor, Smartphone, Tablet, 
  TrendingUp, Globe, Compass, Share2, Calendar, Download, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { motion } from 'framer-motion';
import StatCard from '@/components/admin/StatCard';
import { adminFetch } from '@/lib/admin-fetch';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalVisitors: number;
  totalUsage: number;
  activeSessions: number;
  visitorsChange?: string;
  viewsChange?: string;
  usagesChange?: string;
  activeChange?: string;
  avgVisitDuration: string;
  conversionRate: number;
  deviceData: Array<{ name: string; value: number; color: string }>;
  topCountries: Array<{ name: string; value: number; percentage: string }>;
  trafficSourcesData: Array<{ name: string; value: number; percentage: string }>;
  popularCategories: Array<{ name: string; value: number }>;
  searchQueries: Array<{ query: string; count: number }>;
  blogViews: Array<{ slug: string; views: number }>;
  popularTools: Array<{ id: string; name: string; category: string; count: number; views: number; growth: string }>;
  recentLogs: Array<{ id: string; action: string; tool: string; user: string; status: string; time: string }>;
  dailyUsageData: Array<{ name: string; views: number; runs: number; visitors: number }>;
}

export default function ToolAnalytics() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      let url = `/api/analytics/dashboard?filter=${filter}`;
      if (filter === 'custom' && startDate && endDate) {
        url += `&start=${startDate}&end=${endDate}`;
      }
      
      const res = await adminFetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastUpdated(new Date().toLocaleTimeString());
        if (isManual) {
          toast.success('Live database analytics synchronized.');
        }
      } else {
        toast.error('Failed to sync analytics from server.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching analytics.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, [filter, startDate, endDate]);

  // Polling every 30 seconds for live telemetry updates
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      fetchStats(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [mounted, filter, startDate, endDate]);

  const handleExport = (format: 'csv' | 'json') => {
    if (!stats) {
      toast.error('No telemetry data available to export.');
      return;
    }

    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `toolwala_analytics_${filter}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('JSON telemetry report download started.');
    } else {
      // Export tool statistics as CSV
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Tool Name,Category,Views,Executions,Conversion Growth\n";
      stats.popularTools.forEach(t => {
        csvContent += `"${t.name}","${t.category}",${t.views},${t.count},"${t.growth}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodedUri);
      downloadAnchor.setAttribute("download", `toolwala_tool_performance_${filter}_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('CSV tools performance report download started.');
    }
  };

  if (loading || !stats) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="h-10 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl w-48" />
          <div className="h-10 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]" />
          ))}
        </div>
        <div className="h-80 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]" />
      </div>
    );
  }

  // Calculate sum of sessions for device details
  const totalSessionsVal = stats.deviceData.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const getDevicePercentage = (name: string) => {
    const dev = stats.deviceData.find(d => d.name === name);
    if (!dev) return '0%';
    return `${((dev.value / totalSessionsVal) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-10">
      
      {/* Filters & Actions Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Analytics Control Board</h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-gray-500">Live platform visitor demographics, conversion records, and execution telemetry.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Preset Filters */}
          <div className="flex p-1 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5">
            {(['today', '7days', '30days', 'custom'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  filter === opt 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt === '7days' ? '7 Days' : opt === '30days' ? '30 Days' : opt}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {filter === 'custom' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-black/40 p-2 rounded-xl border border-slate-200 dark:border-white/5"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white border-0 focus:ring-0 w-28 text-center" 
              />
              <span>to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white border-0 focus:ring-0 w-28 text-center" 
              />
            </motion.div>
          )}

          {/* Export Dropdown */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
          </div>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-600/20 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {lastUpdated && (
            <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">
              Updated: {lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Page Views" 
          value={stats.totalVisitors.toLocaleString()} 
          icon={Eye} 
          change={stats.viewsChange || "+0%"} 
          isPositive={!(stats.viewsChange || '').startsWith('-')} 
          subtitle="runs in selected period"
        />
        <StatCard 
          title="Unique Visitors" 
          value={stats.totalUsers.toLocaleString()} 
          icon={Users} 
          change={stats.visitorsChange || "+0%"} 
          isPositive={!(stats.visitorsChange || '').startsWith('-')} 
          subtitle="vs. previous period"
        />
        <StatCard 
          title="Avg. Visit Duration" 
          value={stats.avgVisitDuration} 
          icon={Clock} 
          change="+12s" 
          isPositive={true} 
          subtitle="average session length"
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${stats.conversionRate}%`} 
          icon={TrendingUp} 
          change={stats.usagesChange || "+0%"} 
          isPositive={!(stats.usagesChange || '').startsWith('-')} 
          subtitle="executions / views"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Daily Views area chart */}
        <div className="lg:col-span-8 bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Platform Traffic Telemetry</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mt-1">Tracks raw visitor views compared to active AI tool executions.</p>
          </div>

          <div className="h-72 w-full mt-6">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} style={{ fontWeight: 800 }} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} style={{ fontWeight: 800 }} />
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
                  />
                  <Area type="monotone" name="Page Views" dataKey="views" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" name="Tool Executions" dataKey="runs" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRuns)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-100 dark:bg-white/[0.01] rounded-2xl animate-pulse" />
            )}
          </div>
        </div>

        {/* Devices breakdown pie chart */}
        <div className="lg:col-span-4 bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Device Demographics</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mt-1">Breakdown of platform visits by device client profiles.</p>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="h-44 w-44 relative">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-100 dark:bg-white/[0.01] rounded-full animate-pulse" />
              )}
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalVisitors.toLocaleString()}</span>
                <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">page views</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6 w-full text-center">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Monitor className="w-3.5 h-3.5" /> Desk
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{getDevicePercentage('Desktop')}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> Mob
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{getDevicePercentage('Mobile')}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Tablet className="w-3.5 h-3.5" /> Tab
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{getDevicePercentage('Tablet')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Traffic Sources & Country breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Traffic Channels table */}
        <div className="lg:col-span-6 bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Traffic Referral Channels</h4>
          <div className="space-y-4">
            {stats.trafficSourcesData.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">No traffic referrals recorded</div>
            ) : (
              stats.trafficSourcesData.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] border border-slate-200/60 dark:border-white/5 hover:border-blue-500/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      {idx === 0 && <Globe className="w-4 h-4" />}
                      {idx === 1 && <Compass className="w-4 h-4" />}
                      {idx > 1 && <Share2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">{source.name}</h5>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">{source.value.toLocaleString()}</span>
                    <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 mt-0.5 block">{source.percentage} share</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Traffic Acquisition horizontal bar chart */}
        <div className="lg:col-span-6 bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Acquisition Distribution</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mt-1">Comparison of absolute session counts for key traffic channels.</p>
          </div>

          <div className="h-72 w-full mt-6">
            {mounted && stats.trafficSourcesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.trafficSourcesData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} style={{ fontWeight: 800 }} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} style={{ fontWeight: 800 }} width={80} />
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
                  />
                  <Bar dataKey="value" name="Sessions" fill="#2563eb" radius={[0, 8, 8, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-white/[0.01] rounded-2xl">
                <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">No acquisition data</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Geolocation map/table breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Country distribution */}
        <div className="lg:col-span-6 bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Country Demographics</h4>
          <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mb-6">Breakdown of platform visits geolocated by request client IP.</p>
          <div className="space-y-4">
            {stats.topCountries.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">No country telemetry logged</div>
            ) : (
              stats.topCountries.map((country, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] border border-slate-200/60 dark:border-white/5 hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {country.name === 'India' ? '🇮🇳' : 
                       country.name === 'United States' ? '🇺🇸' : 
                       country.name === 'United Kingdom' ? '🇬🇧' : 
                       country.name === 'Canada' ? '🇨🇦' : 
                       country.name === 'Germany' ? '🇩🇪' : 
                       country.name === 'France' ? '🇫🇷' : 
                       country.name === 'Australia' ? '🇦🇺' : 
                       country.name === 'Brazil' ? '🇧🇷' : 
                       country.name === 'Japan' ? '🇯🇵' : 
                       country.name === 'South Africa' ? '🇿🇦' : '🌐'}
                    </span>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">{country.name}</h5>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">{country.value.toLocaleString()} sessions</span>
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{country.percentage} traffic share</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categories, Search Queries & Blog Views list */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 mb-4">Popular Categories</h4>
            <div className="flex flex-wrap gap-2">
              {stats.popularCategories.length === 0 ? (
                <span className="text-xs font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest py-2">No category views recorded</span>
              ) : (
                stats.popularCategories.map((cat, idx) => (
                  <span key={idx} className="bg-slate-50 dark:bg-white/5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:text-blue-600 transition-all">
                    📁 {cat.name} ({cat.value})
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 mb-4">Popular Search Queries</h4>
            <div className="flex flex-wrap gap-2">
              {stats.searchQueries.length === 0 ? (
                <span className="text-xs font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest py-2">No search queries recorded</span>
              ) : (
                stats.searchQueries.map((query, idx) => (
                  <span key={idx} className="bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5">
                    🔍 {query.query} ({query.count})
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity feed */}
      <div className="bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Live Visitor Action Feed</h4>
        <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mb-6">Real-time updates showing operations, calculations, downloads, and navigation events.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-transparent border-b border-slate-200 dark:border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                <th className="pb-4 pl-4">Task / Action</th>
                <th className="pb-4">Target Tool</th>
                <th className="pb-4">User Alias</th>
                <th className="pb-4">Execution Status</th>
                <th className="pb-4 pr-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {stats.recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">No client activity recorded yet</td>
                </tr>
              ) : (
                stats.recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 pl-4 font-bold text-slate-900 dark:text-white">{log.action}</td>
                    <td className="py-4 text-slate-600 dark:text-gray-400 font-medium">{log.tool}</td>
                    <td className="py-4 font-mono text-slate-500 dark:text-gray-500">{log.user}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping" />
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right text-slate-400 dark:text-gray-500 font-bold">{log.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

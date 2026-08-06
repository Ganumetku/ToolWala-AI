"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, Eye, Activity, Cpu, 
  ArrowUpRight, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '@/components/admin/StatCard';
import ChartOverview from '@/components/admin/ChartOverview';
import CountryPieChart from '@/components/admin/CountryPieChart';
import TopToolsRanking from '@/components/admin/TopToolsRanking';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';
import versionInfo from '@/data/version.json';

interface DashboardStats {
  totalUsers: number;
  totalVisitors: number;
  totalUsage: number;
  activeSessions: number;
  visitorsChange?: string;
  usagesChange?: string;
  activeChange?: string;
  popularTools: Array<{ id?: string; name: string; count?: number; views?: number; category?: string; growth?: string }>;
  recentLogs: Array<{ id: string; action: string; tool: string; user: string; status: string; time: string }>;
  dailyUsageData?: Array<{ name: string; visitors: number; usage: number }>;
  topCountries?: Array<{ name: string; value: number; percentage?: string }>;
}

const initialStats: DashboardStats = {
  totalUsers: 0,
  totalVisitors: 0,
  totalUsage: 0,
  activeSessions: 0,
  popularTools: [],
  recentLogs: [],
  dailyUsageData: []
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchStats = async (isManual = false) => {
    try {
      const res = await adminFetch('/api/analytics/dashboard?filter=7days');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastUpdated(new Date().toLocaleTimeString());
        if (isManual) {
          toast.success('Live database analytics sync complete.');
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard statistics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh telemetry every 30 seconds for live active user tracking
    const interval = setInterval(() => fetchStats(false), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-white/[0.01] border border-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-white/[0.01] border border-white/5 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Introduction Notification banner */}
      <div className="bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 p-6 rounded-3xl flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Welcome back to ToolWala Control Center</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 font-medium">Production analytics tracking is active. Real-time visitor logs are synchronizing with Supabase.</p>
            
            {/* Version Check Badge */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 text-[9px] font-sans font-semibold uppercase tracking-wider">
              <span className="text-slate-600 dark:text-gray-400 flex items-center gap-1 bg-white dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5 shadow-xs">
                Version: <span className="text-blue-600 dark:text-blue-400 font-mono">v{versionInfo.version}</span>
              </span>
              <span className="text-slate-600 dark:text-gray-400 flex items-center gap-1 bg-white dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5 shadow-xs">
                Commit: <span className="text-purple-600 dark:text-purple-400 font-mono">{versionInfo.commit}</span>
              </span>
              <span className="text-slate-600 dark:text-gray-400 flex items-center gap-1 bg-white dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5 shadow-xs">
                Deployed: <span className="text-emerald-600 dark:text-emerald-400 font-mono">{new Date(versionInfo.deployedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={() => fetchStats(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/30 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-sm shadow-blue-500/20"
          >
            <ShieldCheck className="w-4 h-4" /> Sync Analytics
          </button>
          {lastUpdated && (
            <span className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">
              Updated: {lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={Users} 
          change={stats.visitorsChange || "+0%"} 
          isPositive={!(stats.visitorsChange || '').startsWith('-')} 
          subtitle="vs. previous period"
          delay={0.05}
        />
        <StatCard 
          title="Total Visitors" 
          value={stats.totalVisitors.toLocaleString()} 
          icon={Eye} 
          change={stats.visitorsChange || "+0%"} 
          isPositive={!(stats.visitorsChange || '').startsWith('-')} 
          subtitle="vs. previous period"
          delay={0.1}
        />
        <StatCard 
          title="Tool Usage" 
          value={stats.totalUsage.toLocaleString()} 
          icon={Activity} 
          change={stats.usagesChange || "+0%"} 
          isPositive={!(stats.usagesChange || '').startsWith('-')} 
          subtitle="vs. previous period"
          delay={0.15}
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeSessions.toString()} 
          icon={Cpu} 
          change={stats.activeChange || "+0%"} 
          isPositive={!(stats.activeChange || '').startsWith('-')} 
          subtitle="active in last 5m"
          delay={0.2}
        />
      </div>

      {/* Charts & Country Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Area Chart: Traffic & Usage */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <ChartOverview data={stats.dailyUsageData} />
        </div>

        {/* Pie Chart: Country Traffic Distribution */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <CountryPieChart data={stats.topCountries} />
        </div>

      </div>

      {/* Top Performing Tools Leaderboard & Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Ranked Top Tools Leaderboard */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <TopToolsRanking tools={stats.popularTools} />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 bg-white dark:bg-white/[0.01] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 mb-6">Quick Control Actions</h4>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/blog" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-600/10 hover:text-blue-600 transition-all text-center shadow-xs">
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300">Write Post</span>
              </Link>
              <Link href="/admin/content" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-600/10 hover:text-blue-600 transition-all text-center shadow-xs">
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300">Add Tool</span>
              </Link>
              <Link href="/admin/leads" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-600/10 hover:text-blue-600 transition-all text-center shadow-xs">
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300">CRM Leads</span>
              </Link>
              <Link href="/admin/users" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-600/10 hover:text-blue-600 transition-all text-center shadow-xs">
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300">Manage Users</span>
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
              ToolWala AI Analytics v2.0
            </span>
          </div>
        </div>

      </div>

      {/* Recent Activity Logs */}
      <div className="bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400">Real-time Platform Logs</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mt-1">Live updates showing client-side executions and telemetry actions.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 bg-slate-50/50 dark:bg-transparent">
                <th className="py-3 pl-4">Task / Action</th>
                <th className="py-3">Target Tool</th>
                <th className="py-3">User Alias</th>
                <th className="py-3">Execution Status</th>
                <th className="py-3 pr-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {stats.recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 pl-4 font-bold text-slate-900 dark:text-white">{log.action}</td>
                  <td className="py-4 text-slate-600 dark:text-gray-400 font-medium">{log.tool}</td>
                  <td className="py-4 font-mono text-slate-500 dark:text-gray-500">{log.user}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-semibold uppercase tracking-wider ${
                      log.status === 'success'
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/10'
                        : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/10'
                    }`}>
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                      )}
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right text-slate-400 dark:text-gray-500 font-bold">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

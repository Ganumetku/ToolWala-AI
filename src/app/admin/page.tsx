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
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

interface DashboardStats {
  totalUsers: number;
  totalVisitors: number;
  totalUsage: number;
  activeSessions: number;
  visitorsChange?: string;
  usagesChange?: string;
  activeChange?: string;
  popularTools: Array<{ name: string; count: number; category: string; growth: string }>;
  recentLogs: Array<{ id: string; action: string; tool: string; user: string; status: string; time: string }>;
  dailyUsageData?: Array<{ name: string; visitors: number; usage: number }>;
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
      <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Welcome back to ToolWala Control Center</h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">Production analytics tracking is active. Real-time visitor logs are synchronizing with Supabase.</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={() => fetchStats(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" /> Sync Analytics
          </button>
          {lastUpdated && (
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
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

      {/* Charts & Popular Tools Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Main Chart */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <ChartOverview data={stats.dailyUsageData} />
        </div>

        {/* Right Sidebar: Quick Actions & Popular Tools */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] shadow-xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/blog" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 hover:text-white transition-all text-center">
                <span className="text-xs font-bold text-gray-300">Write Post</span>
              </Link>
              <Link href="/admin/content" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 hover:text-white transition-all text-center">
                <span className="text-xs font-bold text-gray-300">Add Tool</span>
              </Link>
              <Link href="/admin/leads" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 hover:text-white transition-all text-center">
                <span className="text-xs font-bold text-gray-300">CRM Leads</span>
              </Link>
              <Link href="/admin/users" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 hover:text-white transition-all text-center">
                <span className="text-xs font-bold text-gray-300">Manage Users</span>
              </Link>
            </div>
          </div>

          {/* Popular Tools */}
          <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] shadow-xl flex-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 font-sans">Popular Utility Engines</h4>
            <div className="space-y-3">
              {stats.popularTools.map((tool, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-blue-500/10 transition-colors">
                  <div>
                    <h5 className="text-xs font-bold text-white">{tool.name}</h5>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mt-0.5 block">{tool.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">{tool.count.toLocaleString()}</span>
                    <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-0.5 mt-0.5 justify-end">
                      <ArrowUpRight className="w-3 h-3" /> {tool.growth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Recent Activity Logs */}
      <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Real-time Platform Logs</h4>
            <p className="text-xs font-medium text-gray-500 mt-1">Live updates showing client-side executions and telemetry actions.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="pb-4 pl-4">Task / Action</th>
                <th className="pb-4">Target Tool</th>
                <th className="pb-4">User Alias</th>
                <th className="pb-4">Execution Status</th>
                <th className="pb-4 pr-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {stats.recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 pl-4 font-bold text-white">{log.action}</td>
                  <td className="py-4 text-gray-400 font-medium">{log.tool}</td>
                  <td className="py-4 font-mono text-gray-500">{log.user}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-semibold uppercase tracking-wider ${
                      log.status === 'success'
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10'
                        : 'text-red-400 bg-red-500/10 border border-red-500/10'
                    }`}>
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      )}
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right text-gray-500 font-bold">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

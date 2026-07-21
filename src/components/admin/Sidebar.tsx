"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, Mail, BarChart3, Users, 
  Cpu, Layers, BookOpen, LogOut, ChevronLeft, ChevronRight, Terminal, Settings, ListChecks, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Tools Registry', href: '/admin/tools', icon: ListChecks },
  { name: 'Contact Leads', href: '/admin/leads', icon: Mail },
  { name: 'Tool Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'AI Usage', href: '/admin/ai-monitoring', icon: Cpu },
  { name: 'Tools CMS', href: '/admin/content', icon: Layers },
  { name: 'Blog CMS', href: '/admin/blog', icon: BookOpen },
  { name: 'Languages', href: '/admin/languages', icon: Globe },
  { name: 'Global Settings', href: '/admin/settings', icon: Settings },
];


export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen z-30 border-r border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-gray-950/80 backdrop-blur-xl transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo Header */}
      <div className="h-20 border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between px-6">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden select-none">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Terminal className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase"
            >
              ToolWala <span className="text-blue-600 dark:text-blue-500">Admin</span>
            </motion.span>
          )}
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all relative group ${
                isActive 
                  ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-blue-600/10 border border-blue-200/80 dark:border-blue-500/20 font-bold shadow-sm' 
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-600 dark:bg-blue-500 rounded-r"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile/Controls */}
      <div className="p-4 border-t border-slate-200/80 dark:border-white/5 space-y-4">
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex w-full items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-slate-50/80 dark:bg-white/[0.01] hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : (
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <ChevronLeft className="w-4 h-4" /> Minimize
            </div>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-white bg-red-50/50 hover:bg-red-100/80 dark:hover:bg-red-500/10 border border-red-200/60 dark:border-transparent hover:border-red-300 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-bold">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

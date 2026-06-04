"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, Mail, BarChart3, Users, 
  Cpu, Layers, BookOpen, LogOut, ChevronLeft, ChevronRight, Terminal, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Contact Leads', href: '/admin/leads', icon: Mail },
  { name: 'Tool Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'AI Usage', href: '/admin/ai-monitoring', icon: Cpu },
  { name: 'Tools CMS', href: '/admin/content', icon: Layers },
  { name: 'Blog CMS', href: '/admin/blog', icon: BookOpen },
  { name: 'Global Settings', href: '/admin/settings', icon: Settings },
];


export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear admin auth token
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen z-30 border-r border-white/5 bg-gray-950/80 backdrop-blur-xl transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo Header */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-6">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden select-none">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Terminal className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-base font-black tracking-tight text-white uppercase"
            >
              ToolGPT <span className="text-blue-500">Admin</span>
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
                  ? 'text-white bg-blue-600/10 border border-blue-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-white'}`} />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile/Controls */}
      <div className="p-4 border-t border-white/5 space-y-4">
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex w-full items-center justify-center gap-2 p-2.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/5 text-gray-400 hover:text-white transition-all"
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
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-bold">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

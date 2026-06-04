"use client";

import { Bell, Search, Menu, X, ShieldAlert, Sparkles, UserPlus, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  isCollapsed: boolean;
}

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'alert' | 'success' | 'info';
  unread: boolean;
}

export default function Header({ sidebarOpen, setSidebarOpen, isCollapsed }: HeaderProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Database connection alert',
      desc: 'Local schema compiled successfully. Running on simulated database.',
      time: 'Just now',
      type: 'info',
      unread: true
    },
    {
      id: '2',
      title: 'High API Usage Warning',
      desc: 'OCR engine usage has peaked at 120req/min.',
      time: '12 mins ago',
      type: 'alert',
      unread: true
    },
    {
      id: '3',
      title: 'New Guest Signups',
      desc: '50+ new guests generated items in the last hour.',
      time: '2 hours ago',
      type: 'success',
      unread: false
    }
  ]);

  const getPageTitle = () => {
    const segment = pathname.split('/').pop();
    if (!segment || segment === 'admin') return 'Overview';
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="fixed top-0 right-0 left-0 z-20 h-20 border-b border-white/5 bg-gray-950/40 backdrop-blur-xl transition-all duration-300 admin-header">
      <div className="flex h-full items-center justify-between px-6 sm:px-10">
        
        {/* Left: Mobile Menu & Page Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex p-2.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">{getPageTitle()}</h2>
          </div>
        </div>

        {/* Right: Search, Notifications & Profile */}
        <div className="flex items-center gap-6">
          
          {/* Search bar */}
          <div className="hidden sm:flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 w-64 focus-within:border-blue-500/50 transition-all">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search..."
              className="bg-transparent text-sm border-none outline-none text-white w-full placeholder-gray-600 font-semibold"
            />
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/5 text-gray-400 hover:text-white transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-gray-950 animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  {/* Click outside overlay */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 glass border border-white/10 rounded-2xl shadow-2xl p-4 overflow-hidden z-20"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {notifications.map((item) => (
                        <div 
                          key={item.id} 
                          className={`p-3 rounded-xl border border-white/5 flex gap-3.5 transition-all ${
                            item.unread ? 'bg-white/[0.02]' : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {item.type === 'alert' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                            {item.type === 'success' && <UserPlus className="w-4 h-4 text-emerald-500" />}
                            {item.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white">{item.title}</p>
                            <p className="text-[11px] font-semibold text-gray-500 leading-normal mt-0.5">{item.desc}</p>
                            <span className="text-[9px] text-gray-600 font-bold block mt-1">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User profile dropdown trigger */}
          <div className="flex items-center gap-3 pl-2 border-l border-white/5">
            <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500 text-xs font-black">
              AD
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-black text-white">Admin Console</p>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Active Admin</p>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

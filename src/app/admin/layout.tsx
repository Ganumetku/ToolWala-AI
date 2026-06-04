"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Toaster } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simple, robust client-side session checker
  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
    } else {
      setIsLoading(false);
    }
  }, [pathname, router]);

  // If the path is login, bypass layout shell entirely
  if (pathname === '/admin/login') {
    return (
      <div className="bg-[#030712] min-h-screen text-white select-none">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#030712] text-white flex"
      style={{ '--sidebar-width': isCollapsed ? '80px' : '256px' } as React.CSSProperties}
    >
      {/* Sidebar Navigation */}
      <div className={`hidden md:block transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 bottom-0 left-0 z-30 transition-transform duration-300 md:hidden w-64 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar isCollapsed={false} setIsCollapsed={() => {}} />
      </div>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          isCollapsed={isCollapsed}
        />
        
        {/* Page Inner Content Container */}
        <main className="flex-grow p-6 sm:p-10 transition-all duration-300 admin-main-content">
          {children}
        </main>
      </div>

      {/* sonner toast framework */}
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

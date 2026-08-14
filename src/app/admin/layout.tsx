"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Toaster } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] text-slate-900 dark:text-white flex"
      style={{ '--sidebar-width': isCollapsed ? '80px' : '256px' } as React.CSSProperties}
    >
      <div className={`hidden md:block transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-20 md:hidden backdrop-blur-sm"
        />
      )}

      <div className={`fixed top-0 bottom-0 left-0 z-30 transition-transform duration-300 md:hidden w-64 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar isCollapsed={false} setIsCollapsed={() => {}} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isCollapsed={isCollapsed}
        />

        <main className="flex-grow p-4 sm:p-8 pt-24 sm:pt-28 transition-all duration-300 admin-main-content">
          {children}
        </main>
      </div>

      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}

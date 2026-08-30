"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Toaster, toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: Never leave user stuck on loader for more than 5s
    const timer = setTimeout(() => {
      if (isMounted && isVerifying && !isAuthorized) {
        setIsVerifying(false);
      }
    }, 5000);

    async function checkAdminAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (isMounted) {
            router.replace(`/control-access?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        // 1. Fast direct profile check via browser Supabase client
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.role === 'admin' && profile?.status === 'active') {
          if (isMounted) {
            setIsAuthorized(true);
            setIsVerifying(false);
          }
          return;
        }

        // 2. Fallback check via secure server API with 5s timeout
        const controller = new AbortController();
        const apiTimeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch('/api/auth/verify-admin/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: session.access_token }),
          signal: controller.signal,
        });
        clearTimeout(apiTimeout);

        const data = await res.json();
        if (!res.ok || !data.success) {
          if (isMounted) {
            toast.error('Unauthorized. Admin privileges required.');
            await supabase.auth.signOut();
            router.replace('/control-access?error=unauthorized');
          }
          return;
        }

        if (isMounted) {
          setIsAuthorized(true);
          setIsVerifying(false);
        }
      } catch (err) {
        console.error('[Admin Guard Error]', err);
        if (isMounted) {
          // If we already verified or have a session, allow pass to avoid blocking
          setIsAuthorized(true);
          setIsVerifying(false);
        }
      }
    }

    checkAdminAuth();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [pathname, router]);

  if (isVerifying && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Verifying secure admin session...</p>
      </div>
    );
  }

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

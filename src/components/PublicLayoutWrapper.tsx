"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { trackPageView } = useAnalytics();
  const isAdmin = pathname?.startsWith('/admin');
  const isLogin = pathname === '/login' || pathname === '/login/';

  useEffect(() => {
    if (pathname && !pathname.startsWith('/admin')) {
      let source = 'Direct';
      if (typeof document !== 'undefined' && document.referrer) {
        try {
          const referrerHost = new URL(document.referrer).hostname;
          if (referrerHost && !referrerHost.includes(window.location.hostname)) {
            source = referrerHost;
          }
        } catch (_) {}
      }
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const utmSource = searchParams.get('utm_source');
        if (utmSource) source = utmSource;
      }

      trackPageView(pathname, source);
    }
  }, [pathname, trackPageView]);

  if (isAdmin || isLogin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

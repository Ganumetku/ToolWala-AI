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
  const { trackPageView, trackEvent } = useAnalytics();
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

      // 1. Track page view
      trackPageView(pathname, source);

      // 2. Automate tool_used event tracking
      if (pathname.startsWith('/tools/') && pathname !== '/tools' && pathname !== '/tools/') {
        const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
        const parts = cleanPath.split('/');
        const toolSlug = parts[parts.length - 1];
        if (toolSlug) {
          trackEvent('tool_used', {
            toolSlug,
            path: pathname
          });
        }
      }

      // 3. Automate blog_opened event tracking
      if (pathname.startsWith('/blog/') && pathname !== '/blog' && pathname !== '/blog/') {
        const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
        const parts = cleanPath.split('/');
        const blogSlug = parts[parts.length - 1];
        if (blogSlug) {
          trackEvent('blog_opened', {
            blogSlug,
            path: pathname
          });
        }
      }

      // 4. Automate category_opened event tracking
      if (pathname.startsWith('/categories/') && pathname !== '/categories' && pathname !== '/categories/') {
        const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
        const parts = cleanPath.split('/');
        const categorySlug = parts[parts.length - 1];
        if (categorySlug) {
          trackEvent('category_opened', {
            categorySlug,
            path: pathname
          });
        }
      }

      // 5. Automate search_used event tracking
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const searchQuery = searchParams.get('search') || searchParams.get('q');
        if (searchQuery) {
          trackEvent('search_used', {
            query: searchQuery,
            path: pathname
          });
        }
      }
    }
  }, [pathname, trackPageView, trackEvent]);

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

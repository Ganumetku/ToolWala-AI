'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import * as gtag from '@/lib/gtag';

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!gtag.GA_MEASUREMENT_ID) return;
    // Do not track admin portal views in public Google Analytics
    if (!pathname || pathname.startsWith('/admin')) return;

    // Build full path including search parameters if present
    const queryString = searchParams?.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    // Strict deduplication: prevent double dispatches within the same navigation cycle
    if (lastTrackedUrlRef.current === url) {
      return;
    }
    lastTrackedUrlRef.current = url;

    // Send single pageview to Google Analytics
    gtag.pageview(url);
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  const gaId = gtag.GA_MEASUREMENT_ID;

  if (!gaId) {
    return null;
  }

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics - Loaded afterInteractive for fast, non-blocking telemetry */}
      <Script
        id="gtag-base"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            send_page_view: false
          });
        `}
      </Script>
      {/* Wrap router tracking in Suspense since it uses searchParams */}
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}

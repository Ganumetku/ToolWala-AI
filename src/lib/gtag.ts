export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Checks if debug mode should be enabled (for GA4 DebugView).
 * Active in development or when ?debug_mode=true or ?ga_debug=true is present.
 */
function isDebugMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const search = window.location.search;
    return (
      search.includes('debug_mode=true') ||
      search.includes('ga_debug=true') ||
      process.env.NODE_ENV === 'development'
    );
  } catch {
    return false;
  }
}

/**
 * Ensures window.dataLayer and window.gtag exist so commands can be
 * safely queued into dataLayer even before the external gtag.js finishes loading.
 */
function ensureGtag(): boolean {
  if (typeof window === 'undefined') return false;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () {
      window.dataLayer!.push(arguments);
    };
  }
  return true;
}

/**
 * Dispatches an explicit GA4 page_view event.
 * https://developers.google.com/analytics/devguides/collection/gtagjs/pages
 */
export const pageview = (url: string, title?: string) => {
  if (!GA_MEASUREMENT_ID || !ensureGtag()) return;

  const pageTitle = title || (typeof document !== 'undefined' ? document.title : '');
  const pageLocation = typeof window !== 'undefined' ? window.location.href : url;

  const params: Record<string, unknown> = {
    page_path: url,
    page_location: pageLocation,
    page_title: pageTitle,
    send_to: GA_MEASUREMENT_ID,
  };

  if (isDebugMode()) {
    params.debug_mode = true;
  }

  window.gtag!('event', 'page_view', params);
};

/**
 * Dispatches custom events to Google Analytics 4.
 * https://developers.google.com/analytics/devguides/collection/gtagjs/events
 */
export const event = (
  action: string,
  params: {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: unknown;
  } = {}
) => {
  if (!ensureGtag()) return;

  const eventPayload: Record<string, unknown> = {
    ...params,
  };

  if (isDebugMode()) {
    eventPayload.debug_mode = true;
  }

  window.gtag!('event', action, eventPayload);
};

// Global type declaration for window.gtag and window.dataLayer
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent',
      targetIdOrAction: string,
      configOrParams?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

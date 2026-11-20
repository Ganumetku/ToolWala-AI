"use client";

import { useCallback } from 'react';
import * as gtag from '@/lib/gtag';

const VISITOR_KEY = 'toolwala_visitor_id';
const SESSION_KEY = 'toolwala_session_id';
const LAST_ACTIVITY_KEY = 'toolwala_last_activity';
const SESSION_SYNCED_KEY = 'toolwala_session_synced';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout

/**
 * Retrieves or initializes an anonymous, persistent visitor identity.
 * Stored in localStorage. Never expires. Cryptographically random, zero IP tracking, zero fingerprinting.
 */
function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        visitorId = 'usr_' + crypto.randomUUID().replace(/-/g, '').substring(0, 16);
      } else if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const arr = new Uint8Array(8);
        crypto.getRandomValues(arr);
        visitorId = 'usr_' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
      } else {
        visitorId = 'usr_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      }
      localStorage.setItem(VISITOR_KEY, visitorId);
    }
    return visitorId;
  } catch {
    return 'usr_' + Math.random().toString(36).substring(2, 12);
  }
}

/**
 * Retrieves or creates a session identifier.
 * Stored in sessionStorage with a 30-minute inactivity timeout.
 * Reused across page refreshes and multi-tool navigations.
 */
function getOrCreateSessionId(): { sessionId: string; isNewSession: boolean } {
  if (typeof window === 'undefined') return { sessionId: '', isNewSession: false };
  try {
    const now = Date.now();
    const storedSessionId = sessionStorage.getItem(SESSION_KEY);
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    const lastActivityTime = lastActivity ? parseInt(lastActivity, 10) : 0;

    // Check if existing session is still active (within 30 mins)
    if (storedSessionId && (now - lastActivityTime < SESSION_TIMEOUT_MS)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      const isSynced = sessionStorage.getItem(SESSION_SYNCED_KEY) === storedSessionId;
      return { sessionId: storedSessionId, isNewSession: !isSynced };
    }

    // New session (fresh browser window or inactivity expired)
    let newSessionId = '';
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      newSessionId = 'ses_' + crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    } else {
      newSessionId = 'ses_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    }

    sessionStorage.setItem(SESSION_KEY, newSessionId);
    sessionStorage.removeItem(SESSION_SYNCED_KEY);
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    return { sessionId: newSessionId, isNewSession: true };
  } catch {
    const fallbackId = 'ses_' + Math.random().toString(36).substring(2, 12);
    return { sessionId: fallbackId, isNewSession: true };
  }
}

export function useAnalytics() {
  const getVisitorId = useCallback((): string => {
    return getOrCreateVisitorId();
  }, []);

  const getSessionId = useCallback((): string => {
    return getOrCreateSessionId().sessionId;
  }, []);

  // Base telemetry dispatch helper
  const trackRaw = useCallback(async (payload: {
    type: 'visitor' | 'tool_run' | 'event';
    eventName?: string;
    toolId?: string;
    toolName?: string;
    route?: string;
    referrer?: string;
    metadata?: Record<string, any>;
    source?: string;
  }) => {
    try {
      const { sessionId, isNewSession } = getOrCreateSessionId();
      const visitorId = getOrCreateVisitorId();
      if (!sessionId) return;

      const response = await fetch('/api/analytics/track/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          visitorId,
          sessionId,
          isNewSession,
          isWebDriver: typeof navigator !== 'undefined' ? Boolean((navigator as any).webdriver) : false,
        }),
      });

      if (response.ok) {
        // Mark session as synced in Supabase so subsequent route views avoid duplicate upserts
        if (typeof window !== 'undefined' && isNewSession) {
          sessionStorage.setItem(SESSION_SYNCED_KEY, sessionId);
        }
      } else {
        console.warn('Telemetry request status code was not 200:', response.status);
      }
    } catch (err) {
      console.warn('Analytics tracking call failed:', err);
    }
  }, []);

  // 2. Track Visitor Page View
  const trackPageView = useCallback(async (path: string, source?: string) => {
    // Send to Supabase (first-party database visitor tracking)
    await trackRaw({
      type: 'visitor',
      route: path,
      source: source || 'Direct',
      referrer: typeof document !== 'undefined' ? document.referrer : undefined
    });

    // NOTE: GA4 page_view is dispatched centrally by AnalyticsTracker in GoogleAnalytics component.
  }, [trackRaw]);

  // 3. Track Tool Run execution (mapped to tool_used event)
  const trackToolRun = useCallback(async (toolSlug: string, metadata?: Record<string, any>) => {
    await trackRaw({
      type: 'tool_run',
      toolId: toolSlug,
      metadata: metadata || {}
    });

    gtag.event('tool_used', {
      event_category: 'Tools',
      event_label: toolSlug,
      ...metadata
    });
  }, [trackRaw]);

  // 4. Track Calculator execution
  const trackCalculatorUsed = useCallback(async (toolName: string, inputs?: Record<string, any>) => {
    await trackRaw({
      type: 'event',
      eventName: 'calculator_used',
      toolName,
      metadata: inputs || {}
    });

    gtag.event('calculator_used', {
      event_category: 'Calculator',
      event_label: toolName,
      ...inputs
    });
  }, [trackRaw]);

  // 5. Track Image Upload
  const trackImageUploaded = useCallback(async (toolName: string, fileDetails?: Record<string, any>) => {
    await trackRaw({
      type: 'event',
      eventName: 'image_uploaded',
      toolName,
      metadata: fileDetails || {}
    });

    gtag.event('image_uploaded', {
      event_category: 'Upload',
      event_label: toolName,
      ...fileDetails
    });
  }, [trackRaw]);

  // 6. Track PDF Processing
  const trackPdfProcessed = useCallback(async (toolName: string, pdfDetails?: Record<string, any>) => {
    await trackRaw({
      type: 'event',
      eventName: 'pdf_processed',
      toolName,
      metadata: pdfDetails || {}
    });

    gtag.event('pdf_processed', {
      event_category: 'PDF',
      event_label: toolName,
      ...pdfDetails
    });
  }, [trackRaw]);

  // 7. Track AI Generation
  const trackAiGenerated = useCallback(async (toolName: string, details?: Record<string, any>) => {
    await trackRaw({
      type: 'event',
      eventName: 'ai_generated',
      toolName,
      metadata: details || {}
    });

    gtag.event('ai_generated', {
      event_category: 'AI',
      event_label: toolName,
      ...details
    });
  }, [trackRaw]);

  // 8. Track file downloaded
  const trackFileDownloaded = useCallback(async (toolName: string, fileDetails?: Record<string, any>) => {
    await trackRaw({
      type: 'event',
      eventName: 'file_downloaded',
      toolName,
      metadata: fileDetails || {}
    });

    gtag.event('file_downloaded', {
      event_category: 'Download',
      event_label: toolName,
      ...fileDetails
    });
  }, [trackRaw]);

  // 9. Track generic button clicked
  const trackButtonClicked = useCallback(async (buttonId: string, details?: Record<string, any>) => {
    await trackRaw({
      type: 'event',
      eventName: 'button_clicked',
      metadata: { buttonId, ...details }
    });

    gtag.event('button_clicked', {
      event_category: 'Interaction',
      event_label: buttonId,
      ...details
    });
  }, [trackRaw]);

  // 10. Track Custom Event
  const trackEvent = useCallback(async (eventName: string, data?: Record<string, any>) => {
    const route = data?.path || (typeof window !== 'undefined' ? window.location.pathname : undefined);
    
    await trackRaw({
      type: 'event',
      eventName,
      toolName: data?.tool || data?.toolName,
      route,
      metadata: data || {}
    });

    gtag.event(eventName, {
      event_category: 'Custom',
      event_label: route,
      ...data
    });
  }, [trackRaw]);

  return {
    trackPageView,
    trackToolRun,
    trackCalculatorUsed,
    trackImageUploaded,
    trackPdfProcessed,
    trackAiGenerated,
    trackFileDownloaded,
    trackButtonClicked,
    trackEvent,
    getSessionId,
    getVisitorId
  };
}

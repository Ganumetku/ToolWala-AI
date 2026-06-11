"use client";

import { useCallback } from 'react';
import * as gtag from '@/lib/gtag';

const SESSION_KEY = 'toolwala_session_id';

export function useAnalytics() {
  // 1. Generate or retrieve session identifier
  const getSessionId = useCallback((): string => {
    if (typeof window === 'undefined') return '';
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }, []);

  // Base track helper
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
      const sessionId = getSessionId();
      if (!sessionId) return;

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          sessionId,
        }),
      });

      if (!response.ok) {
        console.warn('Telemetry request status code was not 200:', response.status);
      }
    } catch (err) {
      console.warn('Analytics tracking call failed:', err);
    }
  }, [getSessionId]);

  // 2. Track Visitor Page View
  const trackPageView = useCallback(async (path: string, source?: string) => {
    // Send to Supabase
    await trackRaw({
      type: 'visitor',
      route: path,
      source: source || 'Direct',
      referrer: typeof document !== 'undefined' ? document.referrer : undefined
    });

    // Send to Google Analytics
    gtag.pageview(path);
  }, [trackRaw]);

  // 3. Track Tool Run execution (mapped to tool_used event)
  const trackToolRun = useCallback(async (toolSlug: string, metadata?: Record<string, any>) => {
    // Send to Supabase
    await trackRaw({
      type: 'tool_run',
      toolId: toolSlug,
      metadata: metadata || {}
    });

    // Send to Google Analytics
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
    getSessionId
  };
}

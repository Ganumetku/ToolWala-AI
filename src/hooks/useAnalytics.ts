"use client";

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

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

  // 2. Track Visitor Page View
  const trackPageView = useCallback(async (path: string, source?: string) => {
    try {
      const sessionId = getSessionId();
      if (!sessionId) return;

      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'visitor',
          sessionId,
          path,
          source: source || 'Direct'
        })
      });
    } catch (err) {
      console.warn('Analytics page view tracking failed:', err);
    }
  }, [getSessionId]);

  // 3. Track Tool Run execution
  const trackToolRun = useCallback(async (toolId: string) => {
    try {
      const sessionId = getSessionId();
      if (!sessionId) return;

      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tool_run',
          sessionId,
          toolId
        })
      });
    } catch (err) {
      console.warn('Analytics tool execution tracking failed:', err);
    }
  }, [getSessionId]);

  // 4. Track Custom Event
  const trackEvent = useCallback(async (eventName: string, path?: string) => {
    try {
      const sessionId = getSessionId();
      if (!sessionId) return;

      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event',
          sessionId,
          eventName,
          path: path || window.location.pathname
        })
      });
    } catch (err) {
      console.warn('Analytics event tracking failed:', err);
    }
  }, [getSessionId]);

  return {
    trackPageView,
    trackToolRun,
    trackEvent,
    getSessionId
  };
}

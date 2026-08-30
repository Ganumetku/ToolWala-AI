"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Global programmatic trigger helpers
export function startTopProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tw:start-progress"));
  }
}

export function stopTopProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tw:stop-progress"));
  }
}

function TopProgressBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const trickleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoadingRef = useRef(false);
  const currentUrlRef = useRef("");

  // Instant reset helper to completely clean up any state
  const resetInstantly = () => {
    if (trickleTimerRef.current) {
      clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    finishTimeoutRef.current = null;
    resetTimeoutRef.current = null;
    safetyTimeoutRef.current = null;

    isLoadingRef.current = false;
    setVisible(false);
    setProgress(0);
  };

  const startProgress = () => {
    // Clear any existing timers first so we start 100% fresh from 0
    if (trickleTimerRef.current) {
      clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    isLoadingRef.current = true;
    setProgress(12);
    setVisible(true);

    // Smooth trickle increment
    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (!isLoadingRef.current) return prev;
        if (prev < 40) {
          return prev + Math.floor(Math.random() * 8 + 6);
        } else if (prev < 70) {
          return prev + Math.floor(Math.random() * 5 + 3);
        } else if (prev < 88) {
          return prev + Math.floor(Math.random() * 2 + 1);
        } else if (prev < 95) {
          return prev + 0.5;
        }
        return prev;
      });
    }, 140);

    // Safety fallback: auto-complete if navigation takes too long (>8s)
    safetyTimeoutRef.current = setTimeout(() => {
      if (isLoadingRef.current) {
        completeProgress();
      }
    }, 8000);
  };

  const completeProgress = () => {
    if (trickleTimerRef.current) {
      clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = null;

    isLoadingRef.current = false;
    setProgress(100);

    // Keep visible at 100% for 200ms so user perceives load completion
    finishTimeoutRef.current = setTimeout(() => {
      setVisible(false);

      // Reset to 0% after fade-out transition finishes
      resetTimeoutRef.current = setTimeout(() => {
        setProgress(0);
      }, 250);
    }, 200);
  };

  // Route transition detection
  useEffect(() => {
    const fullUrl = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;

    if (currentUrlRef.current && currentUrlRef.current !== fullUrl) {
      if (isLoadingRef.current) {
        completeProgress();
      } else {
        // If navigating without a prior click (e.g. back button), ensure it stays completely reset
        resetInstantly();
      }
    }

    currentUrlRef.current = fullUrl;
  }, [pathname, searchParams]);

  // Global listeners (mounts only once)
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;

      if (!anchor || !anchor.href) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref) return;

      if (
        rawHref.startsWith("#") ||
        rawHref.startsWith("javascript:") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:")
      ) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (targetUrl.origin !== currentUrl.origin) return;

        // Ignore if clicking the exact same URL
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search &&
          targetUrl.hash === currentUrl.hash
        ) {
          return;
        }

        // Check if going back to directory/home from inside a tool page
        const isCurrentlyInTool = currentUrl.pathname.includes('/tools/') && currentUrl.pathname !== '/tools' && currentUrl.pathname !== '/tools/';
        const isGoingBackToDirectory = targetUrl.pathname === '/tools' || targetUrl.pathname === '/tools/' || targetUrl.pathname === '/' || targetUrl.pathname.endsWith('/tools') || targetUrl.pathname.endsWith('/tools/');

        // If clicking "Back to Directory" or navigating back to /tools from a tool, don't show progress bar
        if (isCurrentlyInTool && isGoingBackToDirectory) {
          resetInstantly();
          return;
        }

        startProgress();
      } catch (_) {}
    };

    // When user hits browser back or forward button, instantly reset without showing progress bar
    const handlePopState = () => {
      resetInstantly();
    };

    const handleCustomStart = () => {
      startProgress();
    };

    const handleCustomStop = () => {
      completeProgress();
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("tw:start-progress", handleCustomStart);
    window.addEventListener("tw:stop-progress", handleCustomStop);

    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("tw:start-progress", handleCustomStart);
      window.removeEventListener("tw:stop-progress", handleCustomStop);
      resetInstantly();
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3.5px] z-[100000] pointer-events-none transition-opacity duration-250 ease-out"
      style={{
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Exact 'Start Free' Button Solid Brand Blue (#2563EB) */}
      <div
        className="h-full relative bg-[#2563EB] shadow-[0_0_14px_rgba(37,99,235,0.85),0_0_4px_rgba(37,99,235,1)]"
        style={{
          width: `${progress}%`,
          transition:
            progress === 100
              ? "width 200ms ease-out"
              : progress === 12
              ? "width 80ms ease-out"
              : "width 180ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        }}
      >
        {/* Soft glowing white flare on the right leading edge */}
        <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/50 to-white shadow-[0_0_10px_2px_#93c5fd] opacity-90" />
      </div>
    </div>
  );
}

export default function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <TopProgressBarContent />
    </Suspense>
  );
}

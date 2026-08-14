'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_DAYS = 7;
const DISMISS_KEY = 'toolwala_pwa_dismissed_until';
const INSTALLED_KEY = 'toolwala_pwa_installed';

function isPromptSuppressed(): boolean {
  if (typeof window === 'undefined') return true;

  // 1. Check if app is already running as standalone PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  if (isStandalone) return true;

  // 2. Check if user already installed the app
  const isInstalled = localStorage.getItem(INSTALLED_KEY) === 'true';
  if (isInstalled) return true;

  // 3. Check if user snoozed/dismissed prompt within last 7 days
  const dismissedUntil = localStorage.getItem(DISMISS_KEY);
  if (dismissedUntil) {
    const expiry = Number(dismissedUntil);
    if (!isNaN(expiry) && Date.now() < expiry) {
      return true;
    }
  }

  // Legacy key check for backward compatibility
  const legacyDismissed = localStorage.getItem('toolwala_pwa_dismissed');
  if (legacyDismissed === 'true' && !dismissedUntil) {
    return true;
  }

  return false;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isPromptSuppressed()) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();

      // Re-verify suppression before showing
      if (isPromptSuppressed()) return;

      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setIsVisible(false);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, 'true');
    } else {
      // User cancelled browser installation dialog -> snooze for 7 days
      snoozePrompt();
    }
    setDeferredPrompt(null);
  };

  const snoozePrompt = () => {
    const expiry = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000; // 7 days in ms
    localStorage.setItem(DISMISS_KEY, expiry.toString());
    setIsVisible(false);
  };

  const handleDismiss = () => {
    snoozePrompt();
  };

  if (!isVisible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl p-4 text-white font-sans">
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 border border-white/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">
                Install ToolWala AI App
              </h4>
              <button 
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Use all 60+ tools offline, faster, and directly from your home screen.
            </p>
            
            <div className="flex items-center gap-2.5 mt-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/30 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

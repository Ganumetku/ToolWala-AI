"use client";

import React, { useState } from 'react';
import { LogoRenderer } from './LogoRenderer';
import { VectorSymbol } from './LogoSymbols';
import { Smartphone, CreditCard, Globe, Sparkles, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface LogoMockupsProps {
  brandName: string;
  slogan?: string;
  primaryColor: string;
  accentColor: string;
  symbolId: string;
}

export function LogoMockups({
  brandName,
  slogan,
  primaryColor,
  accentColor,
  symbolId,
}: LogoMockupsProps) {
  const [activeTab, setActiveTab] = useState<'app' | 'card' | 'web' | 'merch'>('card');
  const safeName = brandName || 'Apex AI';

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${hex}`);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Mockup Switcher Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'card'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Business Card
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('app')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'app'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            App Icon
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('web')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'web'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Website Header
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('merch')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'merch'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Color Palette
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          Live Brand Simulation
        </div>
      </div>

      {/* 1. Luxury Dark Business Card Mockup */}
      {activeTab === 'card' && (
        <div className="relative w-full rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6 sm:p-10 border border-slate-800 shadow-2xl flex items-center justify-center min-h-[300px] overflow-hidden">
          {/* Subtle diagonal texture */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
              backgroundSize: '12px 12px',
            }}
          />

          {/* Elevated Card */}
          <div className="relative w-full max-w-[420px] aspect-[1.75/1] rounded-2xl bg-gradient-to-br from-[#121826] to-[#0A0D14] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
            {/* Foil accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, ${primaryColor}, ${accentColor}, transparent)`,
              }}
            />

            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <VectorSymbol
                  symbolId={symbolId}
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  size={32}
                />
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                  {safeName}
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Official
              </span>
            </div>

            {/* Bottom details */}
            <div className="flex items-end justify-between border-t border-white/5 pt-3">
              <div>
                <p className="text-[11px] font-bold text-white tracking-wide">Alex Morgan</p>
                <p className="text-[9px] text-slate-400 font-medium">Founder & CEO</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 font-mono">contact@{safeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</p>
                <p className="text-[9px] text-slate-500 font-mono">+1 (800) 420-9921</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Mobile App Icon Mockup */}
      {activeTab === 'app' && (
        <div className="relative w-full rounded-2xl bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-10 border border-slate-800 shadow-xl flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-4">
            {/* iOS Squircle Icon */}
            <div
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] sm:rounded-[32px] p-5 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden group cursor-pointer transition-transform hover:scale-105"
              style={{
                background: `linear-gradient(145deg, ${primaryColor}, ${accentColor})`,
              }}
            >
              {/* Glass shine layer */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/30 pointer-events-none" />
              <VectorSymbol
                symbolId={symbolId}
                primaryColor="#ffffff"
                accentColor="#ffffff"
                size={64}
                className="relative z-10 drop-shadow-md"
              />
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm font-bold text-white tracking-tight">{safeName}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">iOS & Android App Icon</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Website Header Mockup */}
      {activeTab === 'web' && (
        <div className="relative w-full rounded-2xl bg-slate-900 p-4 sm:p-6 border border-slate-800 shadow-xl flex flex-col justify-center min-h-[300px]">
          <div className="w-full rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="px-6 py-1 rounded-md bg-white dark:bg-slate-800 text-[10px] text-slate-500 font-mono border border-slate-200 dark:border-white/5">
                https://{safeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com
              </div>
              <div className="w-8" />
            </div>

            {/* Mock navbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <VectorSymbol
                  symbolId={symbolId}
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  size={26}
                />
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  {safeName}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-gray-300">
                <span>Products</span>
                <span>Solutions</span>
                <span>Pricing</span>
              </div>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                Get Started
              </button>
            </div>

            {/* Mock hero snippet */}
            <div className="p-6 sm:p-8 text-center bg-slate-50/50 dark:bg-white/[0.01]">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border"
                    style={{ color: primaryColor, borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}10` }}>
                Welcome to {safeName}
              </span>
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {slogan || 'The Modern Platform Built for Scale'}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* 4. Brand Palette Explorer */}
      {activeTab === 'merch' && (
        <div className="relative w-full rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm min-h-[300px] flex flex-col justify-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Official Brand Colors
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => copyHex(primaryColor)}
              className="p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg shadow-sm border border-black/10 shrink-0"
                  style={{ backgroundColor: primaryColor }}
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Primary Brand Color</p>
                  <p className="text-xs font-mono text-slate-500">{primaryColor.toUpperCase()}</p>
                </div>
              </div>
              <Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>

            <div
              onClick={() => copyHex(accentColor)}
              className="p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg shadow-sm border border-black/10 shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Accent Brand Color</p>
                  <p className="text-xs font-mono text-slate-500">{accentColor.toUpperCase()}</p>
                </div>
              </div>
              <Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-gray-300">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Full RGB/HEX Palette ready for Web, Mobile, and Print standards</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

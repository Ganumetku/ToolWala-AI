"use client";

import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface ToolHeroProps {
  title: string;
  description: string;
  badgeText?: string;
  icon?: React.ReactNode;
}

export default function ToolHero({
  title,
  description,
  badgeText = "100% Client-Side & Secure",
  icon
}: ToolHeroProps) {
  return (
    <div className="p-8 sm:p-10 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row sm:items-start justify-between gap-6">
      <div className="flex items-center gap-6">
        {icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{title}</h1>
          <p className="text-gray-400 font-medium mt-1">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 h-fit self-start">
        <Shield className="w-4 h-4 text-emerald-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{badgeText}</span>
      </div>
    </div>
  );
}

"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, Home, Search, ArrowRight } from 'lucide-react';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';

export default function NotFound() {
  const popularTools = [
    { name: 'PDF Compare', href: '/tools/pdf-compare' },
    { name: 'Merge PDF', href: '/tools/merge-pdf' },
    { name: 'Compress PDF', href: '/tools/compress-pdf' },
    { name: 'Image Compressor', href: '/tools/image-compressor' },
  ];

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center py-16 sm:py-24 px-4 relative overflow-hidden bg-[#F6F8FC] dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Subtle Background Effects */}
      <MeshGradient />
      <FloatingParticles />

      {/* Ambient Radial Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-lg bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] relative z-10 text-center"
      >
        {/* Animated Warning / Status Icon */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400 mb-6 shadow-xs">
          <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
        </div>

        {/* Big 404 Typography */}
        <span className="text-5xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent block mb-2 select-none">
          404
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">
          Page Not Found
        </h1>

        <p className="text-[11px] font-black text-red-500 dark:text-red-400 uppercase tracking-widest mb-4">
          Requested URL is unavailable
        </p>

        <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm font-medium leading-relaxed mb-8 max-w-sm mx-auto">
          The page or AI utility you are trying to access doesn&apos;t exist, has been moved, or is temporarily offline.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
          <Link
            href="/tools/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" /> Tools Directory
          </Link>

          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <Home className="w-4 h-4" /> Home Page
          </Link>
        </div>

        {/* Popular Quick Links */}
        <div className="pt-6 border-t border-slate-100 dark:border-white/5 text-left">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-gray-500 block mb-3 text-center">
            Or try one of our popular utilities:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {popularTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-100/90 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/60 dark:border-white/5 transition-all"
              >
                <span>{tool.name}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

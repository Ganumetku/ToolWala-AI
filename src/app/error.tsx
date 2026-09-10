"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center py-16 sm:py-24 px-4 relative overflow-hidden bg-[#F6F8FC] dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Subtle Background Effects */}
      <MeshGradient />
      <FloatingParticles />

      {/* Ambient Radial Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-red-500/5 dark:bg-red-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-lg bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] relative z-10 text-center"
      >
        {/* Floating Warning Badge */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400 mb-6 shadow-xs">
          <AlertOctagon className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">
          Something went wrong
        </h1>

        <p className="text-[11px] font-black text-red-500 dark:text-red-400 uppercase tracking-widest mb-5">
          Process Execution Failed
        </p>

        <div className="bg-red-50/70 dark:bg-red-500/5 border border-red-100 dark:border-red-500/15 rounded-2xl p-4 mb-8 max-h-32 overflow-y-auto scrollbar-thin text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 block mb-1">
            Error Details:
          </span>
          <p className="text-xs font-mono text-slate-700 dark:text-gray-300 leading-normal break-words">
            {error.message || "Unknown rendering exception."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" /> Try Again
          </button>

          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <Home className="w-4 h-4" /> Home Page
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

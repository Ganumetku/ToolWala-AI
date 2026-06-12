"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Home, Search } from 'lucide-react';
import { toast } from 'sonner';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';

export default function NotFound() {
  useEffect(() => {
    // Show a floating red toast alert on mount
    toast.error("Page Not Found: The requested utility or page could not be located.", {
      description: "Please check the URL or try searching the tools directory.",
      duration: 6000,
    });
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-4 relative overflow-hidden bg-[#030712] text-white">
      {/* Background Effects */}
      <MeshGradient />
      <FloatingParticles />

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg glass border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative z-10 text-center bg-white/[0.01]"
      >
        {/* Floating Red Warning Badge */}
        <div className="mx-auto h-16 w-16 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center justify-center text-red-400 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-bounce">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mb-3">
          404 - Not Found
        </h1>
        
        <p className="text-xs text-red-400 font-black uppercase tracking-widest mb-6">
          Requested URL is unavailable
        </p>

        <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10 max-w-sm mx-auto">
          The page or AI utility you are trying to access doesn't exist, has been moved, or is temporarily offline.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/tools"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(37,99,235,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" /> Tools Directory
          </Link>
          
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border border-white/10 hover:border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" /> Go to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

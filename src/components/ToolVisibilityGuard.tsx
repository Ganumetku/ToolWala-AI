"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Lock, ArrowLeft, Calendar } from 'lucide-react';
import { isToolLive } from '@/lib/tools';
import { MeshGradient } from '@/components/BackgroundEffects';
import type { Tool } from '@/data/tools';

interface ToolVisibilityGuardProps {
  slug: string;
  children: React.ReactNode;
}

export default function ToolVisibilityGuard({ slug, children }: ToolVisibilityGuardProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [toolInfo, setToolInfo] = useState<Tool | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setVisible(true);
      return;
    }

    async function checkVisibility() {
      try {
        const res = await fetch(`/api/tools/public?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        if (data.success && data.tool) {
          setToolInfo(data.tool);
          setVisible(isToolLive(data.tool));
        }
      } catch (err) {
        console.warn('Failed to verify tool visibility:', err);
      }
    }
    checkVisibility();
  }, [slug]);

  if (!visible && toolInfo) {
    const status = toolInfo.status || 'draft';
    const isScheduled = status === 'scheduled';
    const dateText = toolInfo.publishDate
      ? new Date(toolInfo.publishDate).toLocaleString(undefined, {
          dateStyle: 'long',
          timeStyle: 'short',
        })
      : '';

    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <MeshGradient />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative z-10 text-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto h-16 w-16 bg-purple-600/10 border border-purple-500/25 rounded-2xl flex items-center justify-center text-purple-400 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            {isScheduled ? <Clock className="w-8 h-8 animate-pulse" /> : <Lock className="w-8 h-8" />}
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2">
            {isScheduled ? 'Scheduled Release' : 'Access Restricted'}
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-6">
            Tool: {toolInfo.title}
          </p>

          <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
            {isScheduled
              ? `This AI utility is scheduled for automatic publication and will become available on:`
              : `This tool configuration is currently in draft mode and is not visible to the public.`}
          </p>

          {isScheduled && dateText && (
            <div className="mb-8 p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex items-center justify-center gap-2.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-black text-purple-300 tracking-wider font-mono">{dateText}</span>
            </div>
          )}

          <button
            onClick={() => router.push('/tools')}
            className="flex items-center justify-center gap-2 px-6 py-4 border border-white/10 hover:border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all active:scale-95 cursor-pointer w-full"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

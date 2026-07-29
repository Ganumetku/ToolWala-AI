'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, CheckCircle2, Zap, FileCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export interface ToolResultScreenProps {
  originalSizeBytes?: number;
  finalSizeBytes?: number;
  processingTimeMs?: number;
  itemCount?: number;
  title?: string;
  description?: string;
  downloadButtonText?: string;
  onDownload: () => void;
  onReset: () => void;
  previewUrl?: string;
}

export default function ToolResultScreen({
  originalSizeBytes,
  finalSizeBytes,
  processingTimeMs,
  itemCount,
  title = 'Processing Complete!',
  description = 'Your file is ready to download. All processing was done privately in your browser.',
  downloadButtonText = 'Download File',
  onDownload,
  onReset,
  previewUrl,
}: ToolResultScreenProps) {
  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const savedPercent =
    originalSizeBytes && finalSizeBytes && originalSizeBytes > 0
      ? Math.max(0, Math.round(((originalSizeBytes - finalSizeBytes) / originalSizeBytes) * 100))
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-3xl mx-auto font-sans"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        {/* Glow Header Accent */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Success Header Icon & Title */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-md mx-auto font-medium">
            {description}
          </p>
        </div>

        {/* Metrics Grid */}
        {(originalSizeBytes || finalSizeBytes || processingTimeMs) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 relative z-10">
            {originalSizeBytes !== undefined && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 rounded-xl p-3.5 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Original Size
                </span>
                <span className="text-base font-extrabold text-slate-700 dark:text-slate-200">
                  {formatBytes(originalSizeBytes)}
                </span>
              </div>
            )}

            {finalSizeBytes !== undefined && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 rounded-xl p-3.5 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Final Size
                </span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatBytes(finalSizeBytes)}
                </span>
              </div>
            )}

            {savedPercent > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3.5 text-center">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  Saved
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  -{savedPercent}%
                </span>
              </div>
            )}

            {processingTimeMs !== undefined && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 rounded-xl p-3.5 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Speed
                </span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {(processingTimeMs / 1000).toFixed(2)}s
                </span>
              </div>
            )}
          </div>
        )}

        {/* Optional Image / File Preview */}
        {previewUrl && (
          <div className="mb-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-2 max-h-64">
            <img src={previewUrl} alt="Preview" className="max-h-60 max-w-full object-contain rounded-lg shadow-sm" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-10">
          <button
            onClick={onDownload}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2.5 group hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>{downloadButtonText}</span>
          </button>

          <button
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-4 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
            <span>Process Another File</span>
          </button>
        </div>

        {/* Security Badge Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Client-Side Privacy Guarantee – No server upload occurred</span>
        </div>
      </div>
    </motion.div>
  );
}

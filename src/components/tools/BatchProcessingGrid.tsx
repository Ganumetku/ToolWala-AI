'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCw, GripVertical, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export interface BatchFileItem {
  id: string;
  file: File;
  previewUrl?: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  originalSize: number;
  processedSize?: number;
  errorMessage?: string;
  rotation?: number;
}

export interface BatchProcessingGridProps {
  items: BatchFileItem[];
  onRemove: (id: string) => void;
  onRotate?: (id: string) => void;
  onReorder?: (newItems: BatchFileItem[]) => void;
}

export default function BatchProcessingGrid({
  items,
  onRemove,
  onRotate,
}: BatchProcessingGridProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full font-sans">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Uploaded Files ({items.length})
        </h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-xs hover:shadow-md transition-all p-2.5 flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="relative h-28 w-full rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center mb-2 border border-slate-100 dark:border-slate-800/80">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined }}
                  />
                ) : (
                  <FileText className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                )}

                {/* Status Indicator */}
                <div className="absolute top-1.5 right-1.5">
                  {item.status === 'processing' && (
                    <span className="p-1 bg-blue-600/90 text-white rounded-full block shadow-md animate-spin">
                      <Loader2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {item.status === 'success' && (
                    <span className="p-1 bg-emerald-500 text-white rounded-full block shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="p-1 bg-rose-500 text-white rounded-full block shadow-md">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {onRotate && (
                    <button
                      onClick={() => onRotate(item.id)}
                      className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-md transition-colors"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-lg backdrop-blur-md transition-colors"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* File Info */}
              <div className="px-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={item.file.name}>
                  {item.file.name}
                </p>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mt-0.5">
                  <span>{formatBytes(item.originalSize)}</span>
                  {item.processedSize !== undefined && (
                    <span className="text-emerald-500 font-bold">
                      {formatBytes(item.processedSize)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

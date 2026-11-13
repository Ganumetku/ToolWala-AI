import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Clipboard } from 'lucide-react';
import TrustBadges from '@/components/TrustBadges';

interface ImageUploadPlaceholderProps {
  onClick?: () => void;
  onDrop?: (files: File[]) => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function ImageUploadPlaceholder({ 
  onClick, 
  onDrop,
  title = "Drop photo here",
  description = "JPG, PNG, or WebP. The photo stays in this tab — nothing is sent to a server.",
  buttonText = "Choose photo"
}: ImageUploadPlaceholderProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!onDrop) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1 || item.type === 'application/pdf') {
          const file = item.getAsFile();
          if (file) {
            // Give pasted screenshots/images a clean filename if needed
            const renamedFile = file.name === 'image.png' || file.name === 'blob' 
              ? new File([file], `pasted-image-${Date.now()}.${file.type.split('/')[1] || 'png'}`, { type: file.type })
              : file;
            pastedFiles.push(renamedFile);
          }
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        onDrop(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onDrop]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onDrop) {
        onDrop(Array.from(e.dataTransfer.files));
      } else if (onClick) {
        onClick();
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
    <div
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative border-2 border-dashed rounded-[1.125rem] py-8 sm:py-12 px-6 sm:px-10 text-center transition-all duration-300 cursor-pointer overflow-hidden
        ${isDragging 
          ? 'border-blue-500 bg-blue-50/90 dark:bg-blue-500/20 scale-[1.015] shadow-[0_0_50px_rgba(59,130,246,0.35)] ring-4 ring-blue-500/30 dark:shadow-[0_0_60px_rgba(59,130,246,0.4)]' 
          : 'border-[#E6ECF5] bg-[#FBFCFE] hover:bg-[#F0F4FF] hover:border-blue-400 dark:border-white/10 dark:bg-white/[0.01] dark:hover:bg-white/[0.02] shadow-[0_4px_20px_rgba(15,23,42,0.03)]'
        }
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10 animate-in fade-in zoom-in-95 duration-500 font-sans">
        <div className={`mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center mb-4 border transition-all duration-300 ${
          isDragging
            ? 'bg-blue-600 text-white border-blue-400 scale-110 shadow-blue-500/50 animate-bounce'
            : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-100 dark:border-blue-500/20 group-hover:scale-105 shadow-sm dark:shadow-2xl'
        }`}>
          <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight transition-colors">
          {isDragging ? 'Drop photo here' : title}
        </h3>
        <p className="text-slate-500 dark:text-gray-400 mb-5 max-w-md mx-auto font-medium text-xs sm:text-sm leading-relaxed font-sans">
          {isDragging ? 'Release to add it. It stays in this tab.' : description}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className={`inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            isDragging
              ? 'bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.6)] scale-105'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.35)] hover:-translate-y-0.5'
          }`}>
            {isDragging ? 'Release to add' : buttonText}
          </div>
          
          {!isDragging && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <Clipboard className="w-3.5 h-3.5 text-blue-500" />
              <span>Or press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-[10px] shadow-2xs font-mono font-bold">Ctrl + V</kbd> to paste</span>
            </div>
          )}
        </div>
      </div>
    </div>
    <TrustBadges />
    </div>
  );
}


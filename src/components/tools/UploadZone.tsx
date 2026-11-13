"use client";

import React, { useRef, useState } from 'react';
import { FilePlus } from 'lucide-react';
import TrustBadges from '@/components/TrustBadges';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function UploadZone({
  onFilesSelected,
  accept = "application/pdf",
  multiple = true,
  title = "Drop PDF files here",
  description = "They stay in this tab. Nothing is sent to a server.",
  buttonText = "Choose files"
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[1.125rem] py-8 sm:py-12 px-6 sm:px-10 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden
          ${isDragging 
            ? 'border-blue-500 bg-blue-50/90 dark:bg-blue-500/20 scale-[1.015] shadow-[0_0_50px_rgba(59,130,246,0.35)] ring-4 ring-blue-500/30 dark:shadow-[0_0_60px_rgba(59,130,246,0.4)]' 
            : 'border-[#E6ECF5] bg-[#FBFCFE] hover:bg-[#F0F4FF] hover:border-blue-400 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] dark:hover:border-white/20 shadow-[0_4px_20px_rgba(15,23,42,0.03)]'
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
          data-testid="tool-file-input"
          className="hidden"
        />
        
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative z-10">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 border shadow-sm ${
            isDragging 
              ? 'bg-blue-600 text-white border-blue-400 scale-110 shadow-blue-500/50 animate-bounce' 
              : 'bg-blue-50 dark:bg-white/5 text-blue-600 dark:text-gray-400 border-blue-100 dark:border-white/10 group-hover:text-blue-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10 group-hover:scale-105'
          }`}>
            <FilePlus className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 transition-colors">
            {isDragging ? 'Drop files here' : title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mb-5 max-w-md mx-auto font-medium leading-relaxed font-sans">
            {isDragging ? 'Release to add them. They stay in this tab.' : description}
          </p>
          <button className={`rounded-xl text-white px-6 py-2.5 sm:px-7 sm:py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer pointer-events-none ${
            isDragging 
              ? 'bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.6)] scale-105' 
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.35)]'
          }`}>
            {isDragging ? 'Release to add' : buttonText}
          </button>
        </div>
      </div>

      <TrustBadges />
    </div>
  );
}

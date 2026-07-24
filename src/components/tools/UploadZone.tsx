"use client";

import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
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
  title = "Select PDF files to Merge",
  description = "Drag and drop PDF files here, or click to browse. Processing is fully secured inside your browser.",
  buttonText = "Browse Files"
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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
        className={`border-2 border-dashed rounded-[1.125rem] p-12 sm:p-20 text-center transition-all duration-250 cursor-pointer group relative overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.03)]
          ${isDragging 
            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-500/10 scale-[1.01] shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
            : 'border-[#E6ECF5] bg-[#FBFCFE] hover:bg-[#F0F4FF] hover:border-blue-400 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] dark:hover:border-white/20'
          }
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple={multiple} 
          accept={accept} 
          className="hidden" 
        />
        
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-8 rounded-[16px] bg-blue-50 dark:bg-white/5 flex items-center justify-center text-blue-600 dark:text-gray-400 border border-blue-100 dark:border-white/10 group-hover:text-blue-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10 group-hover:scale-110 transition-all duration-300 shadow-sm">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3 uppercase">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-8 max-w-md mx-auto font-medium leading-relaxed font-sans">
            {description}
          </p>
          <button className="rounded-[16px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.35)] transition-all duration-250 cursor-pointer">
            {buttonText}
          </button>
        </div>
      </div>

      <TrustBadges />
    </div>
  );
}

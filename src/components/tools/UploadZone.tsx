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
    <div className="flex flex-col gap-6 w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[3rem] p-12 sm:p-24 text-center transition-all cursor-pointer group relative overflow-hidden
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01] shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
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
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 border border-white/5 group-hover:text-blue-400 group-hover:bg-blue-500/10 group-hover:scale-110 transition-all duration-300 shadow-2xl">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-3">{title}</h3>
          <p className="text-sm text-gray-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
            {description}
          </p>
          <button className="rounded-xl bg-white text-black px-8 py-3.5 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]">
            {buttonText}
          </button>
        </div>
      </div>

      <TrustBadges />
    </div>
  );
}

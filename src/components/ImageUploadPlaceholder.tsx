import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

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
  title = "Drop photo here or click to browse",
  description = "Supports JPG, PNG, and WebP up to 20MB. All processing happens safely in your browser.",
  buttonText = "Select Image File"
}: ImageUploadPlaceholderProps) {
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
      if (onDrop) {
        onDrop(Array.from(e.dataTransfer.files));
      } else if (onClick) {
        onClick();
      }
    }
  };

  return (
    <div
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative border-2 border-dashed rounded-[1.125rem] p-12 sm:p-20 text-center transition-all duration-250 cursor-pointer overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.03)]
        ${isDragging 
          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-500/10 scale-[1.01] shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
          : 'border-[#E6ECF5] bg-[#FBFCFE] hover:bg-[#F0F4FF] hover:border-blue-400 dark:border-white/10 dark:bg-white/[0.01] dark:hover:bg-white/[0.02]'
        }
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 animate-in fade-in zoom-in-95 duration-500 font-sans">
        <div className="mx-auto h-20 w-20 text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/10 rounded-[16px] flex items-center justify-center mb-8 shadow-sm dark:shadow-2xl border border-blue-100 dark:border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
          <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight uppercase">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-md mx-auto font-medium text-sm leading-relaxed">
          {description}
        </p>
        <div className="inline-flex items-center gap-3.5 px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-[16px] transition-all shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.35)] hover:-translate-y-0.5">
          {buttonText}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Maximize2 } from 'lucide-react';

export default function ImageUploadPlaceholder({ onClick }: { onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2.5rem] p-16 sm:p-24 text-center hover:border-blue-500 dark:hover:border-blue-500/50 bg-[#F8FAFC] dark:bg-white/[0.01] hover:bg-blue-50/40 dark:hover:bg-white/[0.02] transition-all cursor-pointer overflow-hidden shadow-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="mx-auto h-24 w-24 text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm dark:shadow-2xl border border-blue-200 dark:border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
          <Maximize2 className="w-10 h-10 text-blue-600 dark:text-blue-500" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight uppercase">
          Drop photo to resize
        </h3>
        <p className="text-gray-600 dark:text-gray-500 mb-8 max-w-sm mx-auto font-medium">
          Supports JPG, PNG, and WebP. Adjust crop bounds manually with complete professional control.
        </p>
        <div className="inline-flex items-center gap-3.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md">
          Select Image File
        </div>
      </div>
    </div>
  );
}

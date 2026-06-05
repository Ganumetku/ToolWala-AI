"use client";

import { Search, X } from 'lucide-react';

interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CategorySearch({ value, onChange, placeholder = "Search tools..." }: CategorySearchProps) {
  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-5 flex items-center text-gray-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
        <Search className="h-4.5 w-4.5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-10 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-sm font-bold outline-none transition-all shadow-xl"
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-4 flex items-center px-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

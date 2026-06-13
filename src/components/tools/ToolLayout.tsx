"use client";

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { MeshGradient } from '@/components/BackgroundEffects';
import React from 'react';

interface ToolLayoutProps {
  children: React.ReactNode;
}

export default function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans">
      <MeshGradient />
      
      {/* Decorative Glow Grid */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Navigation Link */}
        <Link 
          href="/tools" 
          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {children}
      </div>
    </div>
  );
}

"use client";

import { useTheme } from "@/components/ThemeContext";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme, isMounted } = useTheme();

  const isDark = isMounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative inline-flex h-[34px] w-[68px] shrink-0 cursor-pointer items-center rounded-full p-1 border-2 transition-colors duration-500 select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isDark
          ? "border-indigo-400/30 bg-gradient-to-r from-[#2B32B2] via-[#2563EB] to-[#1E1B4B] shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]"
          : "border-white/80 bg-gradient-to-r from-[#FF7E80] via-[#FF8A65] to-[#FFA726] shadow-[inset_0_2px_5px_rgba(0,0,0,0.18)]"
      }`}
    >
      {/* 1. Track Illustrations */}
      
      {/* LIGHT MODE: Sun & Cloud (positioned on the right) */}
      <div
        className={`absolute right-1.5 flex items-center gap-0.5 transition-all duration-300 ${
          isDark ? "opacity-0 scale-50 translate-x-4 pointer-events-none" : "opacity-100 scale-100 translate-x-0"
        }`}
      >
        <svg className="w-5 h-5 text-amber-300 drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)]" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <svg className="w-4 h-4 text-white -ml-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 19H6a4.5 4.5 0 01-.42-8.98 6 6 0 0111.84-2.47A4.5 4.5 0 0117.5 19z" />
        </svg>
      </div>

      {/* DARK MODE: Moon & Stars (positioned on the left) */}
      <div
        className={`absolute left-2 flex items-center gap-1 transition-all duration-300 ${
          isDark ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-50 -translate-x-4 pointer-events-none"
        }`}
      >
        <svg className="w-4 h-4 text-amber-200 drop-shadow-[0_0_8px_rgba(253,230,138,0.8)]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
        <span className="text-[10px] text-amber-200 animate-pulse select-none">✨</span>
      </div>

      {/* 2. 3D Sliding Thumb / Knob */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        animate={{
          x: isDark ? 34 : 0
        }}
        className="z-10 h-[26px] w-[26px] rounded-full bg-gradient-to-b from-white to-[#e6e6e6] shadow-[0_3px_8px_rgba(0,0,0,0.35),inset_0_-2px_4px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-center"
      >
        {/* Subtle inner highlight dot on knob */}
        <div className="h-2 w-2 rounded-full bg-slate-200/50 dark:bg-slate-400/40 shadow-inner" />
      </motion.div>

      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

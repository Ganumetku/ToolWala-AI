"use client";

import { useTheme } from "@/components/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme, isMounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isMounted && theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isMounted && theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="relative flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 border border-black/10 dark:border-white/10 transition-all duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0 cursor-pointer overflow-hidden shadow-sm"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Sun Icon (shows in Dark mode to switch to Light mode) */}
        <Sun
          className={`absolute inset-0 h-4 w-4 text-amber-500 transition-all duration-250 transform ${
            !isMounted || theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
          aria-hidden="true"
        />
        {/* Moon Icon (shows in Light mode to switch to Dark mode) */}
        <Moon
          className={`absolute inset-0 h-4 w-4 text-blue-600 dark:text-blue-400 transition-all duration-250 transform ${
            isMounted && theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
          aria-hidden="true"
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

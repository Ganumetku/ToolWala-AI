import React from "react";

/**
 * PageBackground — Simple, ultra-clean aesthetic inspired directly by iLovePDF.
 * - Zero dots / zero noise
 * - Elegant, soft pastel peach/coral organic curve at top-right
 * - Soft brand-blue ambient aura at top-left
 * - Clean, serene, distraction-free canvas so white tool cards pop beautifully
 */
export default function PageBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Top-Right iLovePDF Signature Sweeping Coral/Peach Wave — Flush to Right Edge */}
      <svg
        className="absolute top-0 right-0 w-[500px] sm:w-[700px] lg:w-[900px] h-[500px] sm:h-[650px] opacity-[0.08] dark:opacity-[0.04] transition-opacity duration-500 pointer-events-none"
        viewBox="0 0 1000 800"
        fill="none"
        preserveAspectRatio="xMaxYMin slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M300 0 C 520 70, 720 200, 830 440 C 890 580, 950 680, 1000 760 L 1000 0 Z"
          fill="url(#peachCoralGradient)"
        />
        <defs>
          <linearGradient id="peachCoralGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="50%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </svg>

      {/* 2. Top-Left Gentle Blue / Indigo Fluid Tint — Flush to Left Edge */}
      <svg
        className="absolute top-0 left-0 w-[450px] sm:w-[650px] lg:w-[800px] h-[450px] sm:h-[600px] opacity-[0.06] dark:opacity-[0.05] transition-opacity duration-500 pointer-events-none"
        viewBox="0 0 900 700"
        fill="none"
        preserveAspectRatio="xMinYMin slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0 L 650 0 C 520 140, 390 250, 260 340 C 130 430, 40 500, 0 580 Z"
          fill="url(#blueIndigoGradient)"
        />
        <defs>
          <linearGradient id="blueIndigoGradient" x1="0%" y1="0%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="60%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>

      {/* 3. Subtle Ambient Soft Glow in Top-Right Corner */}
      <div
        className="absolute top-0 right-0 w-[420px] h-[380px] rounded-full blur-[110px] opacity-[0.12] dark:opacity-[0.05] pointer-events-none"
        style={{
          background: "radial-gradient(circle at 100% 0%, rgba(251, 146, 60, 0.4) 0%, rgba(244, 63, 94, 0.15) 55%, transparent 75%)",
        }}
      />
    </div>
  );
}

"use client";

import React from 'react';

export interface SymbolProps {
  primaryColor?: string;
  accentColor?: string;
  size?: number;
  className?: string;
}

export const SYMBOL_CATALOG: { id: string; name: string; category: string }[] = [
  { id: 'quantum-orbit', name: 'Quantum Orbit', category: 'Tech & AI' },
  { id: 'hex-prism', name: 'Isometric Prism', category: 'Tech & Modern' },
  { id: 'infinity-ribbon', name: 'Infinity Ribbon', category: 'Abstract' },
  { id: 'luxury-crest', name: 'Royal Crest & Laurel', category: 'Luxury' },
  { id: 'apex-delta', name: 'Apex Stealth Delta', category: 'Sports & Speed' },
  { id: 'monogram-seal', name: 'Monogram Wax Seal', category: 'Executive' },
  { id: 'neural-node', name: 'Neural Constellation', category: 'Tech & Data' },
  { id: 'golden-spiral', name: 'Golden Spiral', category: 'Abstract' },
  { id: 'organic-leaf', name: 'Botanical Helix', category: 'Health & Eco' },
  { id: 'architect-pillar', name: 'Classical Pediment', category: 'Legal & Finance' },
  { id: 'diamond-brilliant', name: 'Brilliant Diamond', category: 'Luxury & Jewelry' },
  { id: 'aperture-iris', name: 'Aperture Lens', category: 'Media & Creative' },
  { id: 'shield-vanguard', name: 'Vanguard Shield', category: 'Security & Trust' },
  { id: 'zenith-sun', name: 'Zenith Horizon', category: 'Lifestyle & Food' },
  { id: 'flame-spark', name: 'Kinetic Flame', category: 'Energy & Fitness' },
  { id: 'cube-matrix', name: 'Matrix Cube', category: 'Fintech & Web3' },
  { id: 'origami-bird', name: 'Origami Flight', category: 'Design & Freedom' },
  { id: 'compass-star', name: 'Polaris Compass', category: 'Navigation & Marine' },
];

export function VectorSymbol({
  symbolId = 'quantum-orbit',
  primaryColor = '#2563EB',
  accentColor = '#06B6D4',
  size = 56,
  className = '',
}: SymbolProps & { symbolId: string }) {
  const p = primaryColor;
  const a = accentColor || primaryColor;
  const gradId = `sym-grad-${symbolId}-${p.replace('#', '')}-${a.replace('#', '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p} />
          <stop offset="100%" stopColor={a} />
        </linearGradient>
      </defs>

      {/* 1. Quantum Orbit */}
      {symbolId === 'quantum-orbit' && (
        <g strokeWidth="4" strokeLinecap="round">
          <ellipse cx="50" cy="50" rx="42" ry="18" stroke={`url(#${gradId})`} transform="rotate(-30 50 50)" opacity="0.9" />
          <ellipse cx="50" cy="50" rx="42" ry="18" stroke={p} transform="rotate(30 50 50)" opacity="0.75" />
          <ellipse cx="50" cy="50" rx="42" ry="18" stroke={a} transform="rotate(90 50 50)" opacity="0.6" />
          <circle cx="50" cy="50" r="10" fill={`url(#${gradId})`} />
          <circle cx="50" cy="50" r="4" fill="#ffffff" />
        </g>
      )}

      {/* 2. Hex Prism (3D Isometric Cube) */}
      {symbolId === 'hex-prism' && (
        <g>
          {/* Top Face */}
          <polygon points="50,14 84,33 50,52 16,33" fill={p} opacity="0.95" />
          {/* Left Face */}
          <polygon points="16,33 50,52 50,88 16,69" fill={a} opacity="0.8" />
          {/* Right Face */}
          <polygon points="50,52 84,33 84,69 50,88" fill={p} opacity="0.6" />
          {/* Subtle inner lines */}
          <line x1="50" y1="52" x2="50" y2="88" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
        </g>
      )}

      {/* 3. Infinity Ribbon */}
      {symbolId === 'infinity-ribbon' && (
        <g fill="none" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M28 65 C14 65 14 35 28 35 C42 35 58 65 72 65 C86 65 86 35 72 35 C58 35 42 65 28 65 Z"
            stroke={`url(#${gradId})`}
          />
          <circle cx="28" cy="50" r="3" fill="#ffffff" />
          <circle cx="72" cy="50" r="3" fill="#ffffff" />
        </g>
      )}

      {/* 4. Luxury Crest & Laurel */}
      {symbolId === 'luxury-crest' && (
        <g fill="none">
          {/* Crown */}
          <path d="M40 24 L44 32 L50 20 L56 32 L60 24 L58 36 L42 36 Z" fill={p} />
          {/* Central Shield */}
          <path d="M36 38 H64 V56 C64 68 50 78 50 78 C50 78 36 68 36 56 V38 Z" stroke={p} strokeWidth="3" />
          <path d="M42 44 H58 V54 C58 62 50 68 50 68 C50 68 42 62 42 54 V44 Z" fill={`url(#${gradId})`} opacity="0.8" />
          {/* Laurel Left */}
          <path d="M26 36 C20 48 22 66 32 76" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="21" cy="46" r="3" fill={a} />
          <circle cx="23" cy="58" r="3" fill={a} />
          <circle cx="29" cy="69" r="3" fill={a} />
          {/* Laurel Right */}
          <path d="M74 36 C80 48 78 66 68 76" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="79" cy="46" r="3" fill={a} />
          <circle cx="77" cy="58" r="3" fill={a} />
          <circle cx="71" cy="69" r="3" fill={a} />
          {/* Star */}
          <polygon points="50,47 52,51 56,51 53,54 54,58 50,55 46,58 47,54 44,51 48,51" fill="#ffffff" />
        </g>
      )}

      {/* 5. Apex Delta */}
      {symbolId === 'apex-delta' && (
        <g>
          {/* Outer Triangle */}
          <polygon points="50,12 88,82 12,82" fill={`url(#${gradId})`} />
          {/* Negative Space Inner Delta */}
          <polygon points="50,42 70,74 30,74" fill="#ffffff" opacity="0.9" />
          <polygon points="50,54 62,72 38,72" fill={p} />
        </g>
      )}

      {/* 6. Monogram Seal */}
      {symbolId === 'monogram-seal' && (
        <g fill="none">
          <circle cx="50" cy="50" r="44" stroke={p} strokeWidth="3" />
          <circle cx="50" cy="50" r="38" stroke={a} strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="30" fill={`url(#${gradId})`} />
          {/* 4 Compass Dots */}
          <circle cx="50" cy="14" r="2" fill={p} />
          <circle cx="86" cy="50" r="2" fill={p} />
          <circle cx="50" cy="86" r="2" fill={p} />
          <circle cx="14" cy="50" r="2" fill={p} />
          {/* Star in Center */}
          <polygon points="50,38 53,46 61,46 55,51 57,59 50,54 43,59 45,51 39,46 47,46" fill="#ffffff" />
        </g>
      )}

      {/* 7. Neural Node */}
      {symbolId === 'neural-node' && (
        <g strokeWidth="2.5">
          {/* Connector lines */}
          <line x1="50" y1="50" x2="25" y2="28" stroke={a} opacity="0.6" />
          <line x1="50" y1="50" x2="75" y2="28" stroke={a} opacity="0.6" />
          <line x1="50" y1="50" x2="84" y2="60" stroke={p} opacity="0.6" />
          <line x1="50" y1="50" x2="50" y2="82" stroke={p} opacity="0.6" />
          <line x1="50" y1="50" x2="16" y2="60" stroke={a} opacity="0.6" />
          {/* Outer Node Circles */}
          <circle cx="25" cy="28" r="8" fill={p} />
          <circle cx="75" cy="28" r="8" fill={a} />
          <circle cx="84" cy="60" r="7" fill={p} />
          <circle cx="50" cy="82" r="9" fill={`url(#${gradId})`} />
          <circle cx="16" cy="60" r="7" fill={a} />
          {/* Central Nucleus */}
          <circle cx="50" cy="50" r="14" fill={`url(#${gradId})`} />
          <circle cx="50" cy="50" r="5" fill="#ffffff" />
        </g>
      )}

      {/* 8. Golden Spiral */}
      {symbolId === 'golden-spiral' && (
        <g fill="none" strokeWidth="4" strokeLinecap="round">
          <path
            d="M 50 50 A 6 6 0 0 1 56 44 A 12 12 0 0 1 68 56 A 20 20 0 0 1 48 76 A 32 32 0 0 1 16 44 A 46 46 0 0 1 62 0"
            stroke={`url(#${gradId})`}
            transform="translate(10, 14) scale(0.85)"
          />
          <circle cx="50" cy="50" r="5" fill={p} />
        </g>
      )}

      {/* 9. Organic Leaf */}
      {symbolId === 'organic-leaf' && (
        <g>
          {/* Primary Leaf */}
          <path
            d="M50 14 C74 14 84 40 80 66 C76 82 58 86 50 86 C42 86 24 82 20 66 C16 40 26 14 50 14 Z"
            fill={`url(#${gradId})`}
          />
          {/* Center Vein */}
          <path d="M50 22 V78" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          {/* Side Veins */}
          <path d="M50 36 L66 48" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          <path d="M50 50 L34 62" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          <path d="M50 62 L64 72" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        </g>
      )}

      {/* 10. Architect Pillar */}
      {symbolId === 'architect-pillar' && (
        <g fill="none" stroke={p} strokeWidth="3">
          {/* Pediment (Triangle roof) */}
          <polygon points="50,14 86,34 14,34" fill={a} opacity="0.25" stroke={p} strokeWidth="3" />
          {/* Architrave */}
          <rect x="18" y="34" width="64" height="6" fill={p} />
          {/* 3 Classical Columns */}
          <rect x="25" y="40" width="8" height="34" fill={`url(#${gradId})`} />
          <rect x="46" y="40" width="8" height="34" fill={`url(#${gradId})`} />
          <rect x="67" y="40" width="8" height="34" fill={`url(#${gradId})`} />
          {/* Stylobate (Base) */}
          <rect x="14" y="74" width="72" height="6" fill={p} />
          <rect x="10" y="80" width="80" height="6" fill={a} />
        </g>
      )}

      {/* 11. Diamond Brilliant */}
      {symbolId === 'diamond-brilliant' && (
        <g strokeWidth="2.5" strokeLinejoin="round">
          {/* Table */}
          <polygon points="32,24 68,24 86,46 14,46" fill={`url(#${gradId})`} stroke="#ffffff" />
          {/* Pavillion */}
          <polygon points="14,46 86,46 50,88" fill={p} opacity="0.85" stroke="#ffffff" />
          {/* Star Facets */}
          <line x1="42" y1="24" x2="34" y2="46" stroke="#ffffff" />
          <line x1="58" y1="24" x2="66" y2="46" stroke="#ffffff" />
          <line x1="34" y1="46" x2="50" y2="88" stroke="#ffffff" />
          <line x1="66" y1="46" x2="50" y2="88" stroke="#ffffff" />
          <line x1="50" y1="46" x2="50" y2="88" stroke="#ffffff" />
        </g>
      )}

      {/* 12. Aperture Iris */}
      {symbolId === 'aperture-iris' && (
        <g fill="none" stroke={p} strokeWidth="3">
          <circle cx="50" cy="50" r="42" stroke={`url(#${gradId})`} strokeWidth="4" />
          <path d="M50 10 L68 36" stroke={p} strokeWidth="3.5" />
          <path d="M85 30 L74 62" stroke={p} strokeWidth="3.5" />
          <path d="M85 70 L56 78" stroke={p} strokeWidth="3.5" />
          <path d="M50 90 L32 64" stroke={p} strokeWidth="3.5" />
          <path d="M15 70 L26 38" stroke={p} strokeWidth="3.5" />
          <path d="M15 30 L44 22" stroke={p} strokeWidth="3.5" />
          <circle cx="50" cy="50" r="12" fill={a} opacity="0.3" stroke={a} strokeWidth="2" />
        </g>
      )}

      {/* 13. Shield Vanguard */}
      {symbolId === 'shield-vanguard' && (
        <g>
          {/* Left Shield Half */}
          <path d="M50 14 H22 V54 C22 72 50 86 50 86 V14 Z" fill={p} />
          {/* Right Shield Half */}
          <path d="M50 14 H78 V54 C78 72 50 86 50 86 V14 Z" fill={a} />
          {/* Central Stylized Check / Falcon */}
          <path d="M50 32 L36 50 L46 50 L42 66 L64 44 L54 44 Z" fill="#ffffff" />
        </g>
      )}

      {/* 14. Zenith Sun */}
      {symbolId === 'zenith-sun' && (
        <g>
          {/* Half Sun */}
          <path d="M22 52 A28 28 0 0 1 78 52 Z" fill={`url(#${gradId})`} />
          {/* Sun Rays */}
          <line x1="50" y1="12" x2="50" y2="18" stroke={p} strokeWidth="4" strokeLinecap="round" />
          <line x1="26" y1="22" x2="30" y2="27" stroke={p} strokeWidth="4" strokeLinecap="round" />
          <line x1="74" y1="22" x2="70" y2="27" stroke={p} strokeWidth="4" strokeLinecap="round" />
          <line x1="12" y1="42" x2="18" y2="42" stroke={p} strokeWidth="4" strokeLinecap="round" />
          <line x1="88" y1="42" x2="82" y2="42" stroke={p} strokeWidth="4" strokeLinecap="round" />
          {/* Horizon Waves */}
          <line x1="14" y1="58" x2="86" y2="58" stroke={a} strokeWidth="4" strokeLinecap="round" />
          <line x1="22" y1="68" x2="78" y2="68" stroke={a} strokeWidth="4" strokeLinecap="round" opacity="0.75" />
          <line x1="32" y1="78" x2="68" y2="78" stroke={a} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        </g>
      )}

      {/* 15. Flame Spark */}
      {symbolId === 'flame-spark' && (
        <g>
          {/* Outer Flame */}
          <path
            d="M50 12 C58 28 78 42 78 64 C78 78 66 88 50 88 C34 88 22 78 22 64 C22 46 36 34 44 26 C44 38 52 46 56 46 C52 38 52 24 50 12 Z"
            fill={`url(#${gradId})`}
          />
          {/* Inner Teardrop Core */}
          <path
            d="M50 56 C54 62 58 68 58 74 C58 80 54 84 50 84 C46 84 42 80 42 74 C42 66 48 62 50 56 Z"
            fill="#ffffff"
          />
        </g>
      )}

      {/* 16. Cube Matrix */}
      {symbolId === 'cube-matrix' && (
        <g stroke={`url(#${gradId})`} strokeWidth="3" fill="none">
          {/* Outer Cube */}
          <polygon points="50,14 84,33 84,71 50,90 16,71 16,33" />
          {/* Center Lines */}
          <line x1="50" y1="52" x2="50" y2="90" />
          <line x1="50" y1="52" x2="84" y2="33" />
          <line x1="50" y1="52" x2="16" y2="33" />
          {/* Floating Core */}
          <circle cx="50" cy="52" r="7" fill={a} stroke="#ffffff" strokeWidth="2" />
        </g>
      )}

      {/* 17. Origami Bird */}
      {symbolId === 'origami-bird' && (
        <g stroke="#ffffff" strokeWidth="1" strokeLinejoin="round">
          <polygon points="50,20 84,40 50,56" fill={p} />
          <polygon points="50,20 16,40 50,56" fill={a} opacity="0.8" />
          <polygon points="50,56 84,40 68,78" fill={p} opacity="0.9" />
          <polygon points="50,56 16,40 32,78" fill={a} opacity="0.7" />
          <polygon points="50,56 32,78 50,86 68,78" fill={`url(#${gradId})`} />
        </g>
      )}

      {/* 18. Compass Star */}
      {symbolId === 'compass-star' && (
        <g fill={`url(#${gradId})`}>
          {/* Main 4 Points */}
          <polygon points="50,10 55,45 90,50 55,55 50,90 45,55 10,50 45,45" />
          {/* Diagonal 4 Points */}
          <polygon points="50,50 68,26 50,44 74,50" fill={a} opacity="0.8" />
          <polygon points="50,50 74,74 44,50 50,74" fill={a} opacity="0.8" />
          <polygon points="50,50 26,74 50,56 26,50" fill={a} opacity="0.8" />
          <polygon points="50,50 26,26 56,50 50,26" fill={a} opacity="0.8" />
          <circle cx="50" cy="50" r="5" fill="#ffffff" />
        </g>
      )}
    </svg>
  );
}

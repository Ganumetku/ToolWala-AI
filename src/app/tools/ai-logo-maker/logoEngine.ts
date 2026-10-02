export interface DesignerPalette {
  id: string;
  name: string;
  category: string;
  primary: string;
  accent: string;
  darkBg: string;
  lightBg: string;
}

export interface IndustryOption {
  id: string;
  name: string;
  tagline: string;
  defaultSymbol: string;
  paletteId: string;
  sampleBrand: string;
  sampleSlogan: string;
}

export interface VectorSymbolDef {
  id: string;
  name: string;
  category: 'tech' | 'luxury' | 'abstract' | 'organic' | 'heraldic' | 'minimal';
  paths: {
    primary?: string;
    accent?: string;
    combined?: string;
    rawSvg?: (primary: string, accent: string) => React.ReactNode;
    svgString?: (primary: string, accent: string) => string;
  };
}

export type LogoLayoutType = 
  | 'icon-top'
  | 'icon-left'
  | 'monogram-badge'
  | 'luxury-crest'
  | 'bold-wordmark'
  | 'tech-gradient'
  | 'minimal-stamp'
  | 'stacked-clean';

export interface LogoConcept {
  id: number;
  layout: LogoLayoutType;
  symbolId: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'geometric' | 'display';
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  fontSize: number;
  letterSpacing: number;
  symbolScale: number;
  uppercase: boolean;
  shadow: boolean;
  frameShape?: 'none' | 'circle' | 'squircle' | 'hexagon' | 'shield';
}

export const DESIGNER_PALETTES: DesignerPalette[] = [
  {
    id: 'electric-cobalt',
    name: 'Electric Cobalt',
    category: 'Tech & SaaS',
    primary: '#2563EB',
    accent: '#06B6D4',
    darkBg: '#090D16',
    lightBg: '#F8FAFC',
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold & Onyx',
    category: 'Luxury & Prestige',
    primary: '#D97706',
    accent: '#F59E0B',
    darkBg: '#0B0F19',
    lightBg: '#FFFBEB',
  },
  {
    id: 'cyber-violet',
    name: 'Cyber Violet',
    category: 'Creative & AI',
    primary: '#7C3AED',
    accent: '#EC4899',
    darkBg: '#0D091A',
    lightBg: '#FAF5FF',
  },
  {
    id: 'emerald-mint',
    name: 'Emerald Mint',
    category: 'Health & Eco',
    primary: '#059669',
    accent: '#10B981',
    darkBg: '#06140E',
    lightBg: '#F0FDF4',
  },
  {
    id: 'crimson-carbon',
    name: 'Crimson Pulse',
    category: 'Power & Sports',
    primary: '#DC2626',
    accent: '#F87171',
    darkBg: '#120808',
    lightBg: '#FEF2F2',
  },
  {
    id: 'nordic-slate',
    name: 'Nordic Slate',
    category: 'Consulting & Legal',
    primary: '#1E293B',
    accent: '#64748B',
    darkBg: '#0A0E17',
    lightBg: '#F1F5F9',
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    category: 'Food & Lifestyle',
    primary: '#EA580C',
    accent: '#FBBF24',
    darkBg: '#140B04',
    lightBg: '#FFF7ED',
  },
  {
    id: 'monochrome-pure',
    name: 'Monochrome Pure',
    category: 'Minimalist & Studio',
    primary: '#090D16',
    accent: '#475569',
    darkBg: '#030712',
    lightBg: '#FFFFFF',
  },
];

export const BRAND_PRESETS = [
  {
    name: 'Apex AI',
    slogan: 'Autonomous Intelligence Systems',
    industry: 'Tech & AI',
    paletteId: 'electric-cobalt',
    style: 'Futuristic Tech',
    symbol: 'quantum-orbit',
  },
  {
    name: 'Velvet & Co.',
    slogan: 'Haute Horlogerie & Jewels',
    industry: 'Luxury & Fashion',
    paletteId: 'royal-gold',
    style: 'Luxury Crest',
    symbol: 'luxury-crest',
  },
  {
    name: 'Verde Botanics',
    slogan: '100% Cold-Pressed Organic',
    industry: 'Health & Eco',
    paletteId: 'emerald-mint',
    style: 'Modern Minimalist',
    symbol: 'organic-leaf',
  },
  {
    name: 'Nexus Capital',
    slogan: 'Decentralized Wealth Protocols',
    industry: 'Finance & Legal',
    paletteId: 'nordic-slate',
    style: 'Executive Monogram',
    symbol: 'hex-prism',
  },
  {
    name: 'Kuro Performance',
    slogan: 'Peak Human Conditioning',
    industry: 'Fitness & Sports',
    paletteId: 'crimson-carbon',
    style: 'Abstract Dynamic',
    symbol: 'apex-delta',
  },
  {
    name: 'Artisan Roast',
    slogan: 'Single Origin Speciality Coffee',
    industry: 'Food & Hospitality',
    paletteId: 'sunset-amber',
    style: 'Emblem Seal',
    symbol: 'aperture-iris',
  },
];

export const INDUSTRIES: IndustryOption[] = [
  {
    id: 'tech',
    name: 'Tech & AI',
    tagline: 'SaaS, Software, Cyber, Hardware',
    defaultSymbol: 'quantum-orbit',
    paletteId: 'electric-cobalt',
    sampleBrand: 'Kortex AI',
    sampleSlogan: 'Intelligent Enterprise Cloud',
  },
  {
    id: 'luxury',
    name: 'Luxury & Fashion',
    tagline: 'Apparel, Jewelry, Cosmetics, Fragrance',
    defaultSymbol: 'luxury-crest',
    paletteId: 'royal-gold',
    sampleBrand: 'Aura Atelier',
    sampleSlogan: 'Paris · Milano · New York',
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    tagline: 'Medical, Organic, Spa, Supplements',
    defaultSymbol: 'organic-leaf',
    paletteId: 'emerald-mint',
    sampleBrand: 'PureBio',
    sampleSlogan: 'Botanical Cellular Science',
  },
  {
    id: 'finance',
    name: 'Finance & Legal',
    tagline: 'Fintech, VC, Wealth, Accounting',
    defaultSymbol: 'shield-vanguard',
    paletteId: 'nordic-slate',
    sampleBrand: 'Vanguard Partners',
    sampleSlogan: 'Global Private Equity',
  },
  {
    id: 'food',
    name: 'Food & Beverage',
    tagline: 'Restaurants, Cafés, Bakeries, Spirits',
    defaultSymbol: 'zenith-sun',
    paletteId: 'sunset-amber',
    sampleBrand: 'Sol & Fire',
    sampleSlogan: 'Wood-Fired Kitchen & Bar',
  },
  {
    id: 'fitness',
    name: 'Fitness & Athletics',
    tagline: 'Gyms, Crossfit, Performance Wear',
    defaultSymbol: 'apex-delta',
    paletteId: 'crimson-carbon',
    sampleBrand: 'Titan Peak',
    sampleSlogan: 'Uncompromising Strength',
  },
  {
    id: 'realestate',
    name: 'Real Estate & Living',
    tagline: 'Architecture, Interior, Developments',
    defaultSymbol: 'architect-pillar',
    paletteId: 'nordic-slate',
    sampleBrand: 'Sovereign Living',
    sampleSlogan: 'Architectural Residences',
  },
  {
    id: 'creative',
    name: 'Creative & Media',
    tagline: 'Studios, Production, Marketing, Art',
    defaultSymbol: 'infinity-ribbon',
    paletteId: 'cyber-violet',
    sampleBrand: 'Prism Collective',
    sampleSlogan: 'Digital Cinema & Brand Vision',
  },
];

export const STYLE_OPTIONS = [
  { id: 'all', name: 'All Styles', description: 'Curated mix of all design styles' },
  { id: 'minimal', name: 'Modern Minimalist', description: 'Clean lines, geometric simplicity, balanced air' },
  { id: 'tech', name: 'Futuristic Tech', description: 'Neon gradients, angular nodes, cyber precision' },
  { id: 'luxury', name: 'Luxury Crest & Serif', description: 'Royal laurels, shields, high-fashion typography' },
  { id: 'monogram', name: 'Executive Monogram', description: 'Architectural initial lockups and wax seals' },
  { id: 'abstract', name: 'Abstract Geometric', description: 'Optical illusions, ribbon loops, sacred geometry' },
  { id: 'wordmark', name: 'Editorial Wordmark', description: 'High-contrast typography with custom accent glyph' },
];

export const FONT_OPTIONS = [
  { id: 'sans', name: 'Graphik Sans', family: "var(--font-graphik), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { id: 'serif', name: 'Cinzel Serif', family: "Playfair Display, Didot, 'Bodoni MT', Georgia, serif" },
  { id: 'mono', name: 'Tech Monospace', family: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
  { id: 'geometric', name: 'Futuristic Geometric', family: "Impact, Montserrat, 'Arial Black', sans-serif" },
  { id: 'display', name: 'Luxury Modern', family: "'Cinzel', 'Trajan Pro', Georgia, serif" },
];

// Helper to get initials
export function getBrandInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || 'TW';
}

// Generate Standalone Vector SVG code
export function generateSvgCode({
  variant,
  text,
  slogan,
  primaryColor,
  accentColor,
  bgColor = '#ffffff',
  isTransparent = false,
  symbolId = 'quantum-orbit',
}: {
  variant: LogoLayoutType;
  text: string;
  slogan?: string;
  primaryColor: string;
  accentColor: string;
  bgColor?: string;
  isTransparent?: boolean;
  symbolId?: string;
}): string {
  const initials = getBrandInitials(text || 'Logo');
  const safeText = (text || 'Your Brand').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSlogan = (slogan || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').toUpperCase();

  const bgRect = isTransparent ? '' : `<rect width="800" height="800" fill="${bgColor}" />`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${accentColor}" />
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="${primaryColor}" flood-opacity="0.25" />
    </filter>
  </defs>
  ${bgRect}
  <!-- Brand Symbol -->
  <g transform="translate(330, 240) scale(1.4)">
    <circle cx="50" cy="50" r="46" fill="url(#brandGrad)" filter="url(#softGlow)" />
    <text x="50" y="58" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="1">${initials}</text>
  </g>
  <!-- Brand Typography -->
  <text x="400" y="470" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="44" fill="${primaryColor}" letter-spacing="2">${safeText}</text>
  ${safeSlogan ? `<text x="400" y="520" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="14" fill="${accentColor}" letter-spacing="8" opacity="0.85">${safeSlogan}</text>` : ''}
</svg>`;
}

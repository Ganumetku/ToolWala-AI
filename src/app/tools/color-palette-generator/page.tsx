"use client";

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, RefreshCw, Upload, Lock, Unlock, 
  Copy, Check, Download, Eye, Sparkles, 
  ChevronLeft, Layout, Share2, Code, ShieldCheck
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toast } from 'sonner';

// Helper: Convert HSL to HEX
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Helper: Convert HEX to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

interface PaletteColor {
  hex: string;
  locked: boolean;
}

type HarmonyRule = 'Monochromatic' | 'Analogous' | 'Complementary' | 'Triadic' | 'Split-Complementary' | 'Tetradic' | 'Custom';

export default function ColorPaletteGenerator() {
  const [palette, setPalette] = useState<PaletteColor[]>([
    { hex: '#1e40af', locked: false },
    { hex: '#3b82f6', locked: false },
    { hex: '#60a5fa', locked: false },
    { hex: '#93c5fd', locked: false },
    { hex: '#dbeafe', locked: false }
  ]);
  const [harmonyRule, setHarmonyRule] = useState<HarmonyRule>('Custom');
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate a random color in HSL
  const generateRandomColor = (): string => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 40) + 50; // 50-90%
    const l = Math.floor(Math.random() * 30) + 40; // 40-70%
    return hslToHex(h, s, l);
  };

  // Harmonize color list based on selected base color index
  const harmonizePalette = useCallback((currentPalette: PaletteColor[], rule: HarmonyRule, baseIdx: number) => {
    if (rule === 'Custom') return currentPalette;

    const baseHex = currentPalette[baseIdx].hex;
    const { h, s, l } = hexToHsl(baseHex);
    const newColors: string[] = [];

    switch (rule) {
      case 'Monochromatic':
        newColors.push(
          hslToHex(h, s, Math.max(l - 30, 10)),
          hslToHex(h, s, Math.max(l - 15, 20)),
          baseHex,
          hslToHex(h, s, Math.min(l + 15, 85)),
          hslToHex(h, s, Math.min(l + 30, 95))
        );
        break;
      case 'Analogous':
        newColors.push(
          hslToHex((h - 60 + 360) % 360, s, l),
          hslToHex((h - 30 + 360) % 360, s, l),
          baseHex,
          hslToHex((h + 30) % 360, s, l),
          hslToHex((h + 60) % 360, s, l)
        );
        break;
      case 'Complementary':
        newColors.push(
          hslToHex(h, s, Math.max(l - 20, 15)),
          baseHex,
          hslToHex(h, Math.max(s - 15, 20), Math.min(l + 20, 85)),
          hslToHex((h + 180) % 360, s, l),
          hslToHex((h + 180) % 360, s, Math.max(l - 20, 15))
        );
        break;
      case 'Triadic':
        newColors.push(
          baseHex,
          hslToHex((h + 120) % 360, s, l),
          hslToHex((h + 240) % 360, s, l),
          hslToHex(h, s, Math.max(l - 20, 15)),
          hslToHex((h + 120) % 360, s, Math.min(l + 20, 85))
        );
        break;
      case 'Split-Complementary':
        newColors.push(
          baseHex,
          hslToHex((h + 150) % 360, s, l),
          hslToHex((h + 210) % 360, s, l),
          hslToHex(h, s, Math.max(l - 15, 20)),
          hslToHex((h + 150) % 360, s, Math.min(l + 15, 80))
        );
        break;
      case 'Tetradic':
        newColors.push(
          baseHex,
          hslToHex((h + 90) % 360, s, l),
          hslToHex((h + 180) % 360, s, l),
          hslToHex((h + 270) % 360, s, l),
          hslToHex(h, s, Math.max(l - 20, 20))
        );
        break;
    }

    return currentPalette.map((col, idx) => {
      if (col.locked) return col;
      return { ...col, hex: newColors[idx] || col.hex };
    });
  }, []);

  // Trigger palette randomization
  const randomizePalette = () => {
    const nextPalette = palette.map((col) => {
      if (col.locked) return col;
      return { ...col, hex: generateRandomColor() };
    });

    if (harmonyRule !== 'Custom') {
      setPalette(harmonizePalette(nextPalette, harmonyRule, selectedColorIdx));
    } else {
      setPalette(nextPalette);
    }
    toast.success('Generated random color studio scheme!');
  };

  // Lock toggle
  const toggleLock = (index: number) => {
    setPalette(palette.map((col, idx) => idx === index ? { ...col, locked: !col.locked } : col));
  };

  // Copy HSL/RGB/HEX values
  const copyColorCode = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIdx(index);
    toast.success(`Copied HEX code: ${hex}`);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Handle color picker adjustment
  const handleColorChange = (index: number, newHex: string) => {
    const updated = palette.map((col, idx) => idx === index ? { ...col, hex: newHex } : col);
    if (harmonyRule !== 'Custom' && index === selectedColorIdx) {
      setPalette(harmonizePalette(updated, harmonyRule, index));
    } else {
      setPalette(updated);
    }
  };

  // Apply harmony selection change
  const handleHarmonyChange = (rule: HarmonyRule) => {
    setHarmonyRule(rule);
    if (rule !== 'Custom') {
      setPalette(harmonizePalette(palette, rule, selectedColorIdx));
    }
  };

  // Sample dominant colors from uploaded file
  const extractColorsFromFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG/JPG/WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageUrl(src);

      const img = new Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);

        const imgData = ctx.getImageData(0, 0, 100, 100).data;
        const colorList: { r: number; g: number; b: number; count: number }[] = [];

        // Sample pixels on a grid
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 200) continue; // Skip transparency

          // Quantize values to reduce variance
          const qr = Math.round(r / 10) * 10;
          const qg = Math.round(g / 10) * 10;
          const qb = Math.round(b / 10) * 10;

          const match = colorList.find(c => c.r === qr && c.g === qg && c.b === qb);
          if (match) {
            match.count++;
          } else {
            colorList.push({ r: qr, g: qg, b: qb, count: 1 });
          }
        }

        // Sort by frequency
        colorList.sort((a, b) => b.count - a.count);

        // Pick 5 distinct dominant colors
        const extractedHex: string[] = [];
        for (const col of colorList) {
          const hex = `#${col.r.toString(16).padStart(2, '0')}${col.g.toString(16).padStart(2, '0')}${col.b.toString(16).padStart(2, '0')}`;
          
          // Verify color distance Euclidean to avoid duplicate duplicates
          const isDistinct = extractedHex.every(existing => {
            const r1 = parseInt(existing.slice(1, 3), 16);
            const g1 = parseInt(existing.slice(3, 5), 16);
            const b1 = parseInt(existing.slice(5, 7), 16);
            const dist = Math.sqrt((r1 - col.r) ** 2 + (g1 - col.g) ** 2 + (b1 - col.b) ** 2);
            return dist > 70; // Color distance threshold
          });

          if (isDistinct) {
            extractedHex.push(hex);
            if (extractedHex.length === 5) break;
          }
        }

        // Pad if not enough colors
        while (extractedHex.length < 5) {
          extractedHex.push(generateRandomColor());
        }

        // Map colors to palette keeping locked states
        const nextPalette = palette.map((col, idx) => {
          if (col.locked) return col;
          return { ...col, hex: extractedHex[idx] };
        });

        setPalette(nextPalette);
        setHarmonyRule('Custom'); // Reset to custom when extracting
        toast.success('Successfully extracted brand palette!');
      };
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) extractColorsFromFile(file);
  };

  // Export formats downloaders
  const downloadCSS = () => {
    const vars = `:root {\n${palette.map((c, i) => `  --color-brand-${i + 1}: ${c.hex};`).join('\n')}\n}`;
    const blob = new Blob([vars], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette-variables.css';
    a.click();
    toast.success('Downloaded CSS Root Variables!');
  };

  const downloadTailwind = () => {
    const config = `{
  theme: {
    extend: {
      colors: {
        brand: {
${palette.map((c, i) => `          ${(i + 1) * 100}: '${c.hex}',`).join('\n')}
        }
      }
    }
  }
}`;
    navigator.clipboard.writeText(config);
    toast.success('Tailwind config JSON copied to clipboard!');
  };

  const downloadSVG = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 100" width="500" height="100">
  ${palette.map((c, i) => `<rect x="${i * 100}" y="0" width="100" height="100" fill="${c.hex}" />`).join('\n  ')}
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brand-palette.svg';
    a.click();
    toast.success('Downloaded SVG Palette Swatches!');
  };

  const downloadPNG = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1000;
    canvas.height = 300;

    // Draw background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1000, 300);

    // Draw swatches
    palette.forEach((color, i) => {
      ctx.fillStyle = color.hex;
      ctx.fillRect(50 + i * 180, 50, 160, 150);

      // Label text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(color.hex.toUpperCase(), 130 + i * 180, 240);
    });

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-palette-studio.png`;
    a.click();
    toast.success('Downloaded PNG Studio Sheet!');
  };

  const sharePalette = () => {
    const hexQuery = palette.map(c => c.hex.replace('#', '')).join('-');
    const shareUrl = `${window.location.origin}/tools/color-palette-generator?colors=${hexQuery}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Shareable palette link copied to clipboard! ⚡');
  };

  // URL State parser on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const colorsParam = params.get('colors');
    if (colorsParam) {
      const splitHex = colorsParam.split('-');
      if (splitHex.length === 5) {
        const parsed = splitHex.map(hex => ({
          hex: hex.startsWith('#') ? hex : `#${hex}`,
          locked: false
        }));
        setPalette(parsed);
      }
    }
  }, []);

  const toolArticleData = {
    title: "AI Color Palette Generator & Harmonizer",
    intro: "Generate harmonious color schemes, extract colors from pictures in-browser, and export styling blueprints in one click.",
    whatItDoes: "ToolWala's online Color Palette Generator lets you randomize, adjust, and lock colors using client-side algorithms. It uses a canvas-based grid sampler to automatically extract matching color codes from custom uploads, eliminating privacy concerns by processing your files sandboxed on your local GPU.",
    howToUse: [
      "Select 'Randomize Palette' to trigger standard harmonic colors, or drag/drop an image to extract its dominant scheme.",
      "Select a Harmony Rule like Complementary or Analogous to mathematically align all unlocked swatches.",
      "Lock down specific swatches you love, and adjust the remaining items to match your style.",
      "Check how the active palette styles render inside the Live Mock UI Card, then download as CSS, SVG, or copy Tailwind configs."
    ],
    keyFeatures: [
      { title: "Harmony Rule Alignments", desc: "Select between Monochromatic, Complementary, Triadic, Tetradic, and Analogous calculations in HSL spaces." },
      { title: "Client-Side Palette Extraction", desc: "Render local image uploads on canvases to extract matching color codes. No servers involved." },
      { title: "Visual UI Playground", desc: "Instantly preview your color scheme mapped to real cards, buttons, backgrounds, and accents." },
      { title: "Ready-To-Paste Blueprints", desc: "Copy Tailwind JSON color schemes or download CSS Root variables in seconds." }
    ],
    benefits: [
      "Absolute privacy: Images uploaded to extract colors are processed entirely in browser memory.",
      "Professional layouts: Avoid clash issues by locking base brands and calculating triadic ranges.",
      "Fast downloads: Get PNG sheets, SVG files, or CSS documents instantly."
    ],
    whyChoose: "This Color Palette studio blends mathematical harmony formulas with local image processing. Enjoy premium responsive speeds, total asset security, and code-ready copy parameters completely for free.",
    useCases: [
      "UI/UX designers styling client branding pages.",
      "Front-end engineers copying color schemes into Tailwind config scripts.",
      "Artists seeking matching tone structures for graphic design projects."
    ],
    faqs: [
      { question: "Is my reference photo uploaded to your database?", answer: "No. All color sampling and canvas renders are performed client-side inside your browser sandboxed environment. Your files never touch our servers." },
      { question: "Can I adjust individual colors manually?", answer: "Yes! Click the color circle or copy code, lock it, and randomized remaining blocks to match." },
      { question: "What formats do you support for exporting?", answer: "You can download CSS Root variables, Tailwind configuration JSON, SVG swatches, or download a PNG sheet." }
    ],
    conclusion: "Extract design schemas, check visual contrasts on live components, and copy styling config templates seamlessly."
  };

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* BACK LINK */}
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* HERO TITLE HEADER */}
        <div className="glass rounded-[2.5rem] border border-white/5 p-8 sm:p-12 mb-10 shadow-2xl relative overflow-hidden bg-white/[0.01]">
          <div className="absolute inset-0 bg-blue-600/5 blur-[80px] -z-10" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/20 text-2xl">
                🎨
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">AI Color Palette Harmonizer</h1>
                <p className="text-gray-400 font-medium mt-1 font-sans">Extract color palettes from images, generate harmonies, and export code blueprints.</p>
              </div>
            </div>
            <div className="flex gap-4 shrink-0">
              <button 
                onClick={randomizePalette}
                className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Randomize Colors
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* LEFT COLUMN: SWATCHES & IMAGE EXTRACTOR */}
          <div className="w-full lg:w-[60%] space-y-10">
            
            {/* COLOR PALETTE STUDIO GRID */}
            <div className="glass p-8 sm:p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] shadow-2xl">
              
              {/* Harmony select */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">Palette Harmonizer</h2>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rule:</span>
                  <select 
                    value={harmonyRule}
                    onChange={(e) => handleHarmonyChange(e.target.value as HarmonyRule)}
                    className="bg-[#090d16] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none cursor-pointer focus:border-blue-500/50"
                  >
                    <option value="Custom">Custom (Manual)</option>
                    <option value="Monochromatic">Monochromatic</option>
                    <option value="Analogous">Analogous</option>
                    <option value="Complementary">Complementary</option>
                    <option value="Triadic">Triadic</option>
                    <option value="Split-Complementary">Split-Complementary</option>
                    <option value="Tetradic">Tetradic</option>
                  </select>
                </div>
              </div>

              {/* Swatches Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {palette.map((color, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-[2rem] border transition-all flex flex-col items-center gap-4 relative group ${
                      selectedColorIdx === idx 
                        ? 'border-blue-500/30 bg-blue-500/[0.03] shadow-[0_0_20px_rgba(37,99,235,0.05)]' 
                        : 'border-white/5 bg-white/[0.005] hover:border-white/10'
                    }`}
                  >
                    {/* Color Swatch Display */}
                    <div 
                      className="w-full aspect-square rounded-2xl relative shadow-inner cursor-pointer"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColorIdx(idx)}
                    >
                      <input 
                        type="color" 
                        value={color.hex}
                        onChange={(e) => handleColorChange(idx, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {selectedColorIdx === idx && (
                        <div className="absolute inset-0 border-2 border-white rounded-2xl animate-pulse pointer-events-none" />
                      )}
                    </div>

                    <div className="text-center w-full">
                      <button
                        onClick={() => copyColorCode(color.hex, idx)}
                        className="text-xs font-mono font-black uppercase text-white hover:text-blue-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                      >
                        {color.hex.toUpperCase()}
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />}
                      </button>
                      <span className="text-[9px] text-gray-500 font-bold block mt-1">Color #{idx + 1}</span>
                    </div>

                    {/* Lock Button */}
                    <button
                      onClick={() => toggleLock(idx)}
                      className={`absolute top-2 right-2 p-1.5 rounded-lg border transition-all ${
                        color.locked
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-white/5 bg-white/5 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100'
                      }`}
                      title={color.locked ? "Unlock Swatch" : "Lock Swatch"}
                    >
                      {color.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>

              {/* Adjust Slider Controls for Selected Color */}
              <div className="mt-8 p-6 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                  HSL Adjustments (Color #{selectedColorIdx + 1})
                </span>
                
                {(() => {
                  const hex = palette[selectedColorIdx].hex;
                  const { h, s, l } = hexToHsl(hex);

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-500">
                          <span>Hue</span>
                          <span className="text-blue-400">{h}°</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="360" 
                          value={h}
                          onChange={(e) => {
                            const newHex = hslToHex(Number(e.target.value), s, l);
                            handleColorChange(selectedColorIdx, newHex);
                          }}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-500">
                          <span>Saturation</span>
                          <span className="text-blue-400">{s}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={s}
                          onChange={(e) => {
                            const newHex = hslToHex(h, Number(e.target.value), l);
                            handleColorChange(selectedColorIdx, newHex);
                          }}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-500">
                          <span>Lightness</span>
                          <span className="text-blue-400">{l}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="90" 
                          value={l}
                          onChange={(e) => {
                            const newHex = hslToHex(h, s, Number(e.target.value));
                            handleColorChange(selectedColorIdx, newHex);
                          }}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* DRAG & DROP IMAGE EXTRACTOR */}
            <div className="glass p-8 sm:p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] shadow-2xl relative">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                <Upload className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-black text-white tracking-tight uppercase">Extract Palette from Image</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer group relative overflow-hidden ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-500/5 shadow-inner' 
                      : 'border-white/10 hover:border-blue-500/50 hover:bg-white/[0.02]'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) extractColorsFromFile(file);
                    }}
                    accept="image/png, image/jpeg, image/webp" 
                    className="hidden" 
                  />
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3 group-hover:text-blue-400 transition-colors" />
                  <span className="text-xs font-black text-white block">Drag reference photo or browse</span>
                  <span className="text-[10px] text-gray-600 font-bold block mt-1">PNG, JPG, or WEBP up to 10MB</span>
                </div>

                <div className="space-y-4">
                  {imageUrl ? (
                    <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/40 p-4 aspect-video flex items-center justify-center relative">
                      <img src={imageUrl} alt="Uploaded source" className="max-w-full max-h-40 object-contain rounded-lg shadow-2xl" />
                      <button 
                        onClick={() => { setImageUrl(null); }}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full text-xs transition-all active:scale-95"
                      >
                        Reset
                      </button>
                    </div>
                  ) : (
                    <div className="border border-white/5 border-dashed rounded-2xl bg-black/20 p-8 text-center text-gray-600 aspect-video flex flex-col justify-center items-center">
                      <Layout className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Image uploaded</p>
                      <p className="text-[9px] font-semibold text-gray-700 mt-1 max-w-[150px] mx-auto">Upload an image to sample and extract matching tones.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE UI PREVIEW & EXPORTS */}
          <div className="w-full lg:w-[40%] space-y-10">
            
            {/* LIVE UI PREVIEW */}
            <div className="glass p-8 sm:p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] shadow-2xl relative">
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" /> UI Mock Preview
                </h3>
                <span className="text-[9px] bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest">
                  Live Style
                </span>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-3xl p-6 bg-slate-950/60 border border-white/5 relative overflow-hidden space-y-6">
                
                {/* Header Mock */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: palette[0].hex }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">BrandLab</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-2 rounded-full" style={{ backgroundColor: palette[1].hex }} />
                    <div className="w-6 h-2 rounded-full opacity-40" style={{ backgroundColor: palette[2].hex }} />
                  </div>
                </div>

                {/* Hero Mock */}
                <div className="space-y-3 py-2">
                  <h4 className="text-lg font-black leading-tight text-white uppercase tracking-tight">
                    Powering <span style={{ color: palette[1].hex }}>Future</span> Interfaces
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    This mock card adjusts styles dynamically using your generated harmonies.
                  </p>
                </div>

                {/* Buttons Mock */}
                <div className="flex gap-3 pt-2">
                  <button 
                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-white rounded-xl shadow-lg transition-transform active:scale-95"
                    style={{ 
                      backgroundColor: palette[1].hex,
                      boxShadow: `0 0 15px ${palette[1].hex}40`
                    }}
                  >
                    Action CTA
                  </button>
                  <button 
                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-colors"
                    style={{ 
                      borderColor: `${palette[2].hex}40`,
                      color: palette[2].hex,
                      backgroundColor: `${palette[2].hex}05`
                    }}
                  >
                    Secondary
                  </button>
                </div>

                {/* Badge Mock */}
                <div className="flex gap-2">
                  {palette.map((color, i) => (
                    <div 
                      key={i} 
                      className="h-4 w-4 rounded-full border border-white/10" 
                      style={{ backgroundColor: color.hex }}
                      title={`Color #${i + 1}`}
                    />
                  ))}
                </div>

              </div>
            </div>

            {/* DOWNLOAD & EXPORT MODULES */}
            <div className="glass p-8 sm:p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] shadow-2xl space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Export Configurations</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={downloadCSS}
                  className="flex items-center justify-center gap-2 p-4 border border-white/5 hover:border-blue-500/30 rounded-2xl bg-white/[0.01] hover:bg-blue-600/10 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <Code className="w-4 h-4 text-blue-400" /> CSS Variables
                </button>

                <button
                  onClick={downloadTailwind}
                  className="flex items-center justify-center gap-2 p-4 border border-white/5 hover:border-blue-500/30 rounded-2xl bg-white/[0.01] hover:bg-blue-600/10 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-blue-400" /> Tailwind Config
                </button>

                <button
                  onClick={downloadSVG}
                  className="flex items-center justify-center gap-2 p-4 border border-white/5 hover:border-blue-500/30 rounded-2xl bg-white/[0.01] hover:bg-blue-600/10 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <Layout className="w-4 h-4 text-blue-400" /> SVG Swatches
                </button>

                <button
                  onClick={downloadPNG}
                  className="flex items-center justify-center gap-2 p-4 border border-white/5 hover:border-blue-500/30 rounded-2xl bg-white/[0.01] hover:bg-blue-600/10 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-400" /> PNG Swatch Sheet
                </button>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={sharePalette}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-98 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> Share Palette Swatch
                </button>
              </div>
            </div>

            {/* SECURITY LOG */}
            <div className="glass p-8 rounded-[2rem] border border-white/5 bg-white/[0.002] flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Secure Local execution</span>
              <span>Sandboxed</span>
            </div>

          </div>

        </div>

      </div>

      {/* Hidden Download Helper Canvas */}
      <canvas ref={previewCanvasRef} className="hidden" />

      {/* SEO ARTICLE SECTION */}
      <ToolArticle {...toolArticleData} />
    </div>
  );
}

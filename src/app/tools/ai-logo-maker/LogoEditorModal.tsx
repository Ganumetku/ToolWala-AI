"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import JSZip from 'jszip';
import {
  X,
  Download,
  Sparkles,
  Type,
  Palette,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Package,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  FileCode,
} from 'lucide-react';
import { toast } from 'sonner';
import { LogoRenderer } from './LogoRenderer';
import { VectorSymbol, SYMBOL_CATALOG } from './LogoSymbols';
import {
  LogoConcept,
  LogoLayoutType,
  FONT_OPTIONS,
  DESIGNER_PALETTES,
  generateSvgCode,
} from './logoEngine';

interface LogoEditorModalProps {
  initialConcept: LogoConcept;
  brandName: string;
  slogan?: string;
  onClose: () => void;
}

export function LogoEditorModal({
  initialConcept,
  brandName: initialBrandName,
  slogan: initialSlogan,
  onClose,
}: LogoEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'symbol' | 'color' | 'effects'>('text');

  // Editable state
  const [brandName, setBrandName] = useState(initialBrandName || 'Your Brand');
  const [slogan, setSlogan] = useState(initialSlogan || '');
  const [layout, setLayout] = useState<LogoLayoutType>(initialConcept.layout);
  const [symbolId, setSymbolId] = useState(initialConcept.symbolId || 'quantum-orbit');
  const [fontFamily, setFontFamily] = useState(initialConcept.fontFamily);
  const [fontSize, setFontSize] = useState(initialConcept.fontSize || 36);
  const [letterSpacing, setLetterSpacing] = useState(initialConcept.letterSpacing || 1);
  const [symbolScale, setSymbolScale] = useState(initialConcept.symbolScale || 1);
  const [primaryColor, setPrimaryColor] = useState(initialConcept.primaryColor);
  const [accentColor, setAccentColor] = useState(initialConcept.accentColor);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isTransparent, setIsTransparent] = useState(false);
  const [uppercase, setUppercase] = useState(initialConcept.uppercase);
  const [shadow, setShadow] = useState(initialConcept.shadow);
  const [frameShape, setFrameShape] = useState<'none' | 'circle' | 'squircle' | 'hexagon' | 'shield'>(
    initialConcept.frameShape || 'none'
  );

  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Quick swap colors
  const swapColors = () => {
    const temp = primaryColor;
    setPrimaryColor(accentColor);
    setAccentColor(temp);
  };

  // Download High-Res PNG
  const downloadPng = async (transparent = false) => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    const toastId = toast.loading(transparent ? 'Rendering transparent PNG…' : 'Generating high-res PNG…');

    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: transparent ? undefined : bgColor,
      });

      const link = document.createElement('a');
      const filename = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'logo'}-${
        transparent ? 'transparent' : 'hq'
      }.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toast.success(transparent ? 'Transparent PNG downloaded!' : 'High-res PNG downloaded!', {
        id: toastId,
      });
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export image', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  // Download Vector SVG
  const downloadSvg = () => {
    try {
      const svgString = generateSvgCode({
        variant: layout,
        text: brandName,
        slogan,
        primaryColor,
        accentColor,
        bgColor,
        isTransparent,
        symbolId,
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'logo'}-vector.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Vector SVG downloaded successfully!');
    } catch (err) {
      console.error('SVG download failed', err);
      toast.error('Could not download SVG');
    }
  };

  // Download Complete Brand Kit ZIP
  const downloadBrandKit = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    const toastId = toast.loading('Compiling Complete Brand Kit (.ZIP)…');

    try {
      // 1. High-Res PNG
      const primaryDataUrl = await htmlToImage.toPng(canvasRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: bgColor,
      });
      const primaryBase64 = primaryDataUrl.replace(/^data:image\/png;base64,/, '');

      // 2. Transparent PNG
      const transDataUrl = await htmlToImage.toPng(canvasRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: undefined,
      });
      const transBase64 = transDataUrl.replace(/^data:image\/png;base64,/, '');

      // 3. SVG vector code
      const svgCode = generateSvgCode({
        variant: layout,
        text: brandName,
        slogan,
        primaryColor,
        accentColor,
        bgColor,
        isTransparent: false,
        symbolId,
      });

      // 4. Brand Guidelines Text
      const guidelines = `================================================
${brandName.toUpperCase()} - BRAND IDENTITY ASSETS
Generated with ToolWala AI Logo Studio
================================================

BRAND COLORS:
- Primary Color: ${primaryColor.toUpperCase()}
- Accent Color:  ${accentColor.toUpperCase()}
- Background:    ${bgColor.toUpperCase()}

TYPOGRAPHY & HIERARCHY:
- Brand Font:    ${fontFamily}
- Layout Style:  ${layout}
- Symbol Mark:   ${symbolId}
- Letter Spacing: ${letterSpacing}px

INCLUDED FILES:
1. logo-primary.png       (High-Res 3000x3000px display file)
2. logo-transparent.png   (Alpha transparent for websites & print)
3. logo-vector.svg        (Infinite scale vector for Adobe Illustrator & Figma)
4. brand-guidelines.txt   (Palette and typeface specs)

Usage Rights: 100% Free for Commercial & Personal Use.
ToolWala AI · Free Tools for Creators
`;

      const zip = new JSZip();
      zip.file('logo-primary.png', primaryBase64, { base64: true });
      zip.file('logo-transparent.png', transBase64, { base64: true });
      zip.file('logo-vector.svg', svgCode);
      zip.file('brand-guidelines.txt', guidelines);

      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.download = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'brand'}-kit.zip`;
      link.href = zipUrl;
      link.click();
      URL.revokeObjectURL(zipUrl);

      toast.success('Brand Kit (.ZIP) downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('Brand kit error:', err);
      toast.error('Failed to generate Brand Kit ZIP', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Dark backdrop blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Main Studio Modal Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative w-full max-w-6xl h-[92vh] max-h-[850px] bg-white dark:bg-[#0B111E] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden z-10"
      >
        {/* Top Studio Navbar */}
        <header className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Studio Customizer
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                  Vector Engine
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Edit typography, symbols, layout, and download professional vector kits
              </p>
            </div>
          </div>

          {/* Quick Export Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadPng(false)}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Download high-resolution PNG"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Download</span> PNG
            </button>

            <button
              type="button"
              onClick={downloadSvg}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Download scalable vector SVG"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-500" />
              SVG
            </button>

            <button
              type="button"
              onClick={downloadBrandKit}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              title="Download PNG, SVG, Transparent, and Brand Guidelines in a ZIP file"
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download</span> Brand Kit (.ZIP)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors ml-1"
              aria-label="Close customizer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Modal Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Canvas Preview Area */}
          <div className="lg:col-span-7 bg-[#F4F6FB] dark:bg-black/40 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10 relative">
            {/* Canvas Toolbar */}
            <div className="p-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between gap-3 text-xs bg-white/50 dark:bg-slate-900/40 backdrop-blur-xs">
              {/* Background Color Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Canvas:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTransparent(false);
                      setBgColor('#ffffff');
                    }}
                    title="Pure White"
                    className={`w-6 h-6 rounded-md border transition-transform ${
                      !isTransparent && bgColor === '#ffffff'
                        ? 'border-blue-600 scale-110 shadow-xs'
                        : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: '#ffffff' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsTransparent(false);
                      setBgColor('#0B0F19');
                    }}
                    title="Dark Charcoal"
                    className={`w-6 h-6 rounded-md border transition-transform ${
                      !isTransparent && bgColor === '#0B0F19'
                        ? 'border-blue-600 scale-110 shadow-xs'
                        : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: '#0B0F19' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsTransparent(false);
                      setBgColor('#FFFBEB');
                    }}
                    title="Warm Cream"
                    className={`w-6 h-6 rounded-md border transition-transform ${
                      !isTransparent && bgColor === '#FFFBEB'
                        ? 'border-blue-600 scale-110 shadow-xs'
                        : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: '#FFFBEB' }}
                  />
                  <button
                    type="button"
                    onClick={() => setIsTransparent(!isTransparent)}
                    title="Transparent Checkerboard"
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                      isTransparent
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-gray-300 border-slate-300 dark:border-white/10'
                    }`}
                  >
                    Alpha ▨
                  </button>
                </div>
              </div>

              {/* Zoom & Grid toggles */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 rounded-lg border text-xs font-bold ${
                    showGrid
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-200 dark:border-white/10 text-slate-500'
                  }`}
                  title="Toggle alignment grid"
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-slate-500 min-w-[3rem] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Central Canvas Viewport */}
            <div className="flex-1 flex items-center justify-center p-6 relative overflow-auto">
              {/* Optional Alignment Grid */}
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
              )}

              {/* Capture Box */}
              <div
                ref={canvasRef}
                className="transition-transform duration-150 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center p-12 min-w-[340px] sm:min-w-[420px] aspect-square relative"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  backgroundColor: isTransparent ? 'transparent' : bgColor,
                  backgroundImage: isTransparent
                    ? 'repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%) 50% / 20px 20px'
                    : undefined,
                }}
              >
                <LogoRenderer
                  layout={layout}
                  symbolId={symbolId}
                  brandName={brandName}
                  slogan={slogan}
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                  letterSpacing={letterSpacing}
                  symbolScale={symbolScale}
                  uppercase={uppercase}
                  shadow={shadow}
                  frameShape={frameShape}
                  isLarge
                />
              </div>
            </div>
          </div>

          {/* Right Control Suite */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0B111E] flex flex-col min-h-0">
            {/* Tabs */}
            <div className="grid grid-cols-4 border-b border-slate-200 dark:border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                  activeTab === 'text'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-500/5'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Text</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('symbol')}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                  activeTab === 'symbol'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-500/5'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Symbol</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('color')}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                  activeTab === 'color'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-500/5'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Colors</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('effects')}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                  activeTab === 'effects'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-500/5'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Layout</span>
              </button>
            </div>

            {/* Scrollable Control Panels */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* TAB 1: TEXT */}
              {activeTab === 'text' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Apex AI"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                      Tagline / Slogan (Optional)
                    </label>
                    <input
                      type="text"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      placeholder="e.g. Intelligent Cloud Systems"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                      Typography Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Size & Spacing Sliders */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">
                        <span>Font Size</span>
                        <span>{fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="18"
                        max="64"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">
                        <span>Letter Spacing</span>
                        <span>{letterSpacing}px</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="16"
                        value={letterSpacing}
                        onChange={(e) => setLetterSpacing(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Uppercase toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                      All Uppercase Text
                    </span>
                    <button
                      type="button"
                      onClick={() => setUppercase(!uppercase)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        uppercase
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-slate-200 dark:border-white/10 text-slate-500'
                      }`}
                    >
                      {uppercase ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SYMBOL */}
              {activeTab === 'symbol' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-2">
                      Choose Vector Symbol ({SYMBOL_CATALOG.length} Available)
                    </label>
                    <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-200 dark:border-white/10 rounded-2xl">
                      {SYMBOL_CATALOG.map((sym) => {
                        const isSelected = symbolId === sym.id;
                        return (
                          <button
                            key={sym.id}
                            type="button"
                            onClick={() => setSymbolId(sym.id)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-600/20 scale-102 shadow-xs'
                                : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                          >
                            <VectorSymbol
                              symbolId={sym.id}
                              primaryColor={isSelected ? primaryColor : '#64748B'}
                              accentColor={accentColor}
                              size={32}
                            />
                            <span className="text-[10px] font-bold text-slate-700 dark:text-gray-300 truncate w-full text-center">
                              {sym.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">
                      <span>Symbol Scale</span>
                      <span>{Math.round(symbolScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.05"
                      value={symbolScale}
                      onChange={(e) => setSymbolScale(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-2">
                      Symbol Frame
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['none', 'circle', 'squircle', 'shield'] as const).map((shape) => (
                        <button
                          key={shape}
                          type="button"
                          onClick={() => setFrameShape(shape)}
                          className={`py-2 rounded-xl text-xs font-bold border capitalize transition-colors ${
                            frameShape === shape
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300'
                          }`}
                        >
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COLORS */}
              {activeTab === 'color' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                        Primary Color
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-full text-xs font-mono font-bold bg-transparent outline-none uppercase"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                        Accent Color
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                        />
                        <input
                          type="text"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-full text-xs font-mono font-bold bg-transparent outline-none uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={swapColors}
                    className="w-full py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Swap Primary & Accent
                  </button>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-2">
                      Quick Palette Themes
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {DESIGNER_PALETTES.map((pal) => (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() => {
                            setPrimaryColor(pal.primary);
                            setAccentColor(pal.accent);
                          }}
                          className="p-2 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-2 hover:border-blue-500 transition-all text-left"
                        >
                          <div className="flex -space-x-1 shrink-0">
                            <span
                              className="w-4 h-4 rounded-full border border-white"
                              style={{ backgroundColor: pal.primary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-white"
                              style={{ backgroundColor: pal.accent }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-gray-200 truncate">
                            {pal.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LAYOUT & EFFECTS */}
              {activeTab === 'effects' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-2">
                      Layout Paradigm
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'icon-top', name: 'Icon Top (Centered)' },
                        { id: 'icon-left', name: 'Horizontal Lockup' },
                        { id: 'monogram-badge', name: 'Monogram Badge' },
                        { id: 'luxury-crest', name: 'Luxury Crest' },
                        { id: 'bold-wordmark', name: 'Bold Wordmark' },
                        { id: 'tech-gradient', name: 'Tech Gradient Card' },
                        { id: 'minimal-stamp', name: 'Minimal Stamp' },
                        { id: 'stacked-clean', name: 'Stacked Clean' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLayout(item.id as LogoLayoutType)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                            layout === item.id
                              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-600/20 text-blue-600 dark:text-blue-300'
                              : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300'
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                      Glow & Drop Shadow
                    </span>
                    <button
                      type="button"
                      onClick={() => setShadow(!shadow)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        shadow
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-slate-200 dark:border-white/10 text-slate-500'
                      }`}
                    >
                      {shadow ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Export Bar inside modal */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => downloadPng(true)}
                disabled={isExporting}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Transparent PNG
              </button>

              <button
                type="button"
                onClick={downloadBrandKit}
                disabled={isExporting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Package className="w-3.5 h-3.5" /> Full Brand Kit ZIP
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

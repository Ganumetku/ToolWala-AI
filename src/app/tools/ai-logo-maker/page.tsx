"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import {
  Sparkles,
  Type,
  Layout,
  RotateCcw,
  ShieldCheck,
  Heart,
  ChevronRight,
  Download,
  Eye,
  Sliders,
  Check,
  Palette,
  Briefcase,
  Zap,
  Star,
  Globe,
  Rocket,
  Coffee,
  ShoppingBag,
  Box,
  Crown,
  Maximize2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { LogoRenderer } from './LogoRenderer';
import { LogoEditorModal } from './LogoEditorModal';
import { LogoMockups } from './LogoMockups';
import {
  DESIGNER_PALETTES,
  BRAND_PRESETS,
  INDUSTRIES,
  STYLE_OPTIONS,
  LogoConcept,
  LogoLayoutType,
  generateSvgCode,
} from './logoEngine';
import { SYMBOL_CATALOG } from './LogoSymbols';
import PdfToolIcon from '@/components/PdfToolIcon';

const INDUSTRY_ICONS: Record<string, React.ElementType> = {
  tech: Zap,
  luxury: Crown,
  health: Star,
  finance: Box,
  food: Coffee,
  fitness: Rocket,
  realestate: Globe,
  creative: Sparkles,
};

export default function ProfessionalLogoMaker() {
  const [mounted, setMounted] = useState(false);

  // Form Inputs
  const [businessName, setBusinessName] = useState('Apex AI');
  const [tagline, setTagline] = useState('Autonomous Intelligence Systems');
  const [selectedIndustry, setSelectedIndustry] = useState('tech');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedPaletteId, setSelectedPaletteId] = useState('electric-cobalt');
  const [customPrimary, setCustomPrimary] = useState('#2563EB');
  const [customAccent, setCustomAccent] = useState('#06B6D4');
  const [useCustomColors, setUseCustomColors] = useState(false);

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [concepts, setConcepts] = useState<LogoConcept[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'minimal' | 'tech' | 'luxury' | 'monogram' | 'wordmark' | 'favorites'>('all');

  // Modals & Panels
  const [editingConcept, setEditingConcept] = useState<LogoConcept | null>(null);
  const [previewTab, setPreviewTab] = useState<'canvas' | 'mockup'>('canvas');
  const [quickMockupConcept, setQuickMockupConcept] = useState<LogoConcept | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    // Initial generation for pleasant first impression
    generateConceptsInitial('Apex AI', 'Autonomous Intelligence Systems', 'electric-cobalt', 'tech');
  }, []);

  // Compute active colors
  const activePalette = useMemo(() => {
    return DESIGNER_PALETTES.find((p) => p.id === selectedPaletteId) || DESIGNER_PALETTES[0];
  }, [selectedPaletteId]);

  const primaryColor = useCustomColors ? customPrimary : activePalette.primary;
  const accentColor = useCustomColors ? customAccent : activePalette.accent;

  // Initial generator helper
  function generateConceptsInitial(name: string, slog: string, palId: string, indId: string) {
    const pal = DESIGNER_PALETTES.find((p) => p.id === palId) || DESIGNER_PALETTES[0];
    const generated: LogoConcept[] = [];
    const layouts: LogoLayoutType[] = [
      'icon-top',
      'icon-left',
      'monogram-badge',
      'luxury-crest',
      'bold-wordmark',
      'tech-gradient',
      'minimal-stamp',
      'stacked-clean',
    ];
    const symbols = SYMBOL_CATALOG.map((s) => s.id);
    const fonts: ('sans' | 'serif' | 'mono' | 'geometric' | 'display')[] = [
      'sans',
      'serif',
      'mono',
      'geometric',
      'display',
    ];

    for (let i = 0; i < 16; i++) {
      generated.push({
        id: Date.now() + i,
        layout: layouts[i % layouts.length],
        symbolId: symbols[(i * 3 + 1) % symbols.length],
        fontFamily: fonts[i % fonts.length],
        primaryColor: pal.primary,
        accentColor: pal.accent,
        bgColor: '#ffffff',
        fontSize: layouts[i % layouts.length] === 'bold-wordmark' ? 36 : 28,
        letterSpacing: i % 2 === 0 ? 1 : 2,
        symbolScale: 1,
        uppercase: i % 3 === 0,
        shadow: i % 4 === 0,
        frameShape: i % 2 === 0 ? 'none' : 'squircle',
      });
    }
    setConcepts(generated);
  }

  // Generate Concepts
  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!businessName.trim()) {
      toast.error('Please enter a brand name');
      inputRef.current?.focus();
      return;
    }

    setIsGenerating(true);
    setConcepts([]);

    setTimeout(() => {
      const newConcepts: LogoConcept[] = [];
      const layouts: LogoLayoutType[] = [
        'icon-top',
        'icon-left',
        'monogram-badge',
        'luxury-crest',
        'bold-wordmark',
        'tech-gradient',
        'minimal-stamp',
        'stacked-clean',
      ];
      const symbols = SYMBOL_CATALOG.map((s) => s.id);
      const fonts: ('sans' | 'serif' | 'mono' | 'geometric' | 'display')[] = [
        'sans',
        'serif',
        'mono',
        'geometric',
        'display',
      ];

      for (let i = 0; i < 16; i++) {
        newConcepts.push({
          id: Date.now() + i,
          layout: layouts[i % layouts.length],
          symbolId: symbols[(i * 3 + 2) % symbols.length],
          fontFamily: fonts[i % fonts.length],
          primaryColor,
          accentColor,
          bgColor: '#ffffff',
          fontSize: layouts[i % layouts.length] === 'bold-wordmark' ? 36 : 28,
          letterSpacing: i % 2 === 0 ? 1 : 2,
          symbolScale: 1,
          uppercase: i % 3 === 0,
          shadow: i % 4 === 0,
          frameShape: i % 2 === 0 ? 'none' : 'squircle',
        });
      }

      setConcepts(newConcepts);
      setIsGenerating(false);
      toast.success('16 bespoke logo concepts generated!');
    }, 600);
  };

  // Preset quick load
  const loadPreset = (preset: (typeof BRAND_PRESETS)[0]) => {
    setBusinessName(preset.name);
    setTagline(preset.slogan);
    setSelectedPaletteId(preset.paletteId);
    setUseCustomColors(false);

    const indMatch = INDUSTRIES.find((i) => i.name === preset.industry);
    if (indMatch) setSelectedIndustry(indMatch.id);

    generateConceptsInitial(preset.name, preset.slogan, preset.paletteId, indMatch?.id || 'tech');
    toast.success(`Loaded "${preset.name}" preset`);
  };

  // Toggle favorite
  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Quick download individual card PNG
  const quickDownloadPng = async (id: number, transparent = false) => {
    const cardEl = document.getElementById(`logo-render-${id}`);
    if (!cardEl) return;
    const toastId = toast.loading('Exporting logo PNG…');

    try {
      const dataUrl = await htmlToImage.toPng(cardEl, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: transparent ? undefined : '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'logo'}-concept-${id}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Downloaded!', { id: toastId });
    } catch {
      toast.error('Failed to download image', { id: toastId });
    }
  };

  // Quick download SVG
  const quickDownloadSvg = (concept: LogoConcept) => {
    try {
      const svgCode = generateSvgCode({
        variant: concept.layout,
        text: businessName,
        slogan: tagline,
        primaryColor: concept.primaryColor,
        accentColor: concept.accentColor,
        bgColor: '#ffffff',
        isTransparent: false,
        symbolId: concept.symbolId,
      });

      const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'logo'}-vector.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('SVG vector downloaded!');
    } catch {
      toast.error('Failed to export SVG');
    }
  };

  // Filtered concepts
  const filteredConcepts = useMemo(() => {
    if (activeFilter === 'favorites') {
      return concepts.filter((c) => favorites.includes(c.id));
    }
    if (activeFilter === 'minimal') {
      return concepts.filter((c) => c.layout === 'icon-top' || c.layout === 'stacked-clean');
    }
    if (activeFilter === 'luxury') {
      return concepts.filter((c) => c.layout === 'luxury-crest' || c.layout === 'minimal-stamp');
    }
    if (activeFilter === 'tech') {
      return concepts.filter((c) => c.layout === 'tech-gradient' || c.layout === 'icon-left');
    }
    if (activeFilter === 'monogram') {
      return concepts.filter((c) => c.layout === 'monogram-badge');
    }
    if (activeFilter === 'wordmark') {
      return concepts.filter((c) => c.layout === 'bold-wordmark');
    }
    return concepts;
  }, [concepts, activeFilter, favorites]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712]" />;
  }

  return (
    <ToolLayout>
      {/* Studio Hero Banner */}
      <div className="relative rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 shadow-xs p-6 sm:p-8 lg:p-10 mb-8 overflow-hidden">
        {/* Subtle decorative radial glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
            <PdfToolIcon toolId="ai-logo-maker" size="xl" className="shrink-0" />
            <div className="space-y-2 min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-[11px] font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Vector Studio 3.0 · Commercial Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              AI Logo & Brand Identity Studio
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 max-w-2xl font-medium">
              Create bespoke vector logos, luxury emblems, startup wordmarks, and full brand asset kits with zero watermarks.
            </p>
          </div>
        </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Free Forever · Unlimited PNG & SVG</span>
            </div>
          </div>
        </div>

        {/* Quick Trending Brand Presets */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center gap-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Try Sample Brands:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {BRAND_PRESETS.map((bp) => (
              <button
                key={bp.name}
                type="button"
                onClick={() => loadPreset(bp)}
                className="px-3 py-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-2xs"
              >
                {bp.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left Column: Design Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Brand Parameters
              </h2>
              <button
                type="button"
                onClick={() => {
                  setBusinessName('ToolWala');
                  setTagline('Your Files · Your Privacy');
                  setSelectedPaletteId('electric-cobalt');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Reset
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
              {/* 1. Brand Name */}
              <div>
                <label htmlFor="brand-name" className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Brand Name <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="brand-name"
                    ref={inputRef}
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex AI, Velvet & Co."
                    maxLength={32}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* 2. Tagline */}
              <div>
                <label htmlFor="tagline" className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Tagline / Slogan (Optional)
                </label>
                <div className="relative">
                  <Layout className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Modern, Sleek, Intelligent"
                    maxLength={48}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* 3. Industry */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-2">
                  Industry & Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map((ind) => {
                    const Icon = INDUSTRY_ICONS[ind.id] || Zap;
                    const isSelected = selectedIndustry === ind.id;
                    return (
                      <button
                        key={ind.id}
                        type="button"
                        onClick={() => {
                          setSelectedIndustry(ind.id);
                          setSelectedPaletteId(ind.paletteId);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 shadow-2xs font-extrabold'
                            : 'border-slate-200 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.02] text-slate-700 dark:text-gray-300 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-xs truncate">{ind.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Style Architecture */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Design Style Preference
                </label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  {STYLE_OPTIONS.map((st) => (
                    <option key={st.id} value={st.id} className="bg-white dark:bg-slate-900">
                      {st.name} — {st.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Designer Color Palettes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    Designer Color Theme
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCustomColors(!useCustomColors)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    {useCustomColors ? 'Use Presets' : 'Custom Colors'}
                  </button>
                </div>

                {!useCustomColors ? (
                  <div className="grid grid-cols-2 gap-2">
                    {DESIGNER_PALETTES.map((pal) => {
                      const isSelected = selectedPaletteId === pal.id;
                      return (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() => setSelectedPaletteId(pal.id)}
                          className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-600/20 shadow-2xs'
                              : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        >
                          <div className="flex -space-x-1 shrink-0">
                            <span
                              className="w-4 h-4 rounded-full border border-white dark:border-slate-800 shadow-2xs"
                              style={{ backgroundColor: pal.primary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-white dark:border-slate-800 shadow-2xs"
                              style={{ backgroundColor: pal.accent }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300 truncate">
                            {pal.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1">
                        Primary
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customPrimary}
                          onChange={(e) => setCustomPrimary(e.target.value)}
                          className="w-7 h-7 rounded-md cursor-pointer border-none bg-transparent"
                        />
                        <input
                          type="text"
                          value={customPrimary}
                          onChange={(e) => setCustomPrimary(e.target.value)}
                          className="w-full text-xs font-mono font-bold bg-transparent outline-none uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1">
                        Accent
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customAccent}
                          onChange={(e) => setCustomAccent(e.target.value)}
                          className="w-7 h-7 rounded-md cursor-pointer border-none bg-transparent"
                        />
                        <input
                          type="text"
                          value={customAccent}
                          onChange={(e) => setCustomAccent(e.target.value)}
                          className="w-full text-xs font-mono font-bold bg-transparent outline-none uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                <span>{isGenerating ? 'Generating Bespoke Concepts…' : 'Generate 16 Brand Concepts'}</span>
              </button>
            </form>
          </div>

          {/* Privacy Note */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-gray-400">
              <strong className="text-slate-900 dark:text-white font-bold">100% In-Browser Privacy:</strong>{' '}
              All vector geometry is rendered directly in your browser. Nothing is stored, tracked, or sold.
            </p>
          </div>
        </aside>

        {/* Right Column: Studio Showcase & Concepts Grid */}
        <main className="lg:col-span-8 space-y-6">
          {/* Top Filter and Controls Bar */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              {[
                { id: 'all', label: `All (${concepts.length})` },
                { id: 'minimal', label: 'Minimal' },
                { id: 'tech', label: 'Tech' },
                { id: 'luxury', label: 'Luxury' },
                { id: 'monogram', label: 'Monograms' },
                { id: 'wordmark', label: 'Wordmarks' },
                { id: 'favorites', label: `Saved (${favorites.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeFilter === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="text-xs font-bold text-slate-600 dark:text-gray-400 hover:text-blue-600 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>New Variations</span>
            </button>
          </div>

          {/* Concepts Grid / Empty State */}
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              >
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="h-64 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-8 flex flex-col items-center justify-center gap-4 animate-pulse"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5" />
                    <div className="w-36 h-5 rounded-md bg-slate-100 dark:bg-white/5" />
                    <div className="w-20 h-3 rounded-md bg-slate-100 dark:bg-white/5" />
                  </div>
                ))}
              </motion.div>
            ) : filteredConcepts.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              >
                {filteredConcepts.map((concept) => (
                  <div
                    key={concept.id}
                    className="group relative bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/90 dark:border-white/10 p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-blue-500/50 transition-all duration-200 hover:-translate-y-1"
                  >
                    {/* Top Action Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400">
                        {concept.layout.replace('-', ' ')}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQuickMockupConcept(concept)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-white/10 transition-colors"
                          title="View on Real-World Mockups"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(concept.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/10 transition-colors"
                          title={favorites.includes(concept.id) ? 'Remove bookmark' : 'Bookmark logo'}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favorites.includes(concept.id)
                                ? 'fill-red-500 text-red-500'
                                : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Canvas Stage Box */}
                    <div
                      id={`logo-render-${concept.id}`}
                      className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#FAFBFD] to-[#F3F5FA] dark:from-slate-950 dark:to-[#080D1A] border border-slate-200/70 dark:border-white/5 flex items-center justify-center p-6 relative overflow-hidden group-hover:border-blue-500/20 transition-all"
                    >
                      <LogoRenderer
                        layout={concept.layout}
                        symbolId={concept.symbolId}
                        brandName={businessName}
                        slogan={tagline}
                        primaryColor={concept.primaryColor}
                        accentColor={concept.accentColor}
                        fontFamily={concept.fontFamily}
                        fontSize={concept.fontSize}
                        letterSpacing={concept.letterSpacing}
                        uppercase={concept.uppercase}
                        shadow={concept.shadow}
                        frameShape={concept.frameShape}
                      />
                    </div>

                    {/* Card Actions Bottom */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingConcept(concept)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-blue-600 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Studio Editor</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => quickDownloadPng(concept.id, false)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-gray-200 transition-colors"
                        title="Download PNG"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => quickDownloadSvg(concept)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-emerald-600 dark:text-emerald-400 transition-colors font-mono text-xs font-bold"
                        title="Download Vector SVG"
                      >
                        SVG
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              /* If favorites filter is empty or zero results */
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl p-12 text-center space-y-4">
                <Heart className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  No Saved Logos in this filter
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the heart icon on any generated logo concept to bookmark and save it here.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Show All Concepts
                </button>
              </div>
            )}
          </AnimatePresence>

          {/* Interactive Live Brand Mockups Section */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Real-World Brand Simulation
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  See how your logo scales across executive stationery, mobile apps, and websites
                </p>
              </div>
            </div>

            <LogoMockups
              brandName={businessName}
              slogan={tagline}
              primaryColor={primaryColor}
              accentColor={accentColor}
              symbolId="quantum-orbit"
            />
          </div>
        </main>
      </div>

      {/* Studio Editor Modal */}
      <AnimatePresence>
        {editingConcept && (
          <LogoEditorModal
            initialConcept={editingConcept}
            brandName={businessName}
            slogan={tagline}
            onClose={() => setEditingConcept(null)}
          />
        )}
      </AnimatePresence>

      {/* Quick Mockup Modal */}
      <AnimatePresence>
        {quickMockupConcept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickMockupConcept(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white dark:bg-[#0B111E] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Brand Mockups: {businessName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    High-fidelity mockups rendered for your selected concept
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickMockupConcept(null)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <LogoMockups
                brandName={businessName}
                slogan={tagline}
                primaryColor={quickMockupConcept.primaryColor}
                accentColor={quickMockupConcept.accentColor}
                symbolId={quickMockupConcept.symbolId}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SEO Article Section */}
      {toolArticles['ai-logo-maker'] && (
        <ToolArticle {...toolArticles['ai-logo-maker']} />
      )}
    </ToolLayout>
  );
}

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

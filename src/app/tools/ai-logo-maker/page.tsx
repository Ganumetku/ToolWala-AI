"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import {
  Scissors, Home, Dumbbell, Utensils, Code, Shirt,
  CircleDollarSign, GraduationCap, Hexagon,
  Download, RefreshCw, Sparkles, Palette, Briefcase, Frame
} from 'lucide-react';

const INDUSTRIES = [
  "Tech / Software", "Salon / Beauty", "Real Estate", "Gym / Fitness",
  "Restaurant", "Fashion", "Finance", "Education", "Other"
];

const LOGO_STYLES = [
  "Minimal", "Modern", "Luxury", "Tech", "Gaming", "Creative"
];

const LOGO_SHAPES = [
  "Rounded Square", "Circle", "Badge", "Icon Only"
];

const getIconForIndustry = (industry: string) => {
  switch (industry) {
    case "Salon / Beauty": return Scissors;
    case "Real Estate": return Home;
    case "Gym / Fitness": return Dumbbell;
    case "Restaurant": return Utensils;
    case "Tech / Software": return Code;
    case "Fashion": return Shirt;
    case "Finance": return CircleDollarSign;
    case "Education": return GraduationCap;
    default: return Hexagon;
  }
};

export default function AILogoMaker() {
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [industry, setIndustry] = useState('Tech / Software');
  const [style, setStyle] = useState('Modern');
  const [color, setColor] = useState('#2563eb');
  const [shape, setShape] = useState('Rounded Square');

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [seeds, setSeeds] = useState<number[]>([0, 0, 0, 0]);

  const logoRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    setIsGenerating(true);
    setHasGenerated(false);

    // Reset seeds
    setSeeds([0, 0, 0, 0]);

    // Simulate AI generation process
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1200);
  };

  const handleRegenerateSingle = (index: number) => {
    const newSeeds = [...seeds];
    newSeeds[index] = newSeeds[index] + 1;
    setSeeds(newSeeds);
  };

  const downloadLogo = async (index: number) => {
    const node = logoRefs.current[index];
    if (!node) return;

    try {
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1,
        pixelRatio: 4, // High-res download
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${businessName.replace(/\s+/g, '_').toLowerCase()}_logo_v${index + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      alert('Failed to download logo. Please try again.');
    }
  };

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase() || 'L';
  };

  const getShapeClasses = () => {
    switch (shape) {
      case "Circle": return "rounded-full";
      case "Badge": return "rounded-[25%] rotate-3";
      case "Icon Only": return "rounded-xl";
      case "Rounded Square":
      default: return "rounded-2xl";
    }
  };

  const getStyleClasses = () => {
    switch (style) {
      case "Luxury": return "font-serif tracking-widest";
      case "Modern": return "font-sans tracking-tight font-bold";
      case "Tech": return "font-mono tracking-tighter";
      case "Gaming": return "font-sans italic font-black uppercase tracking-wider";
      case "Creative": return "font-sans font-bold lowercase tracking-tight";
      case "Minimal":
      default: return "font-sans font-medium tracking-wide";
    }
  };

  const IconComponent = getIconForIndustry(industry);
  const initials = getInitials(businessName);
  const styleClass = getStyleClasses();

  // Helper to render icon box with variations based on seed
  const renderIconBox = (seedMod: number, size: number = 48) => {
    const mod = seedMod % 3;
    const baseClasses = `flex items-center justify-center p-5 ${getShapeClasses()} transition-all`;

    if (mod === 0) {
      return (
        <div className={baseClasses} style={{ backgroundColor: `${color}15`, color: color }}>
          <IconComponent size={size} strokeWidth={1.5} className={shape === 'Badge' ? '-rotate-3' : ''} />
        </div>
      );
    } else if (mod === 1) {
      return (
        <div className={baseClasses} style={{ backgroundColor: color, color: '#ffffff' }}>
          <IconComponent size={size} strokeWidth={1.5} className={shape === 'Badge' ? '-rotate-3' : ''} />
        </div>
      );
    } else {
      return (
        <div className={`${baseClasses} border-2`} style={{ borderColor: color, color: color, backgroundColor: 'transparent' }}>
          <IconComponent size={size} strokeWidth={1.5} className={shape === 'Badge' ? '-rotate-3' : ''} />
        </div>
      );
    }
  };

  // 4 Distinct Layouts
  const renderLayout1 = (seed: number) => (
    <div className={`flex items-center gap-5 ${styleClass}`}>
      {renderIconBox(seed, 40)}
      <div className="flex flex-col text-left">
        <span className="text-3xl leading-none" style={{ color: '#111827' }}>{businessName}</span>
        {tagline && <span className="text-xs tracking-widest uppercase mt-2 opacity-70" style={{ color: color }}>{tagline}</span>}
      </div>
    </div>
  );

  const renderLayout2 = (seed: number) => (
    <div className={`flex flex-col items-center text-center ${styleClass}`}>
      <div className="mb-5">
        {renderIconBox(seed + 1, 56)}
      </div>
      <span className="text-3xl font-black tracking-tight" style={{ color: '#111827' }}>{businessName}</span>
      {tagline && <span className="text-sm font-semibold uppercase tracking-widest mt-2" style={{ color: '#6B7280' }}>{tagline}</span>}
    </div>
  );

  const renderLayout3 = (seed: number) => {
    const mod = seed % 2;
    return (
      <div className={`flex flex-col items-center text-center ${styleClass}`}>
        <div
          className={`flex items-center justify-center w-24 h-24 mb-5 ${getShapeClasses()} border-4 shadow-sm`}
          style={{
            borderColor: color,
            backgroundColor: mod === 0 ? '#ffffff' : color,
            color: mod === 0 ? color : '#ffffff'
          }}
        >
          <span className={`text-4xl font-black ${shape === 'Badge' ? '-rotate-3' : ''}`}>{initials}</span>
        </div>
        <span className="text-2xl font-bold" style={{ color: '#111827' }}>{businessName}</span>
        {tagline && <span className="text-xs font-semibold uppercase tracking-[0.2em] mt-2 opacity-80" style={{ color: color }}>{tagline}</span>}
      </div>
    );
  };

  const renderLayout4 = (seed: number) => {
    const words = businessName.split(' ');
    const firstPart = words[0];
    const secondPart = words.slice(1).join(' ') || '.';
    const mod = seed % 2;

    return (
      <div className={`flex items-center justify-center gap-3 ${styleClass}`}>
        <span className="text-4xl" style={{ color: '#111827' }}>
          {firstPart}
          <span style={{ color: color, fontWeight: mod === 0 ? '900' : 'normal' }}>
            {secondPart}
          </span>
        </span>
        {shape === "Icon Only" && (
          <IconComponent size={32} style={{ color: color }} />
        )}
      </div>
    );
  };

  const layouts = [renderLayout1, renderLayout2, renderLayout3, renderLayout4];

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <Link href="/tools" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-8 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all tools
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Logo Maker</h1>
                <p className="text-sm text-gray-500">Generate professional, minimalist logos for your brand instantly.</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50/50 flex flex-col lg:flex-row gap-12">
            {/* Input Form */}
            <div className="w-full lg:w-[35%]">
              <form onSubmit={handleGenerate} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline (Optional)</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Innovation First"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-gray-400" /> Industry</label>
                    <div className="relative">
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                      >
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5"><Palette className="w-4 h-4 text-gray-400" /> Style</label>
                    <div className="relative">
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                      >
                        {LOGO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5"><Frame className="w-4 h-4 text-gray-400" /> Shape</label>
                    <div className="relative">
                      <select
                        value={shape}
                        onChange={(e) => setShape(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                      >
                        {LOGO_SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10 w-full rounded-lg cursor-pointer border border-gray-300 p-1 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !businessName.trim()}
                  className="w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Designing Logos...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Logos
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results Area */}
            <div className="w-full lg:w-[65%]">
              {isGenerating ? (
                <div className="h-full min-h-[450px] flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 border-dashed">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                      <Palette className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Crafting your brand identity...</h3>
                  <p className="text-sm text-gray-500">Applying {style.toLowerCase()} style with {color} accents</p>
                </div>
              ) : hasGenerated ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Select your favorite concept</h2>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">4 Professional Concepts</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {layouts.map((LayoutVariant, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:border-blue-400 transition-all shadow-sm hover:shadow-md flex flex-col">
                        <div className="aspect-video w-full relative bg-gray-50 flex flex-col items-center justify-center p-8 overflow-hidden">
                          {/* Subtle background grid */}
                          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

                          {/* The Exportable Logo Node */}
                          <div
                            ref={(el) => { logoRefs.current[idx] = el; }}
                            className="relative w-full h-full flex items-center justify-center bg-white rounded-lg shadow-sm p-4 z-10"
                          >
                            {LayoutVariant(seeds[idx])}
                          </div>
                        </div>

                        <div className="p-4 flex items-center justify-between gap-3 bg-white border-t border-gray-100 mt-auto">
                          <button
                            onClick={() => downloadLogo(idx)}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download High-Res
                          </button>
                          <button
                            onClick={() => handleRegenerateSingle(idx)}
                            className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                            title="Tweak design variant"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[450px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 text-center px-6">
                  <div className="w-20 h-20 mb-4 text-gray-300 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                    <Palette className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-semibold text-lg">Bring your brand to life</h3>
                  <p className="text-sm text-gray-500 mt-2 max-w-sm">Enter your business name and preferences to generate 4 unique, production-ready logo concepts instantly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

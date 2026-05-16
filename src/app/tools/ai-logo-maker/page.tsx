"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import {
  Download, Sparkles, Palette, Briefcase, 
  Search, Filter, Heart, ChevronRight, X,
  Type, Layout, RotateCcw, ArrowLeft,
  Shield, ShieldCheck, Hexagon as HexIcon, Star,
  Smartphone, Zap, Rocket, Globe, Box,
  ShoppingBag, Coffee, Settings, ChevronLeft,
  Trash2, Copy, Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';

// --- DATA ---
const LOGO_STYLES = [
  "Abstract", "Corporate", "Wordmark", "Vintage", "Minimal", 
  "Luxury", "Tech", "Classic", "Mascot", "Emblem"
];

const COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Black', value: '#030712' },
  { name: 'Gold', value: '#fbbf24' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Grayscale', value: '#94a3b8' },
];

const INDUSTRIES = [
  { name: "Tech", icon: Zap },
  { name: "Salon / Beauty", icon: Star },
  { name: "Real Estate", icon: Globe },
  { name: "Fitness", icon: Rocket },
  { name: "Food", icon: Coffee },
  { name: "Fashion", icon: ShoppingBag },
  { name: "Finance", icon: Box },
];

const RECOMMENDED_CHIPS = ["modern", "minimalist", "creative", "luxury", "tech", "abstract"];

// --- LOGO ENGINE TYPES ---
type TemplateType = 'icon-top' | 'icon-left' | 'monogram' | 'badge' | 'wordmark' | 'tech-gradient';

interface LogoVariant {
  id: number;
  type: TemplateType;
  shape?: 'circle' | 'square' | 'hexagon' | 'shield';
  font: string;
  colorScheme: string;
}

export default function ProfessionalLogoMaker() {
  const [mounted, setMounted] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [selectedStyle, setSelectedStyle] = useState('Minimal');
  const [selectedIndustry, setSelectedIndustry] = useState('Tech');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [logos, setLogos] = useState<LogoVariant[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [editingLogo, setEditingLogo] = useState<LogoVariant | null>(null);

  const [editorText, setEditorText] = useState('');
  const [editorSlogan, setEditorSlogan] = useState('');
  const [editorFontSize, setEditorFontSize] = useState(32);
  const [editorLetterSpacing, setEditorLetterSpacing] = useState(0);
  const [editorLogoColor, setEditorLogoColor] = useState('');
  const [editorBgColor, setEditorBgColor] = useState('#ffffff');
  const [editorIconColor, setEditorIconColor] = useState('');
  const [editorFontFamily, setEditorFontFamily] = useState('sans-serif');
  const [showShadow, setShowShadow] = useState(false);
  const [showOutline, setShowOutline] = useState(false);

  const editorPreviewRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateLogos = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!businessName.trim()) {
      setErrorMessage('Enter your business name first');
      inputRef.current?.focus();
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);
    setLogos([]); 

    setTimeout(() => {
      const newLogos: LogoVariant[] = [];
      const types: TemplateType[] = ['icon-top', 'icon-left', 'monogram', 'badge', 'wordmark', 'tech-gradient'];
      const shapes: any[] = ['circle', 'square', 'hexagon', 'shield'];
      const fonts = ['sans-serif', 'serif', 'monospace'];

      for (let i = 0; i < 12; i++) {
        newLogos.push({
          id: Date.now() + i,
          type: types[i % types.length],
          shape: shapes[i % shapes.length],
          font: fonts[i % fonts.length],
          colorScheme: selectedColor
        });
      }
      setLogos(newLogos);
      setIsGenerating(false);
      toast.success("Generated 12 logo concepts!");
    }, 1200);
  };

  const useSample = () => {
    setBusinessName('ToolGPT');
    setKeywords('AI Tech');
    setErrorMessage('');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.trim().slice(0, 2).toUpperCase() || 'TG';
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const openEditor = (logo: LogoVariant) => {
    setEditingLogo(logo);
    setEditorText(businessName);
    setEditorSlogan(keywords || 'The Future of AI');
    setEditorLogoColor(logo.colorScheme);
    setEditorIconColor(logo.colorScheme);
    setEditorFontSize(logo.type === 'wordmark' ? 48 : 32);
    setEditorBgColor('#ffffff');
    setEditorFontFamily(logo.font);
  };

  const downloadLogoAsPNG = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    const promise = async () => {
      const dataUrl = await htmlToImage.toPng(ref.current!, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: editorBgColor || '#ffffff'
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      return "Downloaded";
    };

    toast.promise(promise(), {
      loading: 'Preparing high-res download...',
      success: 'Logo downloaded successfully!',
      error: 'Failed to export logo.'
    });
  };

  const LogoRenderer = ({ variant, text, slogan, color, iconColor, size, spacing, font, shadow, outline, isLarge = false }: any) => {
    const initials = getInitials(text || 'Logo');
    const IndustryIcon = INDUSTRIES.find(i => i.name === selectedIndustry)?.icon || Zap;
    
    const iconStyle = { color: iconColor || color };
    const textStyle = { 
      color: color, 
      fontFamily: font, 
      fontSize: size + 'px', 
      letterSpacing: spacing + 'px',
      textShadow: shadow ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
      WebkitTextStroke: outline ? `1px ${color}` : 'none'
    };

    const renderIcon = () => {
      switch (variant.shape) {
        case 'circle': return <div className="p-4 rounded-full bg-white/5 border border-white/10 shadow-xl"><IndustryIcon size={isLarge ? 80 : 36} style={iconStyle} /></div>;
        case 'hexagon': return <div className="relative flex items-center justify-center"><HexIcon size={isLarge ? 120 : 64} className="text-white/5 fill-white/5" /><div className="absolute"><IndustryIcon size={isLarge ? 60 : 32} style={iconStyle} /></div></div>;
        case 'shield': return <div className="relative flex items-center justify-center"><Shield size={isLarge ? 120 : 64} className="text-white/5 fill-white/5" /><div className="absolute"><IndustryIcon size={isLarge ? 60 : 32} style={iconStyle} /></div></div>;
        default: return <IndustryIcon size={isLarge ? 80 : 36} style={iconStyle} />;
      }
    };

    const layouts = {
      'icon-top': (
        <div className="flex flex-col items-center text-center gap-6">
          {renderIcon()}
          <div className="flex flex-col">
            <h3 className="font-black tracking-tighter" style={textStyle}>{text || 'Your Brand'}</h3>
            {slogan && <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-40 mt-2" style={{ color }}>{slogan}</p>}
          </div>
        </div>
      ),
      'icon-left': (
        <div className="flex items-center gap-6">
          {renderIcon()}
          <div className="flex flex-col">
            <h3 className="font-black tracking-tighter text-left" style={textStyle}>{text || 'Your Brand'}</h3>
            {slogan && <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-40 text-left" style={{ color }}>{slogan}</p>}
          </div>
        </div>
      ),
      'monogram': (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-[2rem] border-4 flex items-center justify-center shadow-2xl bg-white/5 border-current" style={{ color }}>
            <span className="text-4xl font-black">{initials}</span>
          </div>
          <h3 className="font-black tracking-tight" style={{ ...textStyle, fontSize: (size * 0.9) + 'px' }}>{text}</h3>
        </div>
      ),
      'badge': (
        <div className="relative flex items-center justify-center p-16 rounded-[3rem] border-8 border-white/10 bg-[#030712] shadow-2xl" style={{ borderColor: color }}>
          <div className="flex flex-col items-center">
            <IndustryIcon size={32} style={iconStyle} className="mb-4" />
            <h3 className="font-black uppercase tracking-[0.2em]" style={{ ...textStyle, fontSize: (size * 0.8) + 'px' }}>{text}</h3>
            <div className="h-px w-24 bg-white/10 my-4" style={{ backgroundColor: color + '20' }} />
            <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40" style={{ color }}>Premium Quality</p>
          </div>
        </div>
      ),
      'wordmark': (
        <div className="flex flex-col items-center text-center">
          <h3 className="font-black tracking-tighter" style={{ ...textStyle, fontSize: (size * 1.6) + 'px' }}>
            {text?.split(' ')[0]}<span style={{ color: color + '66' }}>{text?.split(' ')[1] || ''}</span>
          </h3>
          {slogan && <div className="mt-4 h-1 w-16 bg-blue-600 rounded-full" style={{ backgroundColor: color }} />}
          {slogan && <p className="text-[11px] font-black uppercase tracking-[0.4em] mt-5" style={{ color }}>{slogan}</p>}
        </div>
      ),
      'tech-gradient': (
        <div className="flex items-center gap-5 p-8 rounded-[2.5rem] bg-[#030712] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-50" />
          <div className="relative z-10 p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20">
            <IndustryIcon size={40} className="text-white" />
          </div>
          <h3 className="relative z-10 text-white font-black tracking-tighter" style={{ ...textStyle, color: '#fff' }}>{text}</h3>
        </div>
      )
    };

    return layouts[variant.type as keyof typeof layouts] || layouts['icon-top'];
  };

  if (!mounted) return <div className="min-h-screen bg-[#030712]" />;

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      {/* --- TOP NAV --- */}
      <div className="container mx-auto max-w-7xl px-4 pt-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>
        <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            V2.0 AI Engine
          </div>
        </div>
      </div>

      {/* --- MAIN INTERFACE --- */}
      <div className="container mx-auto max-w-7xl px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* --- LEFT CONTROL PANEL --- */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="glass rounded-[3rem] p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="font-black uppercase tracking-widest text-sm">Logo Designer</h3>
              </div>

              <form onSubmit={generateLogos} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Brand Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center text-gray-500 group-focus-within:text-blue-500 transition-colors">
                      <Type className="w-5 h-5" />
                    </div>
                    <input 
                      ref={inputRef}
                      type="text" 
                      value={businessName}
                      onChange={e => { setBusinessName(e.target.value); setErrorMessage(''); }}
                      placeholder="e.g. AUJO Tech"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-5 py-5 text-xl font-black text-white focus:border-blue-600/50 outline-none transition-all placeholder:text-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Key Features / Tagline</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center text-gray-500 group-focus-within:text-blue-500 transition-colors">
                      <Layout className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      value={keywords}
                      onChange={e => setKeywords(e.target.value)}
                      placeholder="e.g. Modern, Sleek, AI"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-5 py-5 text-lg font-bold text-white focus:border-blue-600/50 outline-none transition-all placeholder:text-gray-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Industry</label>
                    <select 
                      value={selectedIndustry} 
                      onChange={e => setSelectedIndustry(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm font-black text-white focus:border-blue-600/50 outline-none transition-all"
                    >
                      {INDUSTRIES.map(i => <option key={i.name} value={i.name} className="bg-slate-900">{i.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Style Preference</label>
                    <select 
                      value={selectedStyle} 
                      onChange={e => setSelectedStyle(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm font-black text-white focus:border-blue-600/50 outline-none transition-all"
                    >
                      {LOGO_STYLES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Brand Colors</label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.value)}
                        className={`w-10 h-10 rounded-xl border-4 transition-all shadow-xl active:scale-90 ${
                          selectedColor === c.value ? 'border-blue-600 scale-110' : 'border-white/10'
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isGenerating}
                  className="w-full py-6 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 hover:bg-blue-500 active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] disabled:opacity-30 group"
                >
                  {isGenerating ? <RotateCcw className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  {isGenerating ? 'Designing Concepts...' : 'Generate AI Logos'}
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/5">
              <div className="flex items-center gap-4">
                <Heart className={`w-8 h-8 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest">Favorites</h4>
                  <p className="text-xs text-gray-500 font-bold">{favorites.length} saved ideas</p>
                </div>
              </div>
              <button onClick={useSample} className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl hover:bg-blue-500/20 transition-all uppercase tracking-widest">
                Use Sample
              </button>
            </div>
          </aside>

          {/* --- RIGHT DISPLAY PANEL --- */}
          <main className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                >
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="glass rounded-[3rem] p-10 h-80 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                      <div className="w-24 h-24 bg-white/5 rounded-[2rem] animate-pulse" />
                      <div className="w-40 h-4 bg-white/5 rounded-full animate-pulse" />
                      <div className="absolute inset-0 shimmer opacity-10" />
                    </div>
                  ))}
                </motion.div>
              ) : logos.length > 0 ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                >
                  {logos.map((logo) => (
                    <motion.div 
                      key={logo.id} 
                      whileHover={{ y: -8 }}
                      className="group glass rounded-[3rem] border border-white/5 p-6 transition-all hover:border-blue-500/50 flex flex-col h-[400px] relative overflow-hidden"
                    >
                      {/* Decorative Grid */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                      
                      <div className="flex-1 relative flex items-center justify-center p-12 bg-black/40 rounded-[2.5rem] overflow-hidden border border-white/5">
                        <LogoRenderer variant={logo} text={businessName} slogan={keywords} color={logo.colorScheme} />
                        
                        <button 
                          onClick={() => toggleFavorite(logo.id)}
                          className="absolute top-6 right-6 p-3 rounded-full glass-light opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 hover:text-red-500"
                        >
                          <Heart className={`w-5 h-5 ${favorites.includes(logo.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>

                      <div className="pt-6 px-2">
                        <button 
                          onClick={() => openEditor(logo)}
                          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-[0.98] shadow-2xl"
                        >
                          Studio Editor <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-[4rem] border border-white/5 p-20 shadow-2xl text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[600px]"
                >
                  <div className="absolute inset-0 bg-blue-600/5 blur-[120px]" />
                  <div className="relative z-10">
                    <div className="w-28 h-28 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_60px_rgba(37,99,235,0.4)] rotate-6 border border-white/10">
                      <Sparkles className="w-14 h-14" />
                    </div>
                    <h3 className="text-4xl font-black text-white mb-6 tracking-tighter uppercase">Launch Your Brand Today</h3>
                    <p className="text-gray-500 max-w-sm mb-12 font-medium leading-relaxed">Experience professional AI branding. Enter your brand name and witness dozens of unique concepts designed specifically for your industry.</p>
                    
                    <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
                      <div className="flex items-center gap-3"><Monitor className="w-4 h-4" /> Multi-Format</div>
                      <div className="flex items-center gap-3"><Zap className="w-4 h-4" /> Instant Gen</div>
                      <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4" /> Safe Usage</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* --- STUDIO EDITOR MODAL --- */}
      <AnimatePresence>
        {editingLogo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#030712]/90 backdrop-blur-2xl" 
              onClick={() => setEditingLogo(null)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative bg-[#030712] w-full max-w-6xl rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row border border-white/10 max-h-[90vh]"
            >
              {/* PREVIEW AREA */}
              <div className="flex-1 bg-black/40 flex flex-col items-center justify-center p-12 relative border-r border-white/5">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                
                <div 
                  ref={editorPreviewRef}
                  className="w-full max-w-[450px] aspect-square rounded-[3rem] shadow-2xl flex items-center justify-center p-16 relative overflow-hidden transition-all duration-500"
                  style={{ backgroundColor: editorBgColor }}
                >
                  <LogoRenderer 
                    variant={editingLogo}
                    text={editorText}
                    slogan={editorSlogan}
                    color={editorLogoColor}
                    iconColor={editorIconColor}
                    size={editorFontSize}
                    spacing={editorLetterSpacing}
                    font={editorFontFamily}
                    shadow={showShadow}
                    outline={showOutline}
                    isLarge={true}
                  />
                </div>

                <div className="mt-12 flex flex-wrap gap-6 justify-center">
                  <button 
                    onClick={() => downloadLogoAsPNG(editorPreviewRef, `${editorText || 'logo'}_preview.png`)}
                    className="flex items-center gap-4 bg-white text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-gray-200 transition-all active:scale-95"
                  >
                    <Download className="w-6 h-6" /> Export High-Res PNG
                  </button>
                  <button 
                    onClick={() => setEditingLogo(null)}
                    className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                  >
                    Close Studio
                  </button>
                </div>
              </div>

              {/* CONTROLS AREA */}
              <div className="w-full lg:w-[450px] p-12 overflow-y-auto bg-[#030712] custom-scrollbar">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h3 className="font-black uppercase tracking-widest text-sm">Studio Controls</h3>
                </div>

                <div className="space-y-10">
                  {/* Text */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Brand Name</label>
                      <input 
                        type="text" 
                        value={editorText} 
                        onChange={e => setEditorText(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none font-black text-xl focus:border-blue-600/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Slogan</label>
                      <input 
                        type="text" 
                        value={editorSlogan} 
                        onChange={e => setEditorSlogan(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none font-bold text-sm text-gray-400 focus:border-blue-600/50"
                      />
                    </div>
                  </div>

                  {/* Visuals */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Logo Color</span>
                      <input type="color" value={editorLogoColor} onChange={e => setEditorLogoColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-none" />
                    </div>
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Canvas Bg</span>
                      <input type="color" value={editorBgColor} onChange={e => setEditorBgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-none" />
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Typography</label>
                      <select 
                        value={editorFontFamily} 
                        onChange={e => setEditorFontFamily(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none font-black text-sm appearance-none cursor-pointer"
                      >
                        <option value="sans-serif" className="bg-slate-900">Modern Sans</option>
                        <option value="serif" className="bg-slate-900">Premium Serif</option>
                        <option value="monospace" className="bg-slate-900">Tech Mono</option>
                        <option value="cursive" className="bg-slate-900">Elegant Cursive</option>
                      </select>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <span>Size</span>
                        <span>{editorFontSize}px</span>
                      </div>
                      <input type="range" min="16" max="72" value={editorFontSize} onChange={e => setEditorFontSize(parseInt(e.target.value))} className="w-full accent-blue-600" />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <span>Spacing</span>
                        <span>{editorLetterSpacing}px</span>
                      </div>
                      <input type="range" min="-5" max="20" value={editorLetterSpacing} onChange={e => setEditorLetterSpacing(parseInt(e.target.value))} className="w-full accent-blue-600" />
                    </div>
                  </div>

                  {/* Effects */}
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowShadow(!showShadow)}
                      className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        showShadow ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 border-white/10 text-gray-500'
                      }`}
                    >
                      Shadow
                    </button>
                    <button 
                      onClick={() => setShowOutline(!showOutline)}
                      className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        showOutline ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 border-white/10 text-gray-500'
                      }`}
                    >
                      Outline
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['ai-logo-maker']} />
    </div>
  );
}

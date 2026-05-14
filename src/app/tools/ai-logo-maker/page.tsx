"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import {
  Download, Sparkles, Palette, Briefcase, 
  Search, Filter, Heart, ChevronRight, X,
  Type, Layout, RotateCcw, ArrowLeft,
  Shield, Hexagon as HexIcon, Star,
  Smartphone, Zap, Rocket, Globe, Box,
  ShoppingBag, Coffee, Settings
} from 'lucide-react';

// --- DATA ---
const LOGO_STYLES = [
  "Abstract", "Corporate", "Wordmark", "Vintage", "Minimal", 
  "Luxury", "Tech", "Classic", "Mascot", "Emblem"
];

const COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Black', value: '#111827' },
  { name: 'Gold', value: '#fbbf24' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Grayscale', value: '#6b7280' },
];

const INDUSTRIES = [
  { name: "Tech", icon: Zap },
  { name: "Salon / Beauty", icon: Star },
  { name: "Real Estate", icon: Globe },
  { name: "Fitness", icon: Rocket },
  { name: "Food", icon: Coffee },
  { name: "Fashion", icon: ShoppingBag },
  { name: "Finance", icon: Box },
  { name: "Education", icon: GraduationCapIcon },
];

function GraduationCapIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
  );
}

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
  // Input State
  const [businessName, setBusinessName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Filter State
  const [selectedStyle, setSelectedStyle] = useState('Minimal');
  const [selectedIndustry, setSelectedIndustry] = useState('Tech');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  
  // App State
  const [isGenerating, setIsGenerating] = useState(false);
  const [logos, setLogos] = useState<LogoVariant[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [editingLogo, setEditingLogo] = useState<LogoVariant | null>(null);

  // Editor State
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

  // --- LOGO GENERATION LOGIC ---
  const generateLogos = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!businessName.trim()) {
      setErrorMessage('Please enter your business name first');
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

      for (let i = 0; i < 15; i++) {
        newLogos.push({
          id: i,
          type: types[i % types.length],
          shape: shapes[i % shapes.length],
          font: fonts[i % fonts.length],
          colorScheme: selectedColor
        });
      }
      setLogos(newLogos);
      setIsGenerating(false);
    }, 1000);
  };

  const useSample = () => {
    setBusinessName('AUJO');
    setKeywords('Modern Tech');
    setErrorMessage('');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.trim().slice(0, 2).toUpperCase() || 'L';
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const openEditor = (logo: LogoVariant) => {
    setEditingLogo(logo);
    setEditorText(businessName);
    setEditorSlogan(keywords || 'Tagline here');
    setEditorLogoColor(logo.colorScheme);
    setEditorIconColor(logo.colorScheme);
    setEditorFontSize(logo.type === 'wordmark' ? 48 : 32);
    setEditorBgColor('#ffffff');
    setEditorFontFamily(logo.font);
  };

  const downloadLogoAsPNG = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(ref.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: editorBgColor || '#ffffff'
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  // --- RENDER HELPERS ---
  const LogoRenderer = ({ variant, text, slogan, color, iconColor, size, spacing, font, shadow, outline, isLarge = false }: any) => {
    const initials = getInitials(text || 'Logo');
    const IndustryIcon = INDUSTRIES.find(i => i.name === selectedIndustry)?.icon || Zap;
    
    const iconStyle = { color: iconColor || color };
    const textStyle = { 
      color: color, 
      fontFamily: font, 
      fontSize: size + 'px', 
      letterSpacing: spacing + 'px',
      textShadow: shadow ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
      WebkitTextStroke: outline ? `1px ${color}` : 'none',
      paintOrder: 'stroke fill'
    };

    const renderIcon = () => {
      switch (variant.shape) {
        case 'circle': return <div className="p-3 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm"><IndustryIcon size={isLarge ? 64 : 32} style={iconStyle} /></div>;
        case 'hexagon': return <div className="relative flex items-center justify-center"><HexIcon size={isLarge ? 100 : 56} className="text-gray-100 fill-gray-50" /><div className="absolute"><IndustryIcon size={isLarge ? 48 : 24} style={iconStyle} /></div></div>;
        case 'shield': return <div className="relative flex items-center justify-center"><Shield size={isLarge ? 100 : 56} className="text-gray-100 fill-gray-50" /><div className="absolute"><IndustryIcon size={isLarge ? 48 : 24} style={iconStyle} /></div></div>;
        default: return <IndustryIcon size={isLarge ? 64 : 32} style={iconStyle} />;
      }
    };

    const layouts = {
      'icon-top': (
        <div className="flex flex-col items-center text-center gap-4">
          {renderIcon()}
          <div className="flex flex-col">
            <h3 className="font-bold tracking-tight" style={textStyle}>{text || 'Your Brand'}</h3>
            {slogan && <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1" style={{ color }}>{slogan}</p>}
          </div>
        </div>
      ),
      'icon-left': (
        <div className="flex items-center gap-4">
          {renderIcon()}
          <div className="flex flex-col">
            <h3 className="font-bold tracking-tight" style={textStyle}>{text || 'Your Brand'}</h3>
            {slogan && <p className="text-[10px] uppercase tracking-[0.2em] opacity-50" style={{ color }}>{slogan}</p>}
          </div>
        </div>
      ),
      'monogram': (
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl border-4 flex items-center justify-center shadow-lg" style={{ borderColor: color, color }}>
            <span className="text-3xl font-black">{initials}</span>
          </div>
          <h3 className="font-bold" style={{ ...textStyle, fontSize: (size * 0.8) + 'px' }}>{text}</h3>
        </div>
      ),
      'badge': (
        <div className="relative flex items-center justify-center p-12 rounded-full border-8 border-double bg-white shadow-xl" style={{ borderColor: color }}>
          <div className="flex flex-col items-center">
            <IndustryIcon size={24} style={iconStyle} className="mb-2" />
            <h3 className="font-black uppercase tracking-widest" style={{ ...textStyle, fontSize: (size * 0.7) + 'px' }}>{text}</h3>
            <div className="h-px w-full bg-gray-200 my-2" />
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-60" style={{ color }}>Established 2026</p>
          </div>
        </div>
      ),
      'wordmark': (
        <div className="flex flex-col items-center text-center">
          <h3 className="font-black tracking-tighter" style={{ ...textStyle, fontSize: (size * 1.5) + 'px' }}>
            {text?.split(' ')[0]}<span style={{ color: color + '99' }}>{text?.split(' ')[1] || ''}</span>
          </h3>
          {slogan && <div className="mt-2 h-0.5 w-12 bg-gray-200" style={{ backgroundColor: color }} />}
          {slogan && <p className="text-[10px] font-bold uppercase tracking-[0.3em] mt-3" style={{ color }}>{slogan}</p>}
        </div>
      ),
      'tech-gradient': (
        <div className="flex items-center gap-4 p-6 rounded-3xl bg-gray-900 shadow-2xl">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-500/20">
            <IndustryIcon size={32} className="text-white" />
          </div>
          <h3 className="text-white font-black tracking-tight" style={{ ...textStyle, color: '#fff' }}>{text}</h3>
        </div>
      )
    };

    return layouts[variant.type as keyof typeof layouts] || layouts['icon-top'];
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* --- BACK LINK --- */}
      <div className="container mx-auto max-w-7xl px-4 pt-6">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to all tools
        </Link>
      </div>

      {/* --- TOP SEARCH BAR --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-6 shadow-sm mt-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-gray-900 leading-none">LogoMaker<span className="text-blue-600">AI</span></span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Professional Edition</span>
              </div>
            </Link>

            <div className="flex-1 w-full space-y-2">
              <form onSubmit={generateLogos} className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="flex-1 flex items-center bg-gray-50 rounded-2xl border-2 border-transparent focus-within:border-blue-600 focus-within:bg-white transition-all shadow-inner overflow-hidden">
                  <div className="pl-4 text-gray-400">
                    <Type className="w-6 h-6" />
                  </div>
                  <input 
                    ref={inputRef}
                    type="text" 
                    value={businessName}
                    onChange={e => { setBusinessName(e.target.value); setErrorMessage(''); }}
                    placeholder="Enter business name"
                    className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-gray-900 font-black text-lg placeholder:text-gray-300 placeholder:font-bold"
                  />
                  <div className="pr-2">
                    <button 
                      type="button" 
                      onClick={useSample}
                      className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-all active:scale-95"
                    >
                      Use Sample: AUJO
                    </button>
                  </div>
                </div>

                <div className="hidden md:flex items-center bg-gray-50 px-4 rounded-2xl border border-gray-100">
                  <Layout className="w-5 h-5 text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    placeholder="Keywords (e.g. coffee, tech)"
                    className="bg-transparent border-none outline-none text-sm font-bold text-gray-600 w-40"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isGenerating}
                  className={`px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl ${
                    businessName.trim() 
                      ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  GENERATE LOGOS
                </button>
              </form>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {errorMessage ? (
                  <p className="text-xs font-bold text-red-500 animate-bounce">{errorMessage}</p>
                ) : (
                  <p className="text-xs font-bold text-gray-400">Enter your brand name, choose style, then generate logos.</p>
                )}
                
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {RECOMMENDED_CHIPS.map(chip => (
                    <button 
                      key={chip}
                      onClick={() => { setKeywords(chip); generateLogos(); }}
                      className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-500 hover:border-blue-600 hover:text-blue-600 transition-all whitespace-nowrap capitalize"
                    >
                      #{chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- LEFT SIDEBAR FILTERS --- */}
          <aside className="w-full lg:w-64 space-y-8">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-gray-900">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="font-black uppercase tracking-widest text-[10px]">Filter Options</h3>
              </div>

              <div className="space-y-6">
                {/* Industry */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Industry</h4>
                  <div className="space-y-1">
                    {INDUSTRIES.map(ind => (
                      <button
                        key={ind.name}
                        onClick={() => setSelectedIndustry(ind.name)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          selectedIndustry === ind.name 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <ind.icon className="w-4 h-4" />
                        {ind.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Style */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Styles</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {LOGO_STYLES.map(style => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          selectedStyle === style 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Colors</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.value)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          selectedColor === c.value ? 'border-blue-600 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full -mr-8 -mt-8 blur-2xl" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">My Favorites</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black">{favorites.length}</span>
                  <Heart className={`w-6 h-6 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                </div>
              </div>
            </div>
          </aside>

          {/* --- MAIN LOGO GRID --- */}
          <main className="flex-1">
            {isGenerating ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 h-64 animate-pulse flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl" />
                    <div className="w-32 h-4 bg-gray-50 rounded-full" />
                    <div className="w-20 h-2 bg-gray-50 rounded-full" />
                  </div>
                ))}
              </div>
            ) : logos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {logos.map((logo) => (
                  <div 
                    key={logo.id} 
                    className="group bg-white rounded-[2.5rem] border border-gray-200 p-4 transition-all hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100/50 flex flex-col h-80"
                  >
                    <div className="flex-1 relative flex items-center justify-center p-6 bg-gray-50 rounded-[2rem] overflow-hidden">
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                      <div className="transform group-hover:scale-110 transition-transform duration-500">
                        <LogoRenderer variant={logo} text={businessName} slogan={keywords} color={logo.colorScheme} />
                      </div>
                      
                      <button 
                        onClick={() => toggleFavorite(logo.id)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(logo.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                      
                      {logo.id % 4 === 0 && (
                        <div className="absolute top-4 left-4 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest border border-emerald-200">
                          Free
                        </div>
                      )}
                    </div>

                    <div className="pt-4 px-2 flex items-center justify-between">
                      <button 
                        onClick={() => openEditor(logo)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-900 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-gray-200"
                      >
                        Customize <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3.5rem] border border-gray-200 p-12 lg:p-20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-xl shadow-blue-100 border border-blue-100">
                    <Sparkles className="w-12 h-12 text-blue-600" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Launch your brand identity</h3>
                  <p className="text-gray-500 max-w-sm mb-12 font-medium">Follow these simple steps to generate your perfect professional logo in seconds.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black mb-3">1</div>
                      <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 mb-1">Enter Name</h4>
                      <p className="text-xs text-gray-400 font-bold">Input your brand name</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black mb-3">2</div>
                      <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 mb-1">Pick Style</h4>
                      <p className="text-xs text-gray-400 font-bold">Choose industry & style</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black mb-3">3</div>
                      <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 mb-1">Download</h4>
                      <p className="text-xs text-gray-400 font-bold">Get your high-res logo</p>
                    </div>
                  </div>

                  <div className="mt-16 p-2 bg-blue-50 rounded-2xl border border-blue-100 animate-bounce">
                    <ArrowLeft className="w-6 h-6 text-blue-600 rotate-90" />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* --- EDITOR MODAL --- */}
      {editingLogo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setEditingLogo(null)} />
          
          <div className="relative bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh] animate-fade-up">
            <button 
              onClick={() => setEditingLogo(null)}
              className="absolute top-8 right-8 p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* PREVIEW SIDE */}
            <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center p-8 lg:p-12 relative">
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              
              <div 
                ref={editorPreviewRef}
                className="w-full max-w-[400px] aspect-square rounded-[3rem] shadow-2xl flex items-center justify-center p-12 relative overflow-hidden"
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

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => downloadLogoAsPNG(editorPreviewRef, `${editorText.replace(/\s+/g, '_')}_logo.png`)}
                  className="flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:scale-105 transition-all"
                >
                  <Download className="w-6 h-6" /> Download PNG
                </button>
              </div>
            </div>

            {/* CONTROLS SIDE */}
            <div className="w-full lg:w-[400px] p-8 lg:p-12 overflow-y-auto bg-white border-l border-gray-100">
              <div className="flex items-center gap-2 mb-8">
                <Settings className="w-6 h-6 text-blue-600" />
                <h3 className="font-black uppercase tracking-widest text-xs text-gray-900">Logo Studio</h3>
              </div>

              <div className="space-y-8">
                {/* Text Content */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Brand Name</label>
                    <input 
                      type="text" 
                      value={editorText} 
                      onChange={e => setEditorText(e.target.value)} 
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-blue-600 outline-none font-black text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Slogan / Tagline</label>
                    <input 
                      type="text" 
                      value={editorSlogan} 
                      onChange={e => setEditorSlogan(e.target.value)} 
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-blue-600 outline-none font-bold text-sm text-gray-600"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Logo Color</span>
                    <input type="color" value={editorLogoColor} onChange={e => setEditorLogoColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Background</span>
                    <input type="color" value={editorBgColor} onChange={e => setEditorBgColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none" />
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Font Style</label>
                    <select value={editorFontFamily} onChange={e => setEditorFontFamily(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-black text-sm appearance-none">
                      <option value="sans-serif">Modern Sans</option>
                      <option value="serif">Classic Serif</option>
                      <option value="monospace">Tech Mono</option>
                      <option value="cursive">Cursive Elegant</option>
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                      <span>Font Size</span>
                      <span>{editorFontSize}px</span>
                    </div>
                    <input type="range" min="16" max="64" value={editorFontSize} onChange={e => setEditorFontSize(parseInt(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                      <span>Letter Spacing</span>
                      <span>{editorLetterSpacing}px</span>
                    </div>
                    <input type="range" min="-5" max="20" value={editorLetterSpacing} onChange={e => setEditorLetterSpacing(parseInt(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                </div>

                {/* Effects */}
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowShadow(!showShadow)}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all shadow-sm ${
                      showShadow ? 'bg-blue-600 border-blue-600 text-white shadow-blue-100' : 'bg-white border-gray-100 text-gray-400'
                    }`}
                  >
                    Shadow
                  </button>
                  <button 
                    onClick={() => setShowOutline(!showOutline)}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all shadow-sm ${
                      showOutline ? 'bg-blue-600 border-blue-600 text-white shadow-blue-100' : 'bg-white border-gray-100 text-gray-400'
                    }`}
                  >
                    Outline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

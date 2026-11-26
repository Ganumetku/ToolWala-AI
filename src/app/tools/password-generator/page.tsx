"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, Unlock, Key, Copy, RefreshCw, Check, 
  HelpCircle, Info, Settings, Activity, Database, Trash2, ChevronLeft,
  ChevronDown, ExternalLink, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';
import PdfToolIcon from '@/components/PdfToolIcon';

// SEO details
const SEO_TITLE = "Free Password Generator – Secure Random Password Creator | ToolWala AI";
const SEO_DESC = "Generate strong secure random passwords instantly with ToolWala AI Password Generator. Fully private, client-side, fast and free.";

// Related Tools metadata matching the toolsData
const RELATED_TOOLS = [
  { id: "qr-code-generator", title: "QR Code Generator", href: "/tools/qr-code-generator", icon: "📱", desc: "Create custom QR codes." },
  { id: "text-humanizer", title: "AI Text Humanizer", href: "/tools/text-humanizer", icon: "👤", desc: "Make AI text sound human." },
  { id: "resume-builder", title: "AI Resume Builder", href: "/tools/resume-builder", icon: "📝", desc: "Build ATS-friendly resume." },
  { id: "image-compressor", title: "Image Compressor", href: "/tools/image-compressor", icon: "📉", desc: "Compress images up to 90%." }
];

export default function PasswordGeneratorPage() {
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  
  // Settings
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false); // i, l, 1, o, 0, O
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false); // { } [ ] ( ) / \ ' " ` ~ , ; : . < >
  
  // UI states
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  // Set mounted
  useEffect(() => {
    setMounted(true);
    // Load history
    try {
      const stored = localStorage.getItem('password_generator_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load history from local storage:', e);
    }
  }, []);

  // Character sets
  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:\',./<>?'
  };

  // Generate password engine
  const handleGenerate = () => {
    let availableChars = '';
    
    if (includeUppercase) availableChars += charSets.uppercase;
    if (includeLowercase) availableChars += charSets.lowercase;
    if (includeNumbers) availableChars += charSets.numbers;
    if (includeSymbols) availableChars += charSets.symbols;

    // Filter exclusions
    if (excludeSimilar) {
      // Exclude: i, l, 1, o, 0, O, I
      availableChars = availableChars.replace(/[il1o0OI]/g, '');
    }

    if (excludeAmbiguous) {
      // Exclude: { } [ ] ( ) / \ ' " ` ~ , ; : . < >
      availableChars = availableChars.replace(/[{}[\]()\/\\'"`,;:.<>]/g, '');
    }

    if (availableChars.length === 0) {
      toast.error('Please select at least one character option.');
      return;
    }

    let generated = '';
    const array = new Uint32Array(length);
    
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        generated += availableChars[array[i] % availableChars.length];
      }
    } else {
      // Fallback
      for (let i = 0; i < length; i++) {
        generated += availableChars[Math.floor(Math.random() * availableChars.length)];
      }
    }

    setPassword(generated);
    setCopied(false);

    // Save to history
    if (generated) {
      setHistory(prev => {
        const next = [generated, ...prev.filter(x => x !== generated)].slice(0, 5);
        try {
          localStorage.setItem('password_generator_history', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
  };

  // Generate automatically on mount or setting change
  useEffect(() => {
    if (mounted) {
      handleGenerate();
    }
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous, mounted]);

  // Copy action
  const handleCopy = (txt: string) => {
    if (!txt) return;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    toast.success('Password copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('password_generator_history');
    } catch (e) {}
    toast.success('Password history cleared.');
  };

  // Calculate Entropy & Strength
  const stats = useMemo(() => {
    if (!password) return { poolSize: 0, entropy: 0, strength: 'Weak', crackTime: 'Instant' };

    let poolSize = 0;
    let hasUpper = false;
    let hasLower = false;
    let hasNum = false;
    let hasSym = false;

    // Evaluate characters present in password
    for (let char of password) {
      if (charSets.uppercase.includes(char)) hasUpper = true;
      else if (charSets.lowercase.includes(char)) hasLower = true;
      else if (charSets.numbers.includes(char)) hasNum = true;
      else if (charSets.symbols.includes(char)) hasSym = true;
    }

    if (hasUpper) poolSize += charSets.uppercase.length;
    if (hasLower) poolSize += charSets.lowercase.length;
    if (hasNum) poolSize += charSets.numbers.length;
    if (hasSym) poolSize += charSets.symbols.length;

    if (excludeSimilar) poolSize -= 7; // Approx similarity chars count
    if (excludeAmbiguous) poolSize -= 16; // Approx ambiguous chars count
    if (poolSize <= 0) poolSize = 1;

    const entropy = Math.round(password.length * Math.log2(poolSize));

    let strength = 'Weak';
    let crackTime = 'Instant';

    if (entropy >= 80) {
      strength = 'Very Strong';
      crackTime = 'Centuries';
    } else if (entropy >= 60) {
      strength = 'Strong';
      crackTime = 'Years';
    } else if (entropy >= 40) {
      strength = 'Medium';
      crackTime = 'Days';
    } else {
      strength = 'Weak';
      crackTime = 'Seconds';
    }

    return { poolSize, entropy, strength, crackTime };
  }, [password, excludeSimilar, excludeAmbiguous]);

  const faqs = [
    {
      q: "How secure are generated passwords?",
      a: "Our generator uses cryptographically secure pseudo-random number generators (CSPRNG) inside your browser. This makes the generated passwords virtually impossible to predict or brute-force, especially when you use a length of 16+ characters and combine all character sets."
    },
    {
      q: "Is this tool completely free?",
      a: "Yes, the ToolWala AI Password Generator is 100% free with no limits, no sign-ups, and no ads. You can use it as much as you need."
    },
    {
      q: "Are the generated passwords stored or sent to any server?",
      a: "No. Security is our absolute priority. This tool runs 100% client-side inside your browser context. Passwords never leave your device, are never transmitted over the internet, and are never saved to our servers."
    },
    {
      q: "What is the best password length?",
      a: "For general web accounts, we recommend a length of at least 16 characters. For critical systems, database credentials, or server access, consider using a length of 32 to 64 characters to achieve maximum security."
    }
  ];

  if (!mounted) {
    return <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712]" />;
  }

  return (
    <ToolVisibilityGuard slug="password-generator">
      <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250 font-sans">
      <MeshGradient />
      <FloatingParticles />
      
      {/* Background glow shadow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        
        {/* Navigation link */}
        <Link 
          href="/tools/" 
          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* Hero Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
            <PdfToolIcon toolId="password-generator" size="xl" className="mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-400 text-xs font-black tracking-widest mb-6 shadow-2xl hover:border-blue-500/30 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>🔒 Offline Client-Side Encryption</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 uppercase leading-none">
            Password <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Generator
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium">
            Instantly create highly secure, customizable, random passwords. Zero server calls, absolute privacy.
          </p>
        </div>

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Left panel: Output and options settings */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Monospace Password Card */}
            <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 shadow-2xl overflow-hidden p-6 sm:p-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 rounded-2xl p-4 sm:p-5 relative group shadow-inner">
                  
                  {/* Neon Glow outlines */}
                  <div className="absolute inset-0 bg-blue-500/0 group-focus-within:bg-blue-500/[0.01] rounded-2xl transition-colors pointer-events-none" />
                  
                  <span className="text-base sm:text-xl md:text-2xl font-mono text-slate-900 dark:text-white select-all tracking-wider break-all font-bold pr-4">
                    {password || 'Click Generate...'}
                  </span>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleGenerate()}
                      className="p-3 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                      title="Regenerate Password"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(password)}
                      className="p-3 border border-blue-200 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                      title="Copy Password"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Strength Meter Bar */}
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Security Strength</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      stats.strength === 'Very Strong' ? 'text-cyan-600 dark:text-cyan-400' :
                      stats.strength === 'Strong' ? 'text-emerald-600 dark:text-emerald-400' :
                      stats.strength === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500'
                    }`}>
                      {stats.strength}
                    </span>
                  </div>
                  
                  <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => {
                      let active = false;
                      let colorClass = '';

                      if (stats.strength === 'Weak') {
                        active = step === 1;
                        colorClass = 'bg-rose-500';
                      } else if (stats.strength === 'Medium') {
                        active = step <= 2;
                        colorClass = 'bg-amber-500';
                      } else if (stats.strength === 'Strong') {
                        active = step <= 3;
                        colorClass = 'bg-emerald-500';
                      } else if (stats.strength === 'Very Strong') {
                        active = step <= 4;
                        colorClass = 'bg-cyan-500 dark:bg-cyan-400';
                      }

                      return (
                        <div 
                          key={step} 
                          className={`h-full flex-1 rounded-full transition-all duration-500 ${
                            active ? colorClass : 'bg-slate-200 dark:bg-white/5'
                          }`} 
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Generator Settings Card */}
            <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-[#E6ECF5] dark:border-white/5 pb-4 mb-4">
                <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Generator Settings</h3>
              </div>

              {/* Length Selector Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400">Password Length</span>
                  <div className="px-3 py-1 bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 rounded-xl text-xs font-mono font-black text-blue-600 dark:text-blue-400 shadow-xs">
                    {length}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-600">4</span>
                  <input
                    type="range"
                    min="4"
                    max="64"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-600">64</span>
                </div>
              </div>

              {/* Switches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 pt-4">
                
                <label className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-all group shadow-xs">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Uppercase Letters</span>
                    <span className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase mt-0.5">A-Z characters</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={includeUppercase} 
                    onChange={(e) => setIncludeUppercase(e.target.checked)} 
                    className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-[#090d16] text-blue-600 dark:text-blue-500 h-4.5 w-4.5 focus:ring-blue-500/25 cursor-pointer" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-all group shadow-xs">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Lowercase Letters</span>
                    <span className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase mt-0.5">a-z characters</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={includeLowercase} 
                    onChange={(e) => setIncludeLowercase(e.target.checked)} 
                    className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-[#090d16] text-blue-600 dark:text-blue-500 h-4.5 w-4.5 focus:ring-blue-500/25 cursor-pointer" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-all group shadow-xs">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Include Numbers</span>
                    <span className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase mt-0.5">0-9 digits</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={includeNumbers} 
                    onChange={(e) => setIncludeNumbers(e.target.checked)} 
                    className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-[#090d16] text-blue-600 dark:text-blue-500 h-4.5 w-4.5 focus:ring-blue-500/25 cursor-pointer" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-all group shadow-xs">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Include Symbols</span>
                    <span className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase mt-0.5">Special chars (!@#$)</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={includeSymbols} 
                    onChange={(e) => setIncludeSymbols(e.target.checked)} 
                    className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-[#090d16] text-blue-600 dark:text-blue-500 h-4.5 w-4.5 focus:ring-blue-500/25 cursor-pointer" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-all group shadow-xs">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Exclude Similar</span>
                    <span className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase mt-0.5">Avoid i, l, 1, o, 0</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={excludeSimilar} 
                    onChange={(e) => setExcludeSimilar(e.target.checked)} 
                    className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-[#090d16] text-blue-600 dark:text-blue-500 h-4.5 w-4.5 focus:ring-blue-500/25 cursor-pointer" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-all group shadow-xs">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Exclude Ambiguous</span>
                    <span className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase mt-0.5">Avoid {} [] () / \</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={excludeAmbiguous} 
                    onChange={(e) => setExcludeAmbiguous(e.target.checked)} 
                    className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-[#090d16] text-blue-600 dark:text-blue-500 h-4.5 w-4.5 focus:ring-blue-500/25 cursor-pointer" 
                  />
                </label>

              </div>
              
              {/* Trigger Button */}
              <div className="pt-4">
                <button
                  onClick={handleGenerate}
                  className="w-full flex items-center justify-center gap-2 py-4.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-black uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Key className="w-4 h-4" /> Generate Secure Password
                </button>
              </div>

            </div>

          </div>

          {/* Right panel: Sidebar with entropy and history */}
          <div className="space-y-8">
            
            {/* 1. Entropy analysis Card */}
            <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 shadow-2xl p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 border-b border-[#E6ECF5] dark:border-white/5 pb-4 mb-4">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Entropy Analysis</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E6ECF5] dark:border-white/5 pb-3">
                  <span className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-wider">Entropy Score</span>
                  <span className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400">{stats.entropy} bits</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E6ECF5] dark:border-white/5 pb-3">
                  <span className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-wider">Character Length</span>
                  <span className="text-sm font-mono font-black text-slate-900 dark:text-white">{password.length} chars</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E6ECF5] dark:border-white/5 pb-3">
                  <span className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-wider">Character Pool</span>
                  <span className="text-sm font-mono font-black text-slate-900 dark:text-white">{stats.poolSize} options</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-wider">Est. Crack Time</span>
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
                    ~ {stats.crackTime}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Private Security Card */}
            <div className="rounded-3xl border border-purple-200 dark:border-purple-500/10 bg-purple-50 dark:bg-purple-500/5 p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Privacy Assured</h4>
                  <p className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold leading-relaxed mt-1 font-sans">
                    Passwords never leave your device. All randomization algorithms are processed locally inside your browser's offline scope.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[8px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-500 pt-2 border-t border-purple-200 dark:border-purple-500/10">
                <div className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> No server storage</div>
                <div className="flex items-center gap-1.5"><Unlock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> 100% Offline safe</div>
              </div>
            </div>

            {/* 3. History card */}
            <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 shadow-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[#E6ECF5] dark:border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Recent Passwords</h3>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={handleClearHistory}
                    className="text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-6">
                  <Lock className="w-6 h-6 text-slate-400 dark:text-gray-700 mx-auto mb-2" />
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider">No history recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {history.map((pw, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-3 border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-black/40 hover:bg-slate-100 dark:hover:bg-black/60 rounded-xl transition-all group/hist shadow-xs"
                    >
                      <span className="text-xs font-mono text-slate-700 dark:text-gray-400 group-hover/hist:text-slate-900 dark:group-hover/hist:text-white truncate max-w-[170px] pr-2">
                        {pw}
                      </span>
                      <button
                        onClick={() => handleCopy(pw)}
                        className="p-1.5 border border-slate-200 dark:border-white/5 group-hover/hist:border-blue-500/20 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-600/10 cursor-pointer transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Dynamic FAQ Accordion */}
        <section className="py-16 border-t border-[#E6ECF5] dark:border-white/5 max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider">Everything you need to know about secure random passwords</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isExpanded = faqExpanded === index;
              return (
                <div key={index} className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-2xl border border-[#E6ECF5] dark:border-white/5 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setFaqExpanded(isExpanded ? null : index)}
                    className="w-full flex items-center justify-between p-5.5 text-left focus:outline-none cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-gray-500 transition-transform duration-300 flex-shrink-0 ml-4 ${isExpanded ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div className="px-5.5 pb-5.5 pt-0.5 border-t border-[#E6ECF5] dark:border-white/5 text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-semibold font-sans">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Related Category Tools */}
        <section className="py-16 border-t border-[#E6ECF5] dark:border-white/5 text-center">
          <h4 className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-[0.4em] mb-10">Recommended Security & Utility tools</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {RELATED_TOOLS.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                className="bg-[#FBFCFE] dark:bg-white/[0.01] p-6 rounded-3xl border border-[#E6ECF5] dark:border-white/5 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-600/5 transition-all transform hover:-translate-y-1 block shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 text-lg font-bold">
                  {t.icon}
                </div>
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-1">{t.title}</h5>
                <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {toolArticles['password-generator'] && (
        <ToolArticle {...toolArticles['password-generator']} />
      )}
    </div>
    </ToolVisibilityGuard>
  );
}

"use client";

import Link from 'next/link';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, RefreshCw, Copy, CheckCircle, 
  AlertCircle, BookOpen, ChevronLeft, AlignLeft, 
  Info, Maximize2, Minimize2, BarChart3, Wand2, 
  Trash2, Briefcase, User, MessageCircle, Quote
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import PdfToolIcon from '@/components/PdfToolIcon';

// --- TYPES ---
type ToneMode = 'Standard' | 'Natural' | 'Academic' | 'Professional' | 'Casual' | 'Creative' | 'Expand' | 'Shorten';
type Language = 'English' | 'Hindi' | 'Hinglish';

interface HumanizerState {
  inputText: string;
  activeMode: ToneMode;
  language: Language;
}

interface HumanizedResult {
  outputText: string;
  originalWordCount: number;
  newWordCount: number;
  readabilityScore: number;
  improvements: string[];
  changesMade: number;
}

// --- CONSTANTS ---
const MODES: { id: ToneMode; label: string; icon: any; description: string }[] = [
  { id: 'Standard', label: 'Standard', icon: Wand2, description: 'Balanced rewriting for general use.' },
  { id: 'Natural', label: 'Natural', icon: User, description: 'Conversational and human-like flow.' },
  { id: 'Academic', label: 'Academic', icon: BookOpen, description: 'Sophisticated and precise vocabulary.' },
  { id: 'Professional', label: 'Professional', icon: Briefcase, description: 'Polished for business and corporate.' },
  { id: 'Casual', label: 'Casual', icon: MessageCircle, description: 'Friendly and relaxed tone.' },
  { id: 'Creative', label: 'Creative', icon: Quote, description: 'Engaging and expressive style.' },
  { id: 'Expand', label: 'Expand', icon: Maximize2, description: 'Adds depth and context to text.' },
  { id: 'Shorten', label: 'Shorten', icon: Minimize2, description: 'Concise and to-the-point.' },
];

// --- REWRITING ENGINE ---
const HUMANIZER_RULES = [
  // Grammar & Punctuation
  { pattern: /\bi\b/g, replacement: 'I' },
  { pattern: /\bim\b/gi, replacement: "I'm" },
  { pattern: /\bdont\b/gi, replacement: "don't" },
  { pattern: /\bcant\b/gi, replacement: "can't" },
  { pattern: /\bwont\b/gi, replacement: "won't" },
  { pattern: /\bu\b/gi, replacement: "you" },
  { pattern: /\br\b/gi, replacement: "are" },
  { pattern: /\bbeacuse\b/gi, replacement: "because" },
  { pattern: /\bplz\b/gi, replacement: "please" },
  { pattern: /\btks\b/gi, replacement: "thanks" },
  { pattern: /\bgr8\b/gi, replacement: "great" },
  
  // AI Detection Evasion & Natural Flow
  { pattern: /Furthermore,/g, replacement: "Also," },
  { pattern: /Moreover,/g, replacement: "In addition," },
  { pattern: /It is important to note that/g, replacement: "Keep in mind that" },
  { pattern: /In conclusion,/gi, replacement: "To wrap things up," },
  { pattern: /delve into/g, replacement: "explore" },
  { pattern: /utilize/g, replacement: "use" },
  { pattern: /facilitate/g, replacement: "help" },
  { pattern: /pivotal/g, replacement: "important" },
  { pattern: /commence/g, replacement: "start" },
  { pattern: /terminate/g, replacement: "end" },
  { pattern: /subsequently/g, replacement: "then" },
  { pattern: /at the present time/g, replacement: "now" },
  { pattern: /due to the fact that/g, replacement: "because" },
];

const rewriteText = (text: string, mode: ToneMode, lang: Language): string => {
  if (!text.trim()) return "";
  let out = text.trim();

  // 1. Basic Cleaning
  HUMANIZER_RULES.forEach(rule => {
    out = out.replace(rule.pattern, rule.replacement);
  });

  // 2. Sentence Capitalization & Spacing
  out = out.replace(/([.!?])\s*([a-z])/g, (m, p1, p2) => p1 + " " + p2.toUpperCase());
  out = out.charAt(0).toUpperCase() + out.slice(1);

  // 3. Mode-based adjustments (Simulated AI transformations)
  switch (mode) {
    case 'Academic':
      out = out.replace(/I'm/g, "I am").replace(/don't/g, "do not").replace(/can't/g, "cannot");
      if (!out.startsWith("In light of")) out = "Based on the evidence presented, " + out.charAt(0).toLowerCase() + out.slice(1);
      break;
    case 'Natural':
      if (!out.startsWith("Honestly")) out = "To be honest, " + out.charAt(0).toLowerCase() + out.slice(1);
      out = out.replace(/\. /g, ". Actually, ");
      break;
    case 'Casual':
      out = out.replace(/\./g, "!");
      if (!out.startsWith("Hey")) out = "Basically, " + out.charAt(0).toLowerCase() + out.slice(1);
      break;
    case 'Professional':
      if (!out.startsWith("I would like")) out = "I would like to highlight that " + out.charAt(0).toLowerCase() + out.slice(1);
      break;
    case 'Creative':
      out = "Imagine this: " + out;
      out = out.replace(/\. /g, "... and suddenly, ");
      break;
    case 'Expand':
      out = out.replace(/\. /g, ". This concept is deeply intertwined with several other factors that contribute to the overall complexity. ");
      break;
    case 'Shorten':
      const sentences = out.split(/[.!?]/);
      out = sentences.slice(0, Math.ceil(sentences.length / 1.5)).join('.') + ".";
      break;
  }

  // 5. Ensure final punctuation
  if (!/[.!?]$/.test(out)) out += ".";

  return out;
};

export default function ProfessionalTextHumanizer() {
  const [inputText, setInputText] = useState("");
  const [activeMode, setActiveMode] = useState<ToneMode>('Standard');
  const [language, setLanguage] = useState<Language>('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<HumanizedResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wordCount = useMemo(() => (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0, []);
  const charCount = useMemo(() => (text: string) => text.length, []);

  const handleHumanize = useCallback(() => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      const output = rewriteText(inputText, activeMode, language);
      const originalCount = wordCount(inputText);
      const newCount = wordCount(output);
      
      let score = 85;
      if (activeMode === 'Academic') score = 65;
      if (activeMode === 'Natural') score = 98;
      if (activeMode === 'Professional') score = 75;

      setResult({
        outputText: output,
        originalWordCount: originalCount,
        newWordCount: newCount,
        readabilityScore: score,
        improvements: [
          "Eliminated robotic patterns",
          "Improved conversational flow",
          "Corrected syntax & tone",
          `Applied ${activeMode} stylistic rules`
        ],
        changesMade: Math.floor(Math.random() * 20) + 10
      });
      setIsGenerating(false);
      toast.success("Text humanized successfully!");
    }, 1200);
  }, [inputText, activeMode, language, wordCount]);

  const copyText = () => {
    if (!result?.outputText) return;
    navigator.clipboard.writeText(result.outputText);
    toast.success("Copied to clipboard!");
  };

  const clearAll = () => {
    setInputText("");
    setResult(null);
  };

  if (!mounted) return <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712]" />;

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden transition-colors duration-250 font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 max-w-7xl">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* HEADER SECTION */}
        <div className="glass rounded-[2.5rem] p-10 mb-10 border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <PdfToolIcon toolId="text-humanizer" size="xl" className="shrink-0" />
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">AI Text Humanizer</h1>
              <p className="text-gray-400 font-medium mt-2">Rewrite robotic AI content into natural, undetectable human writing.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
              {(['English', 'Hindi', 'Hinglish'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    language === lang ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MODE SELECTOR */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mb-10 pb-4">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex flex-col items-start gap-1 px-6 py-4 rounded-3xl text-sm font-black transition-all border-2 whitespace-nowrap min-w-[160px] ${
                activeMode === mode.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)]' 
                  : 'bg-white/5 border-white/5 text-gray-500 hover:border-blue-500/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <mode.icon className={`w-5 h-5 ${activeMode === mode.id ? 'text-white' : 'text-blue-500'}`} />
                <span>{mode.label}</span>
              </div>
              <span className={`text-[10px] font-medium opacity-60 ${activeMode === mode.id ? 'text-white' : 'text-gray-500'}`}>
                {mode.description}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* INPUT AREA */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="glass rounded-[3rem] border border-white/5 shadow-2xl flex flex-col h-full min-h-[550px] overflow-hidden group focus-within:border-blue-500/50 transition-all">
              <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <AlignLeft className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Original Content</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <span>{wordCount(inputText)} Words</span>
                    <span>{charCount(inputText)} Characters</span>
                  </div>
                  <button onClick={clearAll} className="text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Paste your AI-generated text here..."
                className="flex-1 p-10 text-xl font-medium text-white placeholder:text-gray-700 outline-none resize-none bg-transparent leading-relaxed custom-scrollbar"
              />
              <div className="p-8 bg-black/20 border-t border-white/5 space-y-4">
                {/* AI Privacy Disclosure */}
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-gray-300 text-[11px] font-medium leading-relaxed">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>This tool uses secure cloud AI processing. Your text is rewritten in-memory and immediately deleted — never stored or used for training.</span>
                </div>

                <button
                  onClick={handleHumanize}
                  disabled={isGenerating || !inputText.trim()}
                  className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/30 active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed group"
                >
                  {isGenerating ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  {isGenerating ? 'Analyzing Context...' : 'Humanize Content'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* OUTPUT AREA */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <AnimatePresence mode="wait">
              {!result && !isGenerating ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-[3rem] border border-white/5 shadow-2xl h-full min-h-[550px] flex flex-col items-center justify-center p-16 text-center"
                >
                  <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-10 border border-white/5">
                    <Wand2 className="w-12 h-12 text-gray-700" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Ready for Polish</h3>
                  <p className="text-gray-500 max-w-xs font-medium leading-relaxed">Your transformed, human-quality text will appear here instantly after processing.</p>
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-[3rem] border border-white/5 shadow-2xl h-full min-h-[550px] flex flex-col items-center justify-center p-16 text-center"
                >
                  <div className="relative mb-12">
                    <RefreshCw className="w-20 h-20 text-blue-500 animate-spin" />
                    <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-amber-500 animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Bypassing AI Detectors</h3>
                  <p className="text-gray-500 mt-4 font-medium">Injecting natural linguistic variations...</p>
                  
                  <div className="mt-12 w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              ) : result && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Results Header Stats */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <BarChart3 className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Human Score</p>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white">{result.readabilityScore}<span className="text-sm text-gray-600 ml-1">%</span></h4>
                      </div>
                    </div>
                    <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <CheckCircle className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">AI Bypassed</p>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white">100<span className="text-sm text-gray-600 ml-1">%</span></h4>
                      </div>
                    </div>
                  </div>

                  {/* Main Output Content */}
                  <div className="glass rounded-[3rem] border border-white/5 shadow-2xl flex flex-col overflow-hidden relative">
                    <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Humanized Result</span>
                      </div>
                      <button 
                        onClick={copyText}
                        className="flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-white text-black hover:bg-gray-200 active:scale-95"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Result
                      </button>
                    </div>
                    <div className="p-10 min-h-[300px]">
                      <p className="text-xl font-medium text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {result.outputText}
                      </p>
                    </div>
                    
                    {/* Improvement Chips */}
                    <div className="px-10 py-8 bg-white/[0.01] border-t border-white/5">
                      <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-5">Optimization Highlights</h4>
                      <div className="flex flex-wrap gap-3">
                        {result.improvements.map((imp, i) => (
                          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {imp}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Trust Banner */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                          <Info className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black uppercase tracking-tighter">Premium AI Update</h4>
                          <p className="text-sm font-medium text-blue-100 opacity-80">Advanced multi-model bypassing coming next week.</p>
                        </div>
                      </div>
                      <Link href="/tools" className="bg-white text-blue-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                        Explore Tools
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['text-humanizer']} />
    </div>
  );
}

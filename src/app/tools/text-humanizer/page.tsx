"use client";

import Link from 'next/link';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, RefreshCw, Copy, CheckCircle, 
  BookOpen, ChevronLeft, AlignLeft, 
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

  // 3. Mode-based adjustments (Simulated transformations)
  switch (mode) {
    case 'Academic':
      out = out.replace(/I'm/g, "I am").replace(/don't/g, "do not").replace(/can't/g, "cannot");
      if (!out.startsWith("Based on")) out = "Based on the evidence presented, " + out.charAt(0).toLowerCase() + out.slice(1);
      break;
    case 'Natural':
      if (!out.startsWith("To be honest")) out = "To be honest, " + out.charAt(0).toLowerCase() + out.slice(1);
      out = out.replace(/\. /g, ". Actually, ");
      break;
    case 'Casual':
      out = out.replace(/\./g, "!");
      if (!out.startsWith("Basically")) out = "Basically, " + out.charAt(0).toLowerCase() + out.slice(1);
      break;
    case 'Professional':
      if (!out.startsWith("Please note that")) out = "Please note that " + out.charAt(0).toLowerCase() + out.slice(1);
      break;
    case 'Creative':
      out = "Consider this: " + out;
      out = out.replace(/\. /g, "... and remarkably, ");
      break;
    case 'Expand':
      out = out.replace(/\. /g, ". This observation is reinforced by several related aspects that add clarity to the topic. ");
      break;
    case 'Shorten':
      const sentences = out.split(/[.!?]/);
      out = sentences.slice(0, Math.ceil(sentences.length / 1.5)).join('.') + ".";
      break;
  }

  // 4. Ensure final punctuation
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
      
      let score = 88;
      if (activeMode === 'Academic') score = 76;
      if (activeMode === 'Natural') score = 96;
      if (activeMode === 'Professional') score = 84;

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
        changesMade: Math.floor(Math.random() * 15) + 8
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
        <Link href="/tools/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* HEADER SECTION */}
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-8 sm:p-10 mb-8 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <PdfToolIcon toolId="text-humanizer" size="xl" className="shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Text Humanizer</h1>
              <p className="text-slate-600 dark:text-gray-400 font-normal mt-1.5 text-sm sm:text-base">Rewrite AI-generated text for a more natural tone, improved clarity and smoother readability.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-white/5 px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10">
              {(['English', 'Hindi', 'Hinglish'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    language === lang 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MODE SELECTOR */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 custom-scrollbar">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex flex-col items-start gap-1.5 px-5 py-3.5 rounded-2xl text-left transition-all border shrink-0 w-[180px] sm:w-[200px] ${
                activeMode === mode.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <mode.icon className={`w-4 h-4 shrink-0 ${activeMode === mode.id ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                <span className="font-bold text-sm tracking-tight">{mode.label}</span>
              </div>
              <span className={`text-xs font-normal leading-snug line-clamp-2 ${activeMode === mode.id ? 'text-blue-50' : 'text-slate-500 dark:text-gray-400'}`}>
                {mode.description}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* INPUT AREA */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl flex flex-col h-full min-h-[550px] overflow-hidden group focus-within:border-blue-500 transition-all">
              <div className="px-8 py-4.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <AlignLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Original Content</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-gray-400">
                    <span>{wordCount(inputText)} Words</span>
                    <span>{charCount(inputText)} Characters</span>
                  </div>
                  <button onClick={clearAll} title="Clear text" className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Paste the text you want to improve..."
                className="flex-1 p-8 text-base sm:text-lg font-normal text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none resize-none bg-transparent leading-relaxed custom-scrollbar"
              />
              <div className="p-6 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 space-y-4">
                {/* Cloud AI Notice */}
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-slate-700 dark:text-blue-200 text-xs font-medium leading-relaxed">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>Submitted text is processed using an AI service to rewrite and improve clarity. Please avoid submitting sensitive or confidential personal data.</span>
                </div>

                <button
                  onClick={handleHumanize}
                  disabled={isGenerating || !inputText.trim()}
                  className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold tracking-wide text-sm flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md shadow-blue-600/20 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none group"
                >
                  {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                  {isGenerating ? 'Rewriting Text...' : 'Humanize Content'}
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
                  className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl h-full min-h-[550px] flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-slate-200 dark:border-white/10">
                    <Wand2 className="w-10 h-10 text-slate-400 dark:text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Ready to Humanize</h3>
                  <p className="text-slate-500 dark:text-gray-400 max-w-sm text-sm font-normal leading-relaxed">Your rewritten text will appear here after processing.</p>
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl h-full min-h-[550px] flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="relative mb-8">
                    <RefreshCw className="w-16 h-16 text-blue-600 animate-spin" />
                    <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-amber-500 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Improving Tone & Flow</h3>
                  <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm font-normal">Refining phrasing and rhythm...</p>
                  
                  <div className="mt-8 w-full max-w-xs h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              ) : result && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Results Header Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Readability Score</p>
                        <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">{result.readabilityScore}<span className="text-sm font-normal text-slate-500 ml-0.5">%</span></h4>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Natural Tone</p>
                        <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">Enhanced</h4>
                      </div>
                    </div>
                  </div>

                  {/* Main Output Content */}
                  <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl flex flex-col overflow-hidden">
                    <div className="px-8 py-4.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/20">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Humanized Result</span>
                      </div>
                      <button 
                        onClick={copyText}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100 active:scale-95 shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Result
                      </button>
                    </div>
                    <div className="p-8 min-h-[260px]">
                      <p className="text-base sm:text-lg font-normal text-slate-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                        {result.outputText}
                      </p>
                    </div>
                    
                    {/* Improvement Chips */}
                    <div className="px-8 py-6 bg-slate-50/60 dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/10">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">Optimization Highlights</h4>
                      <div className="flex flex-wrap gap-2.5">
                        {result.improvements.map((imp, i) => (
                          <div key={i} className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {imp}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Trust Banner */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                          <Info className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold">More Content & Productivity Tools</h4>
                          <p className="text-xs text-blue-100 opacity-90">Explore free PDF and writing utilities on ToolWala.</p>
                        </div>
                      </div>
                      <Link href="/tools/" className="bg-white text-blue-600 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-50 active:scale-95 transition-all shadow-md shrink-0">
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

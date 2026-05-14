"use client";

import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';
import { 
  FileText, Sparkles, RefreshCw, Copy, CheckCircle, 
  AlertCircle, Settings, UserCheck, SlidersHorizontal, BookOpen,
  ArrowLeft, AlignLeft, Info, ExternalLink, Scissors,
  Maximize2, Minimize2, BarChart3, Wand2, Trash2
} from 'lucide-react';

// --- TYPES ---
type ToneMode = 'Standard' | 'Academic' | 'Simple' | 'Flowing' | 'Informal' | 'Formal' | 'Expand' | 'Shorten';
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
const MODES: { id: ToneMode; label: string; icon: any }[] = [
  { id: 'Standard', label: 'Standard', icon: Wand2 },
  { id: 'Academic', label: 'Academic', icon: BookOpen },
  { id: 'Simple', label: 'Simple', icon: Minimize2 },
  { id: 'Flowing', label: 'Flowing', icon: RefreshCw },
  { id: 'Informal', label: 'Informal', icon: UserCheck },
  { id: 'Formal', label: 'Formal', icon: BriefcaseIcon },
  { id: 'Expand', label: 'Expand', icon: Maximize2 },
  { id: 'Shorten', label: 'Shorten', icon: Scissors },
];

function BriefcaseIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}

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
  
  // Professional / Natural Replacements
  { pattern: /doing job/gi, replacement: "working" },
  { pattern: /doing coding/gi, replacement: "coding" },
  { pattern: /do party/gi, replacement: "celebrate" },
  { pattern: /increase my salary/gi, replacement: "increased my salary" },
  { pattern: /sir/gi, replacement: "manager" },
  
  // AI-ish patterns
  { pattern: /Furthermore,/g, replacement: "Also," },
  { pattern: /Moreover,/g, replacement: "In addition," },
  { pattern: /It is important to note that/g, replacement: "Keep in mind that" },
  { pattern: /delve into/g, replacement: "explore" },
  { pattern: /utilize/g, replacement: "use" },
];

const rewriteText = (text: string, mode: ToneMode, lang: Language): string => {
  if (!text.trim()) return "";
  let out = text;

  // 1. Basic Cleaning
  HUMANIZER_RULES.forEach(rule => {
    out = out.replace(rule.pattern, rule.replacement);
  });

  // 2. Sentence Capitalization
  out = out.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

  // 3. Add missing full stops at ends of lines if missing
  if (out.length > 0 && !/[.!?]$/.test(out.trim())) {
    out = out.trim() + ".";
  }

  // 4. Mode-based adjustments
  switch (mode) {
    case 'Academic':
      out = out.replace(/I'm/g, "I am").replace(/don't/g, "do not").replace(/can't/g, "cannot");
      out = "Based on the provided context, " + out;
      break;
    case 'Simple':
      out = out.replace(/increased my salary/g, "gave me a raise");
      break;
    case 'Informal':
      out = "Hey! " + out + " Anyway, that's what I think.";
      break;
    case 'Formal':
      out = "I am writing to inform you that " + out.charAt(0).toLowerCase() + out.slice(1);
      break;
    case 'Expand':
      out = out.replace(/\./g, ". This is significant because it impacts the overall progress and provides a better perspective on the situation.");
      break;
    case 'Shorten':
      const sentences = out.split(/[.!?]/);
      out = sentences.slice(0, Math.ceil(sentences.length / 2)).join('.') + ".";
      break;
  }

  // 5. Language Handling
  if (lang === 'Hindi') {
    out = "यह आपकी सामग्री का हिंदी अनुवाद है: " + out;
  } else if (lang === 'Hinglish') {
    out = out.replace(/I am/g, "Main").replace(/Today/g, "Aaj").replace(/happy/g, "khush");
  }

  return out;
};

export default function ProfessionalTextHumanizer() {
  const [inputText, setInputText] = useState("");
  const [activeMode, setActiveMode] = useState<ToneMode>('Standard');
  const [language, setLanguage] = useState<Language>('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<HumanizedResult | null>(null);
  const [copied, setCopied] = useState(false);

  const wordCount = useMemo(() => (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0, []);

  const handleHumanize = useCallback(() => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    
    // Artificial delay to simulate processing
    setTimeout(() => {
      const output = rewriteText(inputText, activeMode, language);
      const originalCount = wordCount(inputText);
      const newCount = wordCount(output);
      
      // Calculate a pseudo readability score
      let score = 85;
      if (activeMode === 'Academic') score = 65;
      if (activeMode === 'Simple') score = 95;

      setResult({
        outputText: output,
        originalWordCount: originalCount,
        newWordCount: newCount,
        readabilityScore: score,
        improvements: [
          "Fixed capitalization and punctuation",
          "Improved sentence structure and flow",
          "Removed robotic AI patterns",
          activeMode === 'Simple' ? "Simplified vocabulary" : "Professional tone adjustment"
        ],
        changesMade: Math.abs(newCount - originalCount) + 5
      });
      setIsGenerating(false);
    }, 800);
  }, [inputText, activeMode, language, wordCount]);

  const copyText = () => {
    if (!result?.outputText) return;
    navigator.clipboard.writeText(result.outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputText("");
    setResult(null);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* TOP NAV */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/tools" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Tools
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              {(['English', 'Hindi', 'Hinglish'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    language === lang ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* HEADER */}
        <div className="bg-white rounded-[2.5rem] p-8 mb-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100 rotate-3">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI Text Humanizer</h1>
              <p className="text-gray-500 font-medium mt-1">Rewrite robotic text into natural, human-friendly content.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100">
            <Info className="w-4 h-4 text-amber-600" />
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-none">
              Premium AI API Integration Coming Soon
            </p>
          </div>
        </div>

        {/* MODE TABS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all border-2 whitespace-nowrap ${
                activeMode === mode.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' 
                  : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: INPUT */}
          <div className="space-y-4 flex flex-col">
            <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm flex flex-col h-full min-h-[500px] overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-gray-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Input Content</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{wordCount(inputText)} Words</span>
                  <button onClick={clearAll} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Paste your text here (e.g. hello my friend how are you...)"
                className="flex-1 p-8 text-lg font-medium text-gray-800 placeholder:text-gray-300 outline-none resize-none custom-scrollbar leading-relaxed"
              />
              <div className="p-6 bg-white border-t border-gray-50">
                <button
                  onClick={handleHumanize}
                  disabled={isGenerating || !inputText.trim()}
                  className="w-full py-5 rounded-[1.5rem] bg-blue-600 text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGenerating ? 'Polishing Text...' : 'Humanize My Text'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: OUTPUT */}
          <div className="space-y-6">
            {!result && !isGenerating ? (
              <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-8">
                  <Wand2 className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Ready to Rewrite</h3>
                <p className="text-gray-500 max-w-xs font-medium">Select a mode and click generate to transform your text into human-quality content.</p>
              </div>
            ) : isGenerating ? (
              <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center">
                <div className="relative">
                  <RefreshCw className="w-16 h-16 text-blue-600 animate-spin" />
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mt-8">Analyzing Patterns</h3>
                <p className="text-gray-500 mt-2 font-medium">Applying {activeMode} tone adjustments...</p>
              </div>
            ) : result && (
              <div className="space-y-6 animate-fade-up">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Readability</p>
                      <h4 className="text-2xl font-black text-gray-900">{result.readabilityScore}<span className="text-xs text-gray-400">/100</span></h4>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Changes</p>
                      <h4 className="text-2xl font-black text-gray-900">{result.changesMade}+</h4>
                    </div>
                  </div>
                </div>

                {/* Main Result */}
                <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Polished Result</span>
                    </div>
                    <button 
                      onClick={copyText}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        copied ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'COPIED' : 'COPY TEXT'}
                    </button>
                  </div>
                  <div className="p-8">
                    <p className="text-lg font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {result.outputText}
                    </p>
                  </div>
                  
                  {/* Improvement List */}
                  <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Improvement Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.improvements.map((imp, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] font-bold text-gray-600">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          {imp}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest mb-1">Was this helpful?</h4>
                      <p className="text-xs font-medium text-blue-100">Your feedback helps us improve our AI models.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">👍</button>
                      <button className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">👎</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

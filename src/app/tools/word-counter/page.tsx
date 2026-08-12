"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Type, Copy, Trash2, Download, Upload, ShieldCheck, 
  Zap, Clock, Mic, FileText, CheckCircle2, AlertCircle, Sparkles, 
  BookOpen, AlignLeft, RefreshCw, Layers, Sliders, Check, BarChart2,
  Share2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';

const SEO_DESC = "Count words, characters, sentences, paragraphs, reading time, and keyword density in real-time. 100% private, browser-based text counter.";

// Common English Stop Words for Keyword Density Filtering
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

// Social Media Limit Presets
interface LimitPreset {
  label: string;
  limit: number;
  icon: string;
}

const PRESETS: LimitPreset[] = [
  { label: 'Twitter / X', limit: 280, icon: '🐦' },
  { label: 'Instagram Caption', limit: 2200, icon: '📸' },
  { label: 'YouTube Title', limit: 100, icon: '📺' },
  { label: 'Meta SEO Description', limit: 160, icon: '🔍' },
  { label: 'LinkedIn Post', limit: 3000, icon: '💼' },
];

export default function WordCounterPage() {
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Main Text Input State
  const [text, setText] = useState<string>(
    "ToolWala AI is a privacy-first utility website offering fast, browser-based tools with zero data collection. Try typing or pasting your document here to calculate words, characters, sentences, paragraphs, reading time, and keyword density in real-time!"
  );

  // Exclude spaces setting
  const [excludeSpaces, setExcludeSpaces] = useState<boolean>(false);

  // Target Limit State
  const [activePreset, setActivePreset] = useState<LimitPreset | null>(PRESETS[0]);
  const [customLimit, setCustomLimit] = useState<number>(280);

  // Copy Feedback
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Core Metrics Calculation
  const metrics = useMemo(() => {
    if (!text) {
      return {
        words: 0,
        charsWithSpaces: 0,
        charsWithoutSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeSec: 0,
        speakingTimeSec: 0
      };
    }

    const charsWithSpaces = text.length;
    const charsWithoutSpaces = text.replace(/\s/g, '').length;

    // Word Count (splits by spaces/newlines and filters empty tokens)
    const trimmedText = text.trim();
    const wordsArray = trimmedText ? trimmedText.split(/\s+/).filter(Boolean) : [];
    const words = wordsArray.length;

    // Sentence Count (splits by . ! ?)
    const sentences = trimmedText ? (trimmedText.match(/[^.!?]+[.!?]+/g) || [trimmedText]).length : 0;

    // Paragraph Count (splits by double newline or blank lines)
    const paragraphs = trimmedText ? trimmedText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0;

    // Reading Time (Avg 200 Words Per Minute = 3.33 words/sec)
    const readingTimeSec = Math.ceil((words / 200) * 60);

    // Speaking Time (Avg 130 Words Per Minute = 2.16 words/sec)
    const speakingTimeSec = Math.ceil((words / 130) * 60);

    return {
      words,
      charsWithSpaces,
      charsWithoutSpaces,
      sentences,
      paragraphs,
      readingTimeSec,
      speakingTimeSec
    };
  }, [text]);

  // Keyword Density Calculation (Top 8 words excluding stop words)
  const keywordDensity = useMemo(() => {
    if (!text.trim()) return [];

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

    if (words.length === 0) return [];

    const freqMap: Record<string, number> = {};
    words.forEach((w) => {
      freqMap[w] = (freqMap[w] || 0) + 1;
    });

    const totalWords = words.length;

    return Object.entries(freqMap)
      .map(([word, count]) => ({
        word,
        count,
        percent: Number(((count / totalWords) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [text]);

  // Active limit number
  const currentTargetLimit = activePreset ? activePreset.limit : customLimit;
  const currentChars = excludeSpaces ? metrics.charsWithoutSpaces : metrics.charsWithSpaces;
  const charsRemaining = currentTargetLimit - currentChars;
  const limitPct = Math.min(100, Math.max(0, Math.round((currentChars / currentTargetLimit) * 100)));
  const isOverLimit = currentChars > currentTargetLimit;

  // Format Seconds into Mins & Secs
  const formatDuration = (totalSeconds: number): string => {
    if (totalSeconds === 0) return '0 sec';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} sec`;
    if (secs === 0) return `${mins} min`;
    return `${mins} min ${secs} sec`;
  };

  // Case Conversion Functions
  const handleUppercase = () => setText((prev) => prev.toUpperCase());
  const handleLowercase = () => setText((prev) => prev.toLowerCase());
  
  const handleTitleCase = () => {
    setText((prev) =>
      prev.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    );
  };

  const handleSentenceCase = () => {
    setText((prev) =>
      prev.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase())
    );
  };

  // Copy & File Operations
  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ToolWala-Document.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const article = toolArticles['word-counter'];

  return (
    <ToolVisibilityGuard slug="word-counter">
      <div className="relative min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden font-sans">
        {/* Background Gradients */}
        <MeshGradient />
        <FloatingParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          
          {/* Top Breadcrumbs */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/tools" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Tools
            </Link>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4" /> 100% In-Browser & Private
            </span>
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
              <Type className="w-4 h-4" />
              <span>Utility Tools</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-3 uppercase leading-none">
              Word & Character Counter
            </h1>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-extrabold uppercase tracking-widest mb-4">
              Real-Time Text Analytics, Limits & Keyword Density
            </p>
            <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
              {SEO_DESC}
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 mt-6">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Private & Secure
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <Zap className="w-3.5 h-3.5 text-emerald-500" /> Instant Live Counter
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-500" /> Keyword Density
              </span>
            </div>
          </div>

          {/* Main Two-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Text Area & Tools Toolbar */}
            <div className="w-full lg:w-7/12 space-y-6">
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 p-6 sm:p-8 bg-white dark:bg-white/[0.01] shadow-2xl flex flex-col min-h-[580px]">
                
                {/* Top Toolbar: Case Converters & File Ops */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/5 pb-4 mb-4">
                  
                  {/* Case Converters */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-500 pr-1">Case:</span>
                    <button
                      onClick={handleUppercase}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-[11px] font-extrabold transition-colors border border-slate-200 dark:border-white/10"
                      title="Convert to UPPERCASE"
                    >
                      UPPER
                    </button>
                    <button
                      onClick={handleLowercase}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-[11px] font-extrabold transition-colors border border-slate-200 dark:border-white/10"
                      title="Convert to lowercase"
                    >
                      lower
                    </button>
                    <button
                      onClick={handleTitleCase}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-[11px] font-extrabold transition-colors border border-slate-200 dark:border-white/10"
                      title="Convert to Title Case"
                    >
                      Title
                    </button>
                    <button
                      onClick={handleSentenceCase}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-[11px] font-extrabold transition-colors border border-slate-200 dark:border-white/10"
                      title="Convert to Sentence case"
                    >
                      Sentence
                    </button>
                  </div>

                  {/* File & Copy Actions */}
                  <div className="flex items-center gap-2">
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".txt,.md,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-bold transition-colors border border-slate-200 dark:border-white/10 flex items-center gap-1"
                      title="Upload file"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>

                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-bold transition-colors border border-slate-200 dark:border-white/10 flex items-center gap-1"
                      title="Copy text"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>

                    <button
                      onClick={handleDownload}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-colors border border-emerald-500/20 flex items-center gap-1"
                      title="Download text file"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>

                    <button
                      onClick={handleClear}
                      className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Clear text"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Main Textarea Input */}
                <div className="relative flex-grow flex flex-col">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start typing or paste your text here..."
                    className="w-full flex-grow min-h-[360px] bg-transparent text-slate-900 dark:text-white font-sans text-base leading-relaxed focus:outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-white/20"
                  />
                </div>

                {/* Bottom Options Checkbox */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-gray-400 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={excludeSpaces}
                      onChange={(e) => setExcludeSpaces(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-white/20 accent-emerald-500 cursor-pointer"
                    />
                    <span>Exclude spaces from character limit check</span>
                  </label>

                  <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-gray-500">
                    {text.length} chars
                  </span>
                </div>

              </div>
            </div>

            {/* Right Column: Live Metrics, Platform Limits & Keyword Density */}
            <div className="w-full lg:w-5/12 space-y-6">
              
              {/* Primary Live Counter Grid */}
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 p-6 sm:p-8 bg-white dark:bg-white/[0.01] shadow-2xl space-y-6">
                
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-3">
                  <BarChart2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Live Text Analytics</h3>
                </div>

                {/* Top Featured Hero Card: Words & Characters */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Words */}
                  <div className="bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 text-center shadow-inner dark:shadow-none">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">Words</span>
                    <motion.span 
                      key={metrics.words}
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono block"
                    >
                      {metrics.words.toLocaleString()}
                    </motion.span>
                  </div>

                  {/* Characters */}
                  <div className="bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 text-center shadow-inner dark:shadow-none">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">Characters</span>
                    <motion.span 
                      key={metrics.charsWithSpaces}
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono block"
                    >
                      {metrics.charsWithSpaces.toLocaleString()}
                    </motion.span>
                  </div>
                </div>

                {/* Secondary Counters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400 block">No Spaces</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{metrics.charsWithoutSpaces.toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400 block">Sentences</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{metrics.sentences}</span>
                  </div>

                  <div className="bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400 block">Paragraphs</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{metrics.paragraphs}</span>
                  </div>
                </div>

                {/* Time Estimates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">Reading Time</span>
                      <span className="text-sm font-extrabold font-mono">{formatDuration(metrics.readingTimeSec)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300">
                    <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">Speaking Time</span>
                      <span className="text-sm font-extrabold font-mono">{formatDuration(metrics.speakingTimeSec)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Social Media Character Limit Checker */}
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 p-6 sm:p-8 bg-white dark:bg-white/[0.01] shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Platform Limit Checker</span>
                  <span className={`text-xs font-mono font-extrabold ${isOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {isOverLimit ? `⚠️ ${Math.abs(charsRemaining)} over limit` : `${charsRemaining} remaining`}
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setActivePreset(p)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 border ${
                        activePreset?.label === p.label
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-emerald-500/40'
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label} ({p.limit})</span>
                    </button>
                  ))}
                </div>

                {/* Limit Progress Bar */}
                <div className="space-y-1 pt-2">
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner relative">
                    <motion.div 
                      className={`h-full rounded-full transition-colors ${
                        isOverLimit ? 'bg-rose-500' : limitPct > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      animate={{ width: `${limitPct}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-gray-500">
                    <span>{currentChars} chars</span>
                    <span>Target: {currentTargetLimit} chars</span>
                  </div>
                </div>
              </div>

              {/* Keyword Density Table */}
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 p-6 sm:p-8 bg-white dark:bg-white/[0.01] shadow-2xl space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white block">Top Keyword Density</span>
                
                {keywordDensity.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-medium italic text-center py-4">
                    Type text above to analyze word frequency...
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {keywordDensity.map((item) => (
                      <div key={item.word} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-900 dark:text-white font-mono">{item.word}</span>
                          <span className="text-slate-500 dark:text-gray-400 font-mono text-[11px]">
                            {item.count} ({item.percent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, item.percent * 3)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Privacy Note */}
              <div className="glass rounded-2xl border border-emerald-500/20 p-4 bg-emerald-500/5 text-slate-700 dark:text-gray-300 flex items-start gap-3 text-xs font-medium shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Privacy Note:</strong> Your document is processed 100% locally inside your web browser memory. No text is ever uploaded or sent to any server.
                </p>
              </div>

            </div>

          </div>

          {/* Educational Content & Article */}
          <section id="learn-more-section" className="py-16 border-t border-slate-200 dark:border-white/5 mt-16 pt-16">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest mb-4">
                <BookOpen className="w-4 h-4" />
                <span>Text Analytics Guide</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-4">
                📚 Optimize Copy & Social Media Limits
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
                Why word count, character limits, and keyword density matter for SEO and social engagement.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">
                  🎯 Social Media Accuracy
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  Never get truncated on Twitter (280 chars), Instagram (2200 chars), or LinkedIn. Our live meter alerts you before exceeding limits.
                </p>
              </div>

              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                  🔍 Keyword Density Optimization
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  Avoid keyword stuffing in SEO content by keeping core target terms between 1% to 3% of your total document word count.
                </p>
              </div>

              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3">
                  ⏱️ Reading & Speech Estimates
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  Accurately estimate presentation durations for public speaking (130 WPM) and article reading times (200 WPM).
                </p>
              </div>
            </div>

            {/* Article */}
            {article && <ToolArticle {...article} />}

          </section>

        </div>
      </div>
    </ToolVisibilityGuard>
  );
}

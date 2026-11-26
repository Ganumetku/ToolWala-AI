"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Binary, CheckCircle2, AlertCircle, Copy, Download, 
  Upload, Trash2, ShieldCheck, ArrowRightLeft, Check, Sparkles,
  BookOpen, ArrowRight, RefreshCw, Globe, HelpCircle, ChevronDown,
  FileCode2, Link2, SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { useTranslation } from '@/components/I18nContext';
import PdfToolIcon from '@/components/PdfToolIcon';

type ToolMode = 'base64' | 'url';
type OperationDirection = 'encode' | 'decode';

const SAMPLE_TEXT_BASE64 = `ToolWala AI — Zero-Upload Privacy! 🚀\nनमस्ते दुनिया (Hello World in Hindi)\n{"service": "Base64 & URL Encoder-Decoder", "inBrowser": true}`;
const SAMPLE_BASE64_ENCODED = `VG9vbFdhbGEgQUkg4oCUIFplcm8tVXBsb2FkIFByaXZhY3khIPCfmYAK4KSo4KSu4KS44KWN4KSk4KWHIOCkpuClgeCkqOCkv+CkrWFhIChIZWxsbyBXb3JsZCBpbiBIaW5kaSkKeyJzZXJ2aWNlIjogIkJhc2U2NCAmIFVSTCBFbmNvZGVyLURlY29kZXIiLCAiaW5Ccm93c2VyIjogdHJ1ZX0=`;

const SAMPLE_TEXT_URL = `https://toolwala.co/search?q=Base64 & URL Encoder/Decoder&category=developer tools&lang=en#results`;
const SAMPLE_URL_ENCODED = `https%3A%2F%2Ftoolwala.co%2Fsearch%3Fq%3DBase64%20%26%20URL%20Encoder%2FDecoder%26category%3Ddeveloper%20tools%26lang%3Den%23results`;

// UTF-8 safe Base64 encoding with chunking for large strings
function utf8ToBase64(str: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  const CHUNK_SIZE = 8192;
  for (let i = 0; i < len; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  let base64 = btoa(binary);
  if (urlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return base64;
}

// UTF-8 safe Base64 decoding
function base64ToUtf8(str: string): string {
  let clean = str.trim().replace(/\s+/g, '');
  if (!clean) return '';
  clean = clean.replace(/-/g, '+').replace(/_/g, '/');
  while (clean.length % 4 !== 0) {
    clean += '=';
  }
  if (!/^[A-Za-z0-9+/=]+$/.test(clean)) {
    throw new Error('Invalid character in Base64 string. Only A-Z, a-z, 0-9, +, /, and = are permitted.');
  }
  let binary = '';
  try {
    binary = atob(clean);
  } catch (err: any) {
    throw new Error(err?.message || 'Invalid Base64 format');
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return binary;
  }
}

// URL encode wrapper
function encodeUrlString(str: string, componentMode = true): string {
  if (componentMode) {
    return encodeURIComponent(str);
  }
  return encodeURI(str);
}

// URL decode wrapper
function decodeUrlString(str: string, componentMode = true, treatPlusAsSpace = true): string {
  const prepared = treatPlusAsSpace ? str.replace(/\+/g, '%20') : str;
  try {
    if (componentMode) {
      return decodeURIComponent(prepared);
    }
    return decodeURI(prepared);
  } catch {
    throw new Error('Malformed URI sequence. Input contains invalid or incomplete percent-encoded characters (e.g. %ZZ or truncated % sequence).');
  }
}

// Line wrapping helper
function wrapLines(text: string, wrapLimit: number): string {
  if (wrapLimit <= 0) return text;
  const regex = new RegExp(`.{1,${wrapLimit}}`, 'g');
  return text.match(regex)?.join('\n') || text;
}

// Calculate exact UTF-8 byte count
function getUtf8ByteCount(text: string): number {
  return new TextEncoder().encode(text).length;
}

const FAQS_DATA = [
  {
    question: "What is Base64 encoding used for?",
    answer: "Base64 is a binary-to-text encoding scheme that translates binary data into an ASCII string format using 64 printable characters (A-Z, a-z, 0-9, +, /). It is commonly used to safely transmit binary data through media designed for text, such as embedding images in HTML/CSS, sending email attachments (MIME), or passing authorization tokens."
  },
  {
    question: "Is URL encoding the same as Base64?",
    answer: "No. URL encoding (also known as percent-encoding) replaces unsafe or reserved ASCII characters with a '%' followed by their two-digit hexadecimal representation (e.g., a space becomes '%20'). It ensures URLs conform to the URI standard. Base64, by contrast, encodes entire strings or binary blobs into a uniform 6-bit representation."
  },
  {
    question: "Is my data safe when I use this tool?",
    answer: "Yes, 100%. All Base64 and URL encoding and decoding operations happen locally inside your web browser using client-side JavaScript APIs (TextEncoder, TextDecoder, btoa, atob, encodeURIComponent). No text or files are ever sent to our servers or stored anywhere."
  },
  {
    question: "Does this Base64 tool support emojis and non-English text (UTF-8)?",
    answer: "Yes! Unlike traditional web tools that throw 'InvalidCharacterError' on characters outside the Latin1 range, ToolWala AI uses a UTF-8 safe TextEncoder/TextDecoder wrapper, correctly preserving Hindi, Arabic, Japanese, accents, and emojis."
  }
];

export default function Base64UrlEncoderDecoderPage() {
  const { localizeHref } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core configuration state
  const [toolMode, setToolMode] = useState<ToolMode>('base64');
  const [direction, setDirection] = useState<OperationDirection>('encode');
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT_BASE64);
  const [copied, setCopied] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  // Advanced options state
  const [urlSafeBase64, setUrlSafeBase64] = useState<boolean>(false);
  const [lineWrap, setLineWrap] = useState<number>(0); // 0 = no wrap, 64 = MIME, 76 = RFC
  const [uriComponentMode, setUriComponentMode] = useState<boolean>(true); // true = encodeURIComponent, false = encodeURI
  const [treatPlusAsSpace, setTreatPlusAsSpace] = useState<boolean>(true);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Conversion computation
  const conversionResult = useMemo(() => {
    if (!inputText) {
      return { output: '', error: null, isEmpty: true };
    }

    try {
      if (toolMode === 'base64') {
        if (direction === 'encode') {
          let encoded = utf8ToBase64(inputText, urlSafeBase64);
          if (lineWrap > 0) {
            encoded = wrapLines(encoded, lineWrap);
          }
          return { output: encoded, error: null, isEmpty: false };
        } else {
          const decoded = base64ToUtf8(inputText);
          return { output: decoded, error: null, isEmpty: false };
        }
      } else {
        // URL Encoding mode
        if (direction === 'encode') {
          const encoded = encodeUrlString(inputText, uriComponentMode);
          return { output: encoded, error: null, isEmpty: false };
        } else {
          const decoded = decodeUrlString(inputText, uriComponentMode, treatPlusAsSpace);
          return { output: decoded, error: null, isEmpty: false };
        }
      }
    } catch (err: any) {
      return {
        output: '',
        error: err?.message || 'An error occurred during conversion.',
        isEmpty: false
      };
    }
  }, [inputText, toolMode, direction, urlSafeBase64, lineWrap, uriComponentMode, treatPlusAsSpace]);

  // Input & Output metrics
  const inputMetrics = useMemo(() => {
    const chars = inputText.length;
    const bytes = getUtf8ByteCount(inputText);
    const lines = inputText ? (inputText.match(/\n/g) || []).length + 1 : 0;
    return { chars, bytes, lines };
  }, [inputText]);

  const outputMetrics = useMemo(() => {
    const out = conversionResult.output;
    const chars = out.length;
    const bytes = getUtf8ByteCount(out);
    const lines = out ? (out.match(/\n/g) || []).length + 1 : 0;
    return { chars, bytes, lines };
  }, [conversionResult.output]);

  // Handlers
  const handleSwap = () => {
    if (conversionResult.output) {
      setInputText(conversionResult.output);
      setDirection(prev => (prev === 'encode' ? 'decode' : 'encode'));
    } else {
      setDirection(prev => (prev === 'encode' ? 'decode' : 'encode'));
    }
  };

  const handleClear = () => {
    setInputText('');
  };

  const handleCopy = () => {
    if (!conversionResult.output) return;
    navigator.clipboard.writeText(conversionResult.output);
    setCopied(true);
    setShowToast(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleDownload = () => {
    if (!conversionResult.output) return;
    const ext = toolMode === 'base64' && direction === 'encode' ? 'b64' : 'txt';
    const filename = `${toolMode}-${direction}-output.${ext}`;
    const blob = new Blob([conversionResult.output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content === 'string') {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    if (toolMode === 'base64') {
      setInputText(direction === 'encode' ? SAMPLE_TEXT_BASE64 : SAMPLE_BASE64_ENCODED);
    } else {
      setInputText(direction === 'encode' ? SAMPLE_TEXT_URL : SAMPLE_URL_ENCODED);
    }
  };

  // Change mode tabs smoothly with appropriate samples
  const handleModeChange = (newMode: ToolMode) => {
    setToolMode(newMode);
    if (!inputText || inputText === SAMPLE_TEXT_BASE64 || inputText === SAMPLE_BASE64_ENCODED || inputText === SAMPLE_TEXT_URL || inputText === SAMPLE_URL_ENCODED) {
      if (newMode === 'base64') {
        setInputText(direction === 'encode' ? SAMPLE_TEXT_BASE64 : SAMPLE_BASE64_ENCODED);
      } else {
        setInputText(direction === 'encode' ? SAMPLE_TEXT_URL : SAMPLE_URL_ENCODED);
      }
    }
  };

  return (
    <ToolVisibilityGuard slug="base64-encoder-decoder">
      <div className="relative min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden font-sans">
        {/* Background Gradients */}
        <MeshGradient />
        <FloatingParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          
          {/* Top Navigation & Security Badge */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/tools/" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Tools
            </Link>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4" /> 🔒 100% Browser-Based & Private
            </span>
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <PdfToolIcon toolId="base64-encoder-decoder" size="xl" className="mx-auto mb-4" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
              <Binary className="w-4 h-4" />
              <span>Developer Utilities</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-3 uppercase leading-none">
              Base64 & URL Encoder-Decoder
            </h1>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-4">
              Instant Two-Way Conversion • Full UTF-8 Unicode Support • Zero Server Upload
            </p>
            <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
              Encode and decode plain text, tokens, API credentials, and web URLs. Runs 100% locally in your browser memory for maximum privacy and zero latency.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mt-6">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/70 dark:bg-white/5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Zero Server Tracking
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/70 dark:bg-white/5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> UTF-8 & Emoji Safe
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/70 dark:bg-white/5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/5 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Instant Real-Time
              </span>
            </div>
          </div>

          {/* Main Interactive Workspace Section */}
          <div className="space-y-6">
            
            {/* Control Toolbar */}
            <div className="glass rounded-3xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 bg-white dark:bg-white/[0.02] shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                
                {/* Left: Mode Tabs & Direction Toggle */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Mode Tab Selector: Base64 vs URL Encoding */}
                  <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-inner">
                    <button
                      onClick={() => handleModeChange('base64')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        toolMode === 'base64'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Binary className="w-4 h-4" />
                      <span>Base64</span>
                    </button>
                    <button
                      onClick={() => handleModeChange('url')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        toolMode === 'url'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span>URL Encoding</span>
                    </button>
                  </div>

                  {/* Direction Selector: Encode vs Decode */}
                  <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <button
                      onClick={() => setDirection('encode')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                        direction === 'encode'
                          ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Encode
                    </button>
                    <button
                      onClick={() => setDirection('decode')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                        direction === 'decode'
                          ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Decode
                    </button>
                  </div>

                  {/* Swap Button */}
                  <button
                    onClick={handleSwap}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-bold text-xs transition-all border border-slate-200 dark:border-white/10 flex items-center gap-1.5 shadow-sm active:scale-95"
                    title="Swap Input and Output, reversing encode/decode"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Swap</span>
                  </button>

                  {/* Advanced Options Toggle */}
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm ${
                      showOptions
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Options</span>
                  </button>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleLoadSample}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-bold text-xs transition-colors border border-slate-200 dark:border-white/10 flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sample</span>
                  </button>

                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".txt,.b64,.json,.csv,.xml,.html"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-bold text-xs transition-colors border border-slate-200 dark:border-white/10 flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Upload</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    disabled={conversionResult.isEmpty || !!conversionResult.error}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={conversionResult.isEmpty || !!conversionResult.error}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-bold text-xs transition-colors border border-slate-200 dark:border-white/10 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    title="Download output as file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleClear}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 text-slate-500 transition-colors border border-slate-200 dark:border-white/10"
                    title="Clear input and output"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Collapsible Advanced Options Tray */}
              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pt-4 mt-4 border-t border-slate-200 dark:border-white/10"
                  >
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-gray-300">
                      
                      {toolMode === 'base64' && (
                        <>
                          {/* URL Safe Base64 Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                            <input
                              type="checkbox"
                              checked={urlSafeBase64}
                              onChange={(e) => setUrlSafeBase64(e.target.checked)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>URL-Safe Base64 (- and _ without =)</span>
                          </label>

                          {/* Line Wrapping */}
                          {direction === 'encode' && (
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                              <span>Line Wrap:</span>
                              <select
                                value={lineWrap}
                                onChange={(e) => setLineWrap(Number(e.target.value))}
                                className="bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-0.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                              >
                                <option value={0}>No Wrap (Single Line)</option>
                                <option value={64}>64 Chars (MIME Standard)</option>
                                <option value={76}>76 Chars (RFC 2045)</option>
                              </select>
                            </div>
                          )}
                        </>
                      )}

                      {toolMode === 'url' && (
                        <>
                          {/* Component vs Full URI Mode */}
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                            <span>Encoding Standard:</span>
                            <button
                              type="button"
                              onClick={() => setUriComponentMode(true)}
                              className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                                uriComponentMode
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              encodeURIComponent (All Special)
                            </button>
                            <button
                              type="button"
                              onClick={() => setUriComponentMode(false)}
                              className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                                !uriComponentMode
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              encodeURI (Preserve URL Scheme)
                            </button>
                          </div>

                          {/* Treat Plus as Space */}
                          {direction === 'decode' && (
                            <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                              <input
                                type="checkbox"
                                checked={treatPlusAsSpace}
                                onChange={(e) => setTreatPlusAsSpace(e.target.checked)}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>Decode &apos;+&apos; as space (form-urlencoded)</span>
                            </label>
                          )}
                        </>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Error or Status Banner */}
            <AnimatePresence mode="wait">
              {conversionResult.error ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-300 flex items-start sm:items-center justify-between gap-3 text-xs font-extrabold shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="uppercase tracking-wider">Decoding Error Detected</p>
                      <p className="font-mono text-slate-700 dark:text-rose-200 mt-0.5 font-normal">
                        {conversionResult.error}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-200 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 font-mono text-[11px] shrink-0">
                    Check Input Format
                  </span>
                </motion.div>
              ) : !conversionResult.isEmpty ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs font-extrabold shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {toolMode === 'base64'
                        ? direction === 'encode' ? '🟢 Successfully Encoded to Base64' : '🟢 Successfully Decoded from Base64'
                        : direction === 'encode' ? '🟢 Successfully Percent-Encoded URL' : '🟢 Successfully Decoded URL'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] opacity-80">
                    {outputMetrics.bytes} bytes ({outputMetrics.chars} chars)
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Two-Panel Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Panel: Input Box */}
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02] shadow-xl flex flex-col h-[500px]">
                
                {/* Left Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40">
                  <div className="flex items-center gap-2">
                    {toolMode === 'base64' ? (
                      <Binary className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      {direction === 'encode' ? 'Plain Text / Source Input' : `${toolMode === 'base64' ? 'Base64' : 'URL Encoded'} Input`}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-gray-400">
                    {inputMetrics.chars} chars • {inputMetrics.bytes} bytes
                  </span>
                </div>

                {/* Input Textarea */}
                <div className="relative flex-grow flex overflow-hidden">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      direction === 'encode'
                        ? `Paste or type text to encode with ${toolMode === 'base64' ? 'Base64' : 'URL percent-encoding'}...`
                        : `Paste ${toolMode === 'base64' ? 'Base64 string' : 'percent-encoded URL string'} to decode...`
                    }
                    spellCheck={false}
                    className="w-full h-full p-6 bg-transparent text-slate-900 dark:text-white font-mono text-xs leading-relaxed focus:outline-none resize-none overflow-auto"
                  />
                </div>

                {/* Left Panel Bottom Helper */}
                <div className="px-6 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400">
                  <span>{inputMetrics.lines} {inputMetrics.lines === 1 ? 'line' : 'lines'}</span>
                  <button
                    onClick={() => {
                      if (conversionResult.output) {
                        // Explicit accessibility trigger
                      }
                    }}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Auto-converts live as you type
                  </button>
                </div>

              </div>

              {/* Right Panel: Output Box */}
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02] shadow-xl flex flex-col h-[500px]">
                
                {/* Right Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      {direction === 'encode' ? `${toolMode === 'base64' ? 'Base64' : 'URL Encoded'} Output` : 'Decoded Plain Text'}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-gray-400">
                    {outputMetrics.chars} chars • {outputMetrics.bytes} bytes
                  </span>
                </div>

                {/* Output Display Area */}
                <div className="flex-grow p-6 overflow-auto font-mono text-xs bg-slate-900 text-white rounded-b-none selection:bg-emerald-500 selection:text-white">
                  {conversionResult.isEmpty ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                      <Binary className="w-8 h-8 opacity-40" />
                      <p className="text-xs font-medium">Converted output will appear here in real time...</p>
                    </div>
                  ) : conversionResult.error ? (
                    <div className="h-full flex flex-col items-center justify-center text-rose-400 space-y-3 p-6 text-center">
                      <AlertCircle className="w-10 h-10 opacity-80" />
                      <p className="text-sm font-bold">{conversionResult.error}</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Ensure the pasted string is properly formatted and does not contain illegal characters.
                      </p>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap break-all leading-relaxed font-mono">
                      {conversionResult.output}
                    </pre>
                  )}
                </div>

                {/* Right Panel Bottom Actions */}
                <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {outputMetrics.lines} {outputMetrics.lines === 1 ? 'line' : 'lines'}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopy}
                      disabled={conversionResult.isEmpty || !!conversionResult.error}
                      className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 disabled:opacity-40"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Output'}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={conversionResult.isEmpty || !!conversionResult.error}
                      className="font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-40"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Privacy Architecture Notice Card */}
            <div className="glass rounded-2xl border border-emerald-500/20 p-5 bg-emerald-500/5 text-slate-700 dark:text-gray-300 flex items-start gap-3 text-xs font-medium shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Zero-Upload Privacy Architecture:</strong> All encoding and decoding operations run 100% locally inside your web browser sandbox using native browser APIs. No strings, tokens, passwords, or query parameters are ever transmitted to any remote server or stored in logs.
              </p>
            </div>

          </div>

          {/* Educational Content & Deep Dive Section (SEO & Trust) */}
          <section id="developer-guide-section" className="py-16 border-t border-slate-200 dark:border-white/10 mt-16 pt-16">
            
            {/* Guide Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest mb-4">
                <BookOpen className="w-4 h-4" />
                <span>Developer Guide & Technical Reference</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-4">
                Understanding Base64 & URL Percent-Encoding
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
                Everything developers need to know about binary-to-text encodings, URI safety, and RFC standards.
              </p>
            </div>

            {/* Technical Explanations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              
              {/* What is Base64? */}
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/10 p-8 bg-white dark:bg-white/[0.02] shadow-md flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                    <Binary className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                    What is Base64 Encoding?
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 font-medium leading-relaxed space-y-3 font-sans">
                    <p>
                      <strong>Base64</strong> is a binary-to-text representation scheme designed to encode arbitrary binary data or text strings into an ASCII format. It divides binary sequences into 6-bit chunks, where each 6-bit integer maps to one of 64 printable characters: <code>A-Z</code>, <code>a-z</code>, <code>0-9</code>, <code>+</code>, and <code>/</code>, with <code>=</code> used for byte padding.
                    </p>
                    <p>
                      Because legacy network protocols like SMTP (email) and HTTP headers were built to transport 7-bit ASCII text, raw binary bytes could be corrupted during transit. Base64 guarantees that data passes through any gateway intact without modification.
                    </p>
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-emerald-300">
                      3 Raw Bytes (24 bits) → 4 Base64 Chars (33% size increase)
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-gray-400">
                  Common uses: Basic Auth headers, JWT payload inspection, inline data URIs in CSS/HTML, email MIME attachments.
                </div>
              </div>

              {/* What is URL Encoding? */}
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/10 p-8 bg-white dark:bg-white/[0.02] shadow-md flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                    What is URL Encoding (Percent-Encoding)?
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 font-medium leading-relaxed space-y-3 font-sans">
                    <p>
                      <strong>URL Encoding</strong> (governed by RFC 3986) transforms characters that are not permitted or reserved in a Uniform Resource Identifier (URI) into a percent-sign followed by their two-character hexadecimal UTF-8 byte value.
                    </p>
                    <p>
                      For example, a space character becomes <code>%20</code> (or <code>+</code> in form data), an ampersand <code>&amp;</code> becomes <code>%26</code>, and non-ASCII Unicode characters (like emojis or Hindi letters) are converted into their multi-byte hexadecimal sequence (e.g. <code>🚀</code> becomes <code>%F0%9F%9A%80</code>).
                    </p>
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-blue-300">
                      Space → %20 | &amp; → %26 | ? → %3F | / → %2F
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-gray-400">
                  Common uses: Query parameter serialization, OAuth redirects, form submissions, webhook URLs.
                </div>
              </div>

            </div>

            {/* Step-by-Step "How to use this tool" */}
            <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/10 p-8 sm:p-10 bg-white dark:bg-white/[0.02] shadow-md mb-16">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 text-center">
                How to Use the Base64 & URL Encoder-Decoder
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center mb-4">
                    1
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-2">
                    Pick Mode
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
                    Choose between <strong>Base64</strong> for binary data/tokens, or <strong>URL Encoding</strong> for web query parameters and links.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center mb-4">
                    2
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-2">
                    Select Direction
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
                    Select <strong>Encode</strong> to transform plain text into safe strings, or <strong>Decode</strong> to restore encoded strings to text.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center mb-4">
                    3
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-2">
                    Type or Upload
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
                    Paste raw text into the input panel, click <strong>Sample</strong> for a quick test, or click <strong>Upload</strong> to load a file.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center mb-4">
                    4
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-2">
                    Copy or Swap
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
                    Conversion updates live. Click <strong>Copy</strong> to copy output to clipboard, or click <strong>Swap</strong> to reverse immediately.
                  </p>
                </div>

              </div>
            </div>

            {/* FAQ Accordion Section */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Frequently Asked Questions</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="space-y-4">
                {FAQS_DATA.map((faq, idx) => (
                  <FAQAccordionItem key={idx} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>

          </section>

        </div>

        {/* Floating Toast Notification for Copy Confirmation */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400/40"
            >
              <Check className="w-4 h-4" />
              <span>Copied output to clipboard!</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ToolVisibilityGuard>
  );
}

function FAQAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border transition-all duration-300 rounded-[1.25rem] overflow-hidden ${
      isOpen 
        ? 'bg-white dark:bg-white/[0.03] border-emerald-500/40 shadow-[0_10px_35px_rgba(16,185,129,0.06)]' 
        : 'bg-white dark:bg-white/[0.01] border-slate-200 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-0.5'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
      >
        <span className={`text-sm sm:text-base font-black tracking-tight pr-6 transition-colors ${
          isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
        }`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 ${
          isOpen 
            ? 'bg-emerald-600 border-emerald-600 text-white' 
            : 'bg-emerald-50 dark:bg-white/5 border-emerald-100 dark:border-white/10 text-emerald-600 dark:text-gray-400'
        }`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-5 sm:px-6 pb-6 text-slate-600 dark:text-gray-400 font-medium leading-relaxed text-xs sm:text-sm font-sans">
              <div className="h-px w-8 bg-emerald-500/30 mb-4" />
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

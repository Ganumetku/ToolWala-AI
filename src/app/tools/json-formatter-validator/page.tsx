"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Code, CheckCircle2, AlertCircle, Copy, Download, 
  Upload, Trash2, ShieldCheck, Zap, Sliders, FileText, 
  ChevronRight, ChevronDown, ListFilter, RefreshCw, Eye, Sparkles,
  BookOpen, AlignLeft, Minimize2, Layers, Table, Check, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';
import PdfToolIcon from '@/components/PdfToolIcon';

const SEO_DESC = "Format, beautify, minify, validate, and convert JSON online. Line-number error detection, interactive tree view, and 100% in-browser privacy.";

// Default Sample JSON for initial demonstration
const SAMPLE_JSON = `{
  "toolName": "ToolWala AI JSON Formatter",
  "version": 1.0,
  "privacyFirst": true,
  "developer": "ToolWala AI Team",
  "features": [
    "100% In-Browser Validation",
    "Line-Number Error Detection",
    "Interactive Tree View",
    "CSV & YAML Conversion"
  ],
  "stats": {
    "speedMs": 0.5,
    "serverUploads": false,
    "activeUsers": 50000
  },
  "supportedFormats": ["JSON", "CSV", "YAML"]
}`;

// Helper: Recursively sort object keys alphabetically
function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key: string) => {
        acc[key] = sortObjectKeys(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

// Helper: Convert JSON Array/Object to CSV string
function jsonToCSV(json: any): string {
  try {
    let arr = Array.isArray(json) ? json : [json];
    if (arr.length === 0) return '';
    
    // Extract headers
    const headers = Array.from(
      new Set(arr.flatMap(item => (typeof item === 'object' && item !== null ? Object.keys(item) : ['value'])))
    );

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of arr) {
      const values = headers.map(header => {
        const val = typeof row === 'object' && row !== null ? row[header] : row;
        const escaped = ('' + (val ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  } catch (err) {
    return 'Failed to convert JSON to CSV. Ensure input is an object or array of objects.';
  }
}

// Helper: Simple Client-side JSON to YAML Converter
function jsonToYAML(obj: any, indent = 0): string {
  const spacing = ' '.repeat(indent);
  if (obj === null) return 'null';
  if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`;

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => `${spacing}- ${jsonToYAML(item, indent + 2).trimStart()}`).join('\n');
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    return keys
      .map(key => {
        const val = obj[key];
        if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) {
          return `${spacing}${key}:\n${jsonToYAML(val, indent + 2)}`;
        }
        return `${spacing}${key}: ${jsonToYAML(val, 0)}`;
      })
      .join('\n');
  }

  return String(obj);
}

// Helper: Custom Syntax Highlighter for Formatted JSON Output
function highlightJSON(jsonStr: string): React.ReactNode[] {
  if (!jsonStr) return [];
  const lines = jsonStr.split('\n');

  return lines.map((line, idx) => {
    // Regex for matching tokens
    const tokens = line.split(/("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g);

    return (
      <div key={idx} className="table-row leading-relaxed">
        <span className="table-cell select-none text-right pr-4 text-slate-400 dark:text-gray-600 font-mono text-xs opacity-70">
          {idx + 1}
        </span>
        <span className="table-cell font-mono text-xs whitespace-pre">
          {line.replace(/("(\\[^]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                return `<span class="text-sky-600 dark:text-sky-400 font-bold">${match}</span>`;
              } else {
                return `<span class="text-emerald-600 dark:text-emerald-400">${match}</span>`;
              }
            } else if (/true|false/.test(match)) {
              return `<span class="text-purple-600 dark:text-purple-400 font-bold">${match}</span>`;
            } else if (/null/.test(match)) {
              return `<span class="text-rose-600 dark:text-rose-400 font-bold">${match}</span>`;
            } else if (/-?\d+/.test(match)) {
              return `<span class="text-amber-600 dark:text-amber-400 font-bold">${match}</span>`;
            }
            return match;
          }).split(/<span class="([^"]+)">([^<]+)<\/span>/g).map((part, pIdx, arr) => {
            if (pIdx % 3 === 1) {
              const colorClass = part;
              const content = arr[pIdx + 1];
              return <span key={pIdx} className={colorClass}>{content}</span>;
            } else if (pIdx % 3 === 0) {
              return part;
            }
            return null;
          })}
        </span>
      </div>
    );
  });
}

// Collapsible JSON Tree Node Component
function JSONTreeNode({ label, value, isLast = true }: { label?: string; value: any; isLast?: boolean }) {
  const [isOpen, setIsOpen] = useState(true);

  if (value === null) {
    return (
      <div className="font-mono text-xs leading-relaxed pl-4">
        {label && <span className="text-sky-600 dark:text-sky-400 font-bold">"{label}": </span>}
        <span className="text-rose-600 dark:text-rose-400 font-bold">null</span>
        {!isLast && <span className="text-slate-400 dark:text-gray-500">,</span>}
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <div className="font-mono text-xs leading-relaxed pl-4">
        {label && <span className="text-sky-600 dark:text-sky-400 font-bold">"{label}": </span>}
        <span className="text-purple-600 dark:text-purple-400 font-bold">{String(value)}</span>
        {!isLast && <span className="text-slate-400 dark:text-gray-500">,</span>}
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div className="font-mono text-xs leading-relaxed pl-4">
        {label && <span className="text-sky-600 dark:text-sky-400 font-bold">"{label}": </span>}
        <span className="text-amber-600 dark:text-amber-400 font-bold">{value}</span>
        {!isLast && <span className="text-slate-400 dark:text-gray-500">,</span>}
      </div>
    );
  }

  if (typeof value === 'string') {
    return (
      <div className="font-mono text-xs leading-relaxed pl-4">
        {label && <span className="text-sky-600 dark:text-sky-400 font-bold">"{label}": </span>}
        <span className="text-emerald-600 dark:text-emerald-400">"{value}"</span>
        {!isLast && <span className="text-slate-400 dark:text-gray-500">,</span>}
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const keys = Object.keys(value);
  const openSymbol = isArray ? '[' : '{';
  const closeSymbol = isArray ? ']' : '}';

  return (
    <div className="font-mono text-xs leading-relaxed pl-4">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 rounded px-1 -ml-1 transition-colors select-none"
      >
        {isOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
        {label && <span className="text-sky-600 dark:text-sky-400 font-bold">"{label}": </span>}
        <span className="text-slate-700 dark:text-gray-300 font-bold">{openSymbol}</span>
        {!isOpen && (
          <span className="text-xs text-slate-400 dark:text-gray-500 font-normal italic px-1">
            {isArray ? `${keys.length} items` : `${keys.length} keys`} ... {closeSymbol}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="border-l border-slate-200 dark:border-white/10 ml-2">
          {keys.map((key, idx) => (
            <JSONTreeNode 
              key={key} 
              label={isArray ? undefined : key} 
              value={value[key]} 
              isLast={idx === keys.length - 1} 
            />
          ))}
        </div>
      )}

      {isOpen && (
        <div className="pl-4 text-slate-700 dark:text-gray-300 font-bold">
          {closeSymbol}
          {!isLast && <span className="text-slate-400 dark:text-gray-500">,</span>}
        </div>
      )}
    </div>
  );
}

export default function JsonFormatterValidatorPage() {
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core State
  const [rawInput, setRawInput] = useState<string>(SAMPLE_JSON);
  const [indentation, setIndentation] = useState<number>(2); // 2 or 4 spaces
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'code' | 'tree' | 'csv' | 'yaml'>('code');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validation & Formatting Logic
  const parsedState = useMemo(() => {
    if (!rawInput.trim()) {
      return {
        isValid: true,
        isEmpty: true,
        formattedCode: '',
        minifiedCode: '',
        parsedObject: null,
        errorMsg: null,
        errorLine: null,
        errorCol: null,
        csvText: '',
        yamlText: ''
      };
    }

    try {
      let parsed = JSON.parse(rawInput);
      
      if (sortKeys) {
        parsed = sortObjectKeys(parsed);
      }

      const formattedCode = JSON.stringify(parsed, null, indentation);
      const minifiedCode = JSON.stringify(parsed);
      const csvText = jsonToCSV(parsed);
      const yamlText = jsonToYAML(parsed);

      return {
        isValid: true,
        isEmpty: false,
        formattedCode,
        minifiedCode,
        parsedObject: parsed,
        errorMsg: null,
        errorLine: null,
        errorCol: null,
        csvText,
        yamlText
      };
    } catch (err: any) {
      const errorMsg = err?.message || 'Invalid JSON syntax.';
      let errorLine = null;
      let errorCol = null;

      // Extract line & position from exception message if available
      const posMatch = errorMsg.match(/position\s+(\d+)/i);
      const lineMatch = errorMsg.match(/line\s+(\d+)\s+column\s+(\d+)/i);

      if (lineMatch) {
        errorLine = parseInt(lineMatch[1], 10);
        errorCol = parseInt(lineMatch[2], 10);
      } else if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const linesBefore = rawInput.substring(0, pos).split('\n');
        errorLine = linesBefore.length;
        errorCol = linesBefore[linesBefore.length - 1].length + 1;
      }

      return {
        isValid: false,
        isEmpty: false,
        formattedCode: '',
        minifiedCode: '',
        parsedObject: null,
        errorMsg,
        errorLine,
        errorCol,
        csvText: '',
        yamlText: ''
      };
    }
  }, [rawInput, indentation, sortKeys]);

  // Toolbar Actions
  const handleBeautify = () => {
    if (parsedState.isValid && parsedState.formattedCode) {
      setRawInput(parsedState.formattedCode);
      setViewMode('code');
    }
  };

  const handleMinify = () => {
    if (parsedState.isValid && parsedState.minifiedCode) {
      setRawInput(parsedState.minifiedCode);
      setViewMode('code');
    }
  };

  const handleClear = () => {
    setRawInput('');
  };

  const handleCopy = () => {
    let textToCopy = parsedState.formattedCode;
    if (viewMode === 'csv') textToCopy = parsedState.csvText;
    if (viewMode === 'yaml') textToCopy = parsedState.yamlText;
    if (viewMode === 'tree') textToCopy = parsedState.formattedCode;

    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawInput(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    let content = parsedState.formattedCode;
    let ext = 'json';
    let mime = 'application/json';

    if (viewMode === 'csv') {
      content = parsedState.csvText;
      ext = 'csv';
      mime = 'text/csv';
    } else if (viewMode === 'yaml') {
      content = parsedState.yamlText;
      ext = 'yaml';
      mime = 'text/yaml';
    }

    if (!content) return;

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-json.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Input Line Numbers generator
  const inputLinesCount = useMemo(() => {
    return (rawInput.match(/\n/g) || []).length + 1;
  }, [rawInput]);

  // Payload stats
  const stats = useMemo(() => {
    const inputChars = rawInput.length;
    const inputLines = inputLinesCount;
    const outputChars = parsedState.formattedCode.length;
    const outputLines = (parsedState.formattedCode.match(/\n/g) || []).length + 1;
    const sizeKB = (new Blob([rawInput]).size / 1024).toFixed(2);

    return {
      inputChars,
      inputLines,
      outputChars,
      outputLines,
      sizeKB
    };
  }, [rawInput, inputLinesCount, parsedState.formattedCode]);

  const article = toolArticles['json-formatter-validator'];

  return (
    <ToolVisibilityGuard slug="json-formatter-validator">
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
            <PdfToolIcon toolId="json-formatter-validator" size="xl" className="mx-auto mb-4" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
              <Code className="w-4 h-4" />
              <span>Developer Utilities</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-3 uppercase leading-none">
              JSON Formatter & Validator
            </h1>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-extrabold uppercase tracking-widest mb-4">
              Beautify, Minify, Validate & Inspect JSON Payloads
            </p>
            <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
              {SEO_DESC}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 mt-6">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Zero Server Tracking
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <AlertCircle className="w-3.5 h-3.5 text-emerald-500" /> Error Line Detection
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" /> Interactive Tree View
              </span>
            </div>
          </div>

          {/* Main Workspace Section */}
          <div className="space-y-6">
            
            {/* Control Toolbar */}
            <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-4 sm:p-6 bg-white dark:bg-white/[0.01] shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                
                {/* Formatting Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleBeautify}
                    disabled={!parsedState.isValid}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition-all shadow-md flex items-center gap-1.5"
                  >
                    <AlignLeft className="w-4 h-4" /> Beautify
                  </button>

                  <button
                    onClick={handleMinify}
                    disabled={!parsedState.isValid}
                    className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-white/10 hover:bg-slate-700 dark:hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Minimize2 className="w-4 h-4" /> Minify
                  </button>

                  {/* Indentation Selector */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 px-2">Indent:</span>
                    <button
                      onClick={() => setIndentation(2)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        indentation === 2 ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      2 Sp
                    </button>
                    <button
                      onClick={() => setIndentation(4)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        indentation === 4 ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      4 Sp
                    </button>
                  </div>

                  {/* Sort Keys Toggle */}
                  <button
                    onClick={() => setSortKeys(!sortKeys)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      sortKeys 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400'
                    }`}
                  >
                    <ListFilter className="w-4 h-4" /> Sort Keys: {sortKeys ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Upload / Copy / Download Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-bold text-xs transition-colors border border-slate-200 dark:border-white/10 flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-4 h-4" /> Upload
                  </button>

                  <button
                    onClick={handleCopy}
                    disabled={parsedState.isEmpty}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-bold text-xs transition-colors border border-slate-200 dark:border-white/10 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={!parsedState.isValid || parsedState.isEmpty}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>

                  <button
                    onClick={handleClear}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 text-slate-500 transition-colors border border-slate-200 dark:border-white/10"
                    title="Clear panels"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

            {/* Validation Banner */}
            {!parsedState.isEmpty && (
              <AnimatePresence mode="wait">
                {parsedState.isValid ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs font-extrabold shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>🟢 Valid JSON Syntax! Ready for formatting and tree inspection.</span>
                    </div>
                    <span className="font-mono text-[11px] opacity-80">{stats.sizeKB} KB</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-extrabold shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="uppercase tracking-wider">🔴 Invalid JSON Syntax Error</p>
                        <p className="font-mono text-slate-700 dark:text-rose-200 mt-0.5 font-normal">{parsedState.errorMsg}</p>
                      </div>
                    </div>
                    {parsedState.errorLine && (
                      <span className="px-3 py-1 rounded-full bg-rose-200 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 font-mono text-xs font-bold shrink-0 self-start sm:self-center">
                        Error on Line {parsedState.errorLine}, Col {parsedState.errorCol || 1}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Two-Panel Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Panel: Input Editor */}
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 overflow-hidden bg-white dark:bg-white/[0.01] shadow-xl flex flex-col h-[550px]">
                
                {/* Left Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Raw JSON Input</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-gray-400">
                    {stats.inputLines} lines • {stats.inputChars} chars
                  </span>
                </div>

                {/* Textarea Code Input */}
                <div className="relative flex-grow flex overflow-hidden">
                  <textarea
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="Paste your raw JSON code here..."
                    spellCheck={false}
                    className="w-full h-full p-6 bg-transparent text-slate-900 dark:text-white font-mono text-xs leading-relaxed focus:outline-none resize-none overflow-auto"
                  />
                </div>

              </div>

              {/* Right Panel: Output & Tree Inspector */}
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 overflow-hidden bg-white dark:bg-white/[0.01] shadow-xl flex flex-col h-[550px]">
                
                {/* Right Header & Mode Selector */}
                <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Output View</span>
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex items-center gap-1 bg-slate-200 dark:bg-black/60 p-1 rounded-xl border border-slate-300 dark:border-white/10">
                    <button
                      onClick={() => setViewMode('code')}
                      className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                        viewMode === 'code' ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-gray-400'
                      }`}
                    >
                      Code
                    </button>
                    <button
                      onClick={() => setViewMode('tree')}
                      disabled={!parsedState.isValid}
                      className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all disabled:opacity-40 ${
                        viewMode === 'tree' ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-gray-400'
                      }`}
                    >
                      Tree
                    </button>
                    <button
                      onClick={() => setViewMode('csv')}
                      disabled={!parsedState.isValid}
                      className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all disabled:opacity-40 ${
                        viewMode === 'csv' ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-gray-400'
                      }`}
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => setViewMode('yaml')}
                      disabled={!parsedState.isValid}
                      className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all disabled:opacity-40 ${
                        viewMode === 'yaml' ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-gray-400'
                      }`}
                    >
                      YAML
                    </button>
                  </div>
                </div>

                {/* Output Panel Content View */}
                <div className="flex-grow p-6 overflow-auto font-mono text-xs bg-slate-900 text-white rounded-b-[2rem]">
                  {parsedState.isEmpty ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                      <Code className="w-8 h-8 opacity-40" />
                      <p className="text-xs font-medium">Formatted output will appear here...</p>
                    </div>
                  ) : !parsedState.isValid ? (
                    <div className="h-full flex flex-col items-center justify-center text-rose-400 space-y-3 p-6 text-center">
                      <AlertCircle className="w-10 h-10 opacity-80" />
                      <p className="text-sm font-bold">Fix JSON syntax errors in the left panel to render output.</p>
                    </div>
                  ) : viewMode === 'code' ? (
                    <div className="table w-full">
                      {highlightJSON(parsedState.formattedCode)}
                    </div>
                  ) : viewMode === 'tree' ? (
                    <div className="space-y-2 text-white">
                      <JSONTreeNode value={parsedState.parsedObject} />
                    </div>
                  ) : viewMode === 'csv' ? (
                    <pre className="text-emerald-400 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {parsedState.csvText}
                    </pre>
                  ) : (
                    <pre className="text-sky-300 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {parsedState.yamlText}
                    </pre>
                  )}
                </div>

              </div>

            </div>

            {/* Privacy Card */}
            <div className="glass rounded-2xl border border-emerald-500/20 p-5 bg-emerald-500/5 text-slate-700 dark:text-gray-300 flex items-start gap-3 text-xs font-medium shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Privacy Guaranteed:</strong> Your JSON payloads are processed 100% locally inside your web browser memory. No data is sent over the internet or logged on any server.
              </p>
            </div>

          </div>

          {/* Educational Content & Guide */}
          <section id="learn-more-section" className="py-16 border-t border-slate-200 dark:border-white/5 mt-16 pt-16">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest mb-4">
                <BookOpen className="w-4 h-4" />
                <span>Developer Guide</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-4">
                📚 Mastering JSON Formatting & Debugging
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
                Learn how JSON validation, line detection, and formatting streamline API integration.
              </p>
            </div>

            {/* Guide Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">
                  ⚡ Real-Time Syntax Errors
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  Missing a comma or unescaped double quote? The validator pinpoints the exact line number and token position for rapid debugging.
                </p>
              </div>

              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                  🌳 Interactive Tree View
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  Collapse deeply nested arrays and objects to inspect top-level data structures without getting lost in lengthy API payloads.
                </p>
              </div>

              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3">
                  📊 CSV & YAML Conversion
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  Export JSON arrays directly into CSV spreadsheets for Excel analysis or YAML for Kubernetes & Docker configuration files.
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

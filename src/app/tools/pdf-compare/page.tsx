/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GitCompare,
  UploadCloud,
  FileText,
  Trash2,
  RefreshCw,
  Download,
  CheckCircle2,
  Columns2,
  AlignJustify,
  FileWarning,
  ExternalLink,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';
import TrustBadges from '@/components/TrustBadges';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { formatBytes } from '@/lib/utils/format';
import { loadPdfJs } from '@/lib/pdf/pdfjsWorker';

import {
  DiffViewMode,
  ExtractedPdfDocument,
  ComparisonSummary,
  PageDiffResult,
} from './types';
import {
  extractPdfText,
  comparePdfDocuments,
  generateComparisonReportHtml,
} from './utils/pdfDiffEngine';

export default function PdfComparePage() {
  // PDF.js Engine instance
  const [pdfjs, setPdfjs] = useState<any>(null);

  // Uploaded Files State
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);

  // Drag states
  const [isDraggingA, setIsDraggingA] = useState(false);
  const [isDraggingB, setIsDraggingB] = useState(false);

  // File Inputs
  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  // Processing & Comparison States
  const [isComparing, setIsComparing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Results
  const [docAData, setDocAData] = useState<ExtractedPdfDocument | null>(null);
  const [docBData, setDocBData] = useState<ExtractedPdfDocument | null>(null);
  const [summary, setSummary] = useState<ComparisonSummary | null>(null);

  // Display Configuration
  const [viewMode, setViewMode] = useState<DiffViewMode>('side-by-side');
  const [activePageTab, setActivePageTab] = useState<number | 'all'>(1);

  // Warnings / Error states
  const [hasScannedWarning, setHasScannedWarning] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Initialize PDF.js
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const lib = await loadPdfJs();
        if (mounted) {
          setPdfjs(lib);
        }
      } catch (err) {
        console.error('Failed to load pdfjs-dist:', err);
        if (mounted) {
          toast.error('Failed to initialize document parsing engine.');
        }
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // File Handlers
  const handleSelectFileA = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are supported.');
      return;
    }
    setFileA(file);
    setPasswordError(null);
    setSummary(null);
  };

  const handleSelectFileB = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are supported.');
      return;
    }
    setFileB(file);
    setPasswordError(null);
    setSummary(null);
  };

  // Process Comparison
  const handleCompare = async () => {
    if (!fileA || !fileB) {
      toast.error('Please upload both PDF files to compare.');
      return;
    }
    if (!pdfjs) {
      toast.error('PDF parsing engine is still loading. Please wait a moment.');
      return;
    }

    setIsComparing(true);
    setProgressPercent(5);
    setProgressMessage('Reading Document A...');
    setPasswordError(null);
    setHasScannedWarning(false);

    try {
      // Step 1: Extract Document A
      const parsedA = await extractPdfText(pdfjs, fileA, (pct, msg) => {
        setProgressPercent(Math.round(pct * 0.45));
        setProgressMessage(`[Document A] ${msg}`);
      });

      // Step 2: Extract Document B
      const parsedB = await extractPdfText(pdfjs, fileB, (pct, msg) => {
        setProgressPercent(45 + Math.round(pct * 0.45));
        setProgressMessage(`[Document B] ${msg}`);
      });

      // Scanned check
      if (parsedA.isScanned || parsedB.isScanned) {
        setHasScannedWarning(true);
      }

      setProgressPercent(95);
      setProgressMessage('Calculating side-by-side text diffs...');

      // Step 3: Compute comparison summary
      const diffSummary = comparePdfDocuments(parsedA, parsedB);

      setDocAData(parsedA);
      setDocBData(parsedB);
      setSummary(diffSummary);
      setActivePageTab(1);

      setProgressPercent(100);
      setProgressMessage('Comparison complete!');
      toast.success(
        `Comparison complete! Found ${diffSummary.totalDifferences} differences across ${diffSummary.totalPagesCompared} pages.`
      );
    } catch (err: any) {
      console.error('Error comparing documents:', err);
      if (err?.message === 'PASSWORD_PROTECTED' || err?.name === 'PasswordProtectedError') {
        setPasswordError('One of the uploaded PDF files is password-protected.');
      } else {
        toast.error(err?.message || 'An error occurred while comparing the PDF documents.');
      }
    } finally {
      setIsComparing(false);
    }
  };

  // Reset Workflow
  const handleReset = () => {
    setFileA(null);
    setFileB(null);
    setDocAData(null);
    setDocBData(null);
    setSummary(null);
    setPasswordError(null);
    setHasScannedWarning(false);
    setActivePageTab(1);
  };

  // Download Report
  const handleDownloadReport = () => {
    if (!docAData || !docBData || !summary) return;

    try {
      const htmlReport = generateComparisonReportHtml(docAData, docBData, summary, viewMode);
      const blob = new Blob([htmlReport], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pdf-comparison-report-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Comparison report downloaded successfully!');
    } catch (err) {
      console.error('Failed to generate report:', err);
      toast.error('Failed to download comparison report.');
    }
  };

  // Filtered pages to show based on active tab
  const displayedPages: PageDiffResult[] = summary
    ? activePageTab === 'all'
      ? summary.pageResults
      : summary.pageResults.filter((p) => p.pageNum === activePageTab)
    : [];

  return (
    <ToolLayout>
      {/* Top Hero Section */}
      <div className="bg-white dark:bg-[#0B0F19] rounded-3xl border border-[#E6ECF5] dark:border-white/10 shadow-xs mb-8 overflow-hidden transition-colors">
        <ToolHero
          title="Compare Two PDF Files Online"
          description="Identify differences, additions, and deletions between two PDF versions instantly in your browser with 100% zero-upload privacy."
          badgeText="🔒 100% Browser-Based"
          icon={<GitCompare className="w-6 h-6 text-white" />}
        />

        <div className="p-4 sm:p-8 space-y-8">
          {/* Password Protection Alert Banner */}
          {passwordError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-800 dark:text-amber-300"
            >
              <div className="flex items-center gap-3">
                <FileWarning className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <h4 className="text-sm font-bold">Password-Protected PDF Detected</h4>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                    This PDF is password protected. Please unlock it first using our Unlock PDF tool before comparing.
                  </p>
                </div>
              </div>
              <Link
                href="/tools/unlock-pdf/"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors shrink-0 shadow-xs"
              >
                Go to Unlock PDF
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}

          {/* Scanned PDF Notice Banner */}
          {hasScannedWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-blue-800 dark:text-blue-300"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="text-sm font-bold">Scanned / Image-Based PDF Detected</h4>
                  <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-0.5">
                    This PDF appears to be scanned or image-based — text comparison may not work. Try OCR first to convert scanned images into selectable text.
                  </p>
                </div>
              </div>
              <Link
                href="/tools/pdf-ocr/"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0 shadow-xs"
              >
                Open PDF OCR
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}

          {/* Dual Upload Dropzones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Slot A: Baseline PDF */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Document A (Original / Baseline)
                </span>
                {fileA && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>

              {!fileA ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingA(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingA(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingA(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleSelectFileA(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRefA.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center min-h-[180px] sm:min-h-[210px] ${
                    isDraggingA
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-500/10 scale-[1.01]'
                      : 'border-[#E6ECF5] dark:border-white/10 bg-[#FBFCFE] dark:bg-white/[0.02] hover:border-blue-400 dark:hover:border-white/20'
                  }`}
                >
                  <input
                    ref={fileInputRefA}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleSelectFileA(e.target.files[0]);
                    }}
                  />
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
                    Upload Original PDF (Doc A)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 max-w-xs font-medium">
                    Drag and drop file here, or click to browse
                  </p>
                </div>
              ) : (
                <div className="border border-[#E6ECF5] dark:border-white/10 rounded-2xl p-5 bg-[#FBFCFE] dark:bg-white/[0.02] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {fileA.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                        {formatBytes(fileA.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRefA.current?.click()}
                      className="text-xs font-bold text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      Change
                    </button>
                    <input
                      ref={fileInputRefA}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleSelectFileA(e.target.files[0]);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFileA(null);
                        setSummary(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Slot B: Modified PDF */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Document B (Modified / New)
                </span>
                {fileB && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>

              {!fileB ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingB(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingB(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingB(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleSelectFileB(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRefB.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center min-h-[180px] sm:min-h-[210px] ${
                    isDraggingB
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-500/10 scale-[1.01]'
                      : 'border-[#E6ECF5] dark:border-white/10 bg-[#FBFCFE] dark:bg-white/[0.02] hover:border-indigo-400 dark:hover:border-white/20'
                  }`}
                >
                  <input
                    ref={fileInputRefB}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleSelectFileB(e.target.files[0]);
                    }}
                  />
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
                    Upload Modified PDF (Doc B)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 max-w-xs font-medium">
                    Drag and drop file here, or click to browse
                  </p>
                </div>
              ) : (
                <div className="border border-[#E6ECF5] dark:border-white/10 rounded-2xl p-5 bg-[#FBFCFE] dark:bg-white/[0.02] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100/70 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {fileB.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                        {formatBytes(fileB.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRefB.current?.click()}
                      className="text-xs font-bold text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      Change
                    </button>
                    <input
                      ref={fileInputRefB}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleSelectFileB(e.target.files[0]);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFileB(null);
                        setSummary(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Trigger Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleCompare}
              disabled={!fileA || !fileB || isComparing}
              className="w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-[0_4px_25px_rgba(79,70,229,0.45)] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer active:scale-95"
            >
              {isComparing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Comparing Documents...
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4" />
                  Compare Documents
                </>
              )}
            </button>

            {(fileA || fileB || summary) && (
              <button
                onClick={handleReset}
                disabled={isComparing}
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Reset / Compare New Files
              </button>
            )}
          </div>

          {/* Processing Progress Indicator */}
          {isComparing && (
            <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/50 dark:border-blue-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {progressMessage}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.15 }}
                />
              </div>
            </div>
          )}

          {/* Trust Badges */}
          {!summary && <TrustBadges />}
        </div>
      </div>

      {/* Comparison Results Section */}
      {summary && docAData && docBData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Executive Metrics Overview Bar */}
          <div className="bg-white dark:bg-[#0B0F19] rounded-3xl border border-[#E6ECF5] dark:border-white/10 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                  Comparison Results
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {summary.totalPagesCompared} {summary.totalPagesCompared === 1 ? 'Page' : 'Pages'} Compared &bull; {summary.totalDifferences} Differences Found
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                  Baseline: {docAData.name} ({docAData.totalPages} pages) &bull; Modified: {docBData.name} ({docBData.totalPages} pages)
                </p>
              </div>

              {/* Download Report & Action CTA */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleDownloadReport}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Report
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-6">
              <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 block">
                  Similarity
                </span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block mt-1">
                  {summary.similarityPercentage}%
                </span>
              </div>

              <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 block">
                  Differences
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">
                  {summary.totalDifferences}
                </span>
              </div>

              <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Words Added
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                  +{summary.addedWordsTotal}
                </span>
              </div>

              <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-500 dark:text-red-400 block">
                  Words Removed
                </span>
                <span className="text-2xl font-black text-red-500 dark:text-red-400 block mt-1">
                  -{summary.removedWordsTotal}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 block">
                  Unchanged Words
                </span>
                <span className="text-2xl font-black text-slate-700 dark:text-gray-300 block mt-1">
                  {summary.unchangedWordsTotal}
                </span>
              </div>
            </div>
          </div>

          {/* View Toolbar & Page Navigator */}
          <div className="bg-white dark:bg-[#0B0F19] rounded-3xl border border-[#E6ECF5] dark:border-white/10 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'side-by-side'
                    ? 'bg-white dark:bg-black/40 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                Side-by-Side View
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'unified'
                    ? 'bg-white dark:bg-black/40 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <AlignJustify className="w-3.5 h-3.5" />
                Unified / Inline View
              </button>
            </div>

            {/* Page Tab Selector */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-thin">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 whitespace-nowrap mr-1">
                Pages:
              </span>
              <button
                onClick={() => setActivePageTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activePageTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
                }`}
              >
                All Pages ({summary.totalPagesCompared})
              </button>

              {summary.pageResults.map((p) => {
                const isSelected = activePageTab === p.pageNum;
                return (
                  <button
                    key={p.pageNum}
                    onClick={() => setActivePageTab(p.pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
                    }`}
                  >
                    <span>Page {p.pageNum}</span>
                    {p.status === 'identical' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ) : (
                      <span
                        className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {p.differencesCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Diff Pages View */}
          <div className="space-y-6">
            {displayedPages.map((page) => (
              <div
                key={page.pageNum}
                className="bg-white dark:bg-[#0B0F19] rounded-3xl border border-[#E6ECF5] dark:border-white/10 shadow-xs overflow-hidden"
              >
                {/* Page Sub-Header */}
                <div className="p-4 sm:p-5 bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Page {page.pageNum}
                    </span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    {page.status === 'identical' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Identical
                      </span>
                    ) : page.status === 'added_page' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        + Added Page (Only in Doc B)
                      </span>
                    ) : page.status === 'removed_page' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                        - Missing Page (Only in Doc A)
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 dark:text-gray-400">
                        {page.differencesCount} differences ({page.similarity}% similarity)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 dark:text-gray-400">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{page.addedWordsCount} words
                    </span>
                    <span className="text-red-500 dark:text-red-400">
                      -{page.removedWordsCount} words
                    </span>
                  </div>
                </div>

                {/* Diff Contents */}
                {viewMode === 'side-by-side' ? (
                  /* ================= Side-by-Side View ================= */
                  <div className="overflow-x-auto">
                    <div className="min-w-[700px] text-xs font-mono">
                      {/* Column Header Titles */}
                      <div className="grid grid-cols-2 bg-slate-100/60 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-gray-300">
                        <div className="p-2.5 pl-4 border-r border-slate-200 dark:border-white/10 flex items-center justify-between">
                          <span>Original: {docAData.name}</span>
                          <span className="text-[10px] text-slate-400">Page {page.pageNum}</span>
                        </div>
                        <div className="p-2.5 pl-4 flex items-center justify-between">
                          <span>Modified: {docBData.name}</span>
                          <span className="text-[10px] text-slate-400">Page {page.pageNum}</span>
                        </div>
                      </div>

                      {/* Side-by-side Rows */}
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {page.sideBySideRows.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 dark:text-gray-500 italic">
                            No text content on this page.
                          </div>
                        ) : (
                          page.sideBySideRows.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-2">
                              {/* Left Column (Document A) */}
                              <div
                                className={`flex items-start p-1.5 pl-3 border-r border-slate-200 dark:border-white/10 ${
                                  row.type === 'removed' || (row.type === 'modified' && row.leftText)
                                    ? 'bg-red-50/50 dark:bg-red-950/20 text-slate-900 dark:text-gray-200'
                                    : row.leftText
                                    ? 'text-slate-800 dark:text-gray-300'
                                    : 'bg-slate-50 dark:bg-white/[0.01]'
                                }`}
                              >
                                <span className="w-8 shrink-0 text-[10px] text-slate-400 select-none">
                                  {row.leftLineNum || ''}
                                </span>
                                <div className="flex-1 whitespace-pre-wrap break-words">
                                  {row.leftWords ? (
                                    row.leftWords.map((w, wIdx) =>
                                      w.removed ? (
                                        <span
                                          key={wIdx}
                                          className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded px-1 line-through font-bold"
                                        >
                                          {w.value}
                                        </span>
                                      ) : (
                                        <span key={wIdx}>{w.value}</span>
                                      )
                                    )
                                  ) : (
                                    row.leftText || <span className="opacity-0">-</span>
                                  )}
                                </div>
                              </div>

                              {/* Right Column (Document B) */}
                              <div
                                className={`flex items-start p-1.5 pl-3 ${
                                  row.type === 'added' || (row.type === 'modified' && row.rightText)
                                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-gray-200'
                                    : row.rightText
                                    ? 'text-slate-800 dark:text-gray-300'
                                    : 'bg-slate-50 dark:bg-white/[0.01]'
                                }`}
                              >
                                <span className="w-8 shrink-0 text-[10px] text-slate-400 select-none">
                                  {row.rightLineNum || ''}
                                </span>
                                <div className="flex-1 whitespace-pre-wrap break-words">
                                  {row.rightWords ? (
                                    row.rightWords.map((w, wIdx) =>
                                      w.added ? (
                                        <span
                                          key={wIdx}
                                          className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded px-1 font-bold"
                                        >
                                          {w.value}
                                        </span>
                                      ) : (
                                        <span key={wIdx}>{w.value}</span>
                                      )
                                    )
                                  ) : (
                                    row.rightText || <span className="opacity-0">-</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ================= Unified / Inline View ================= */
                  <div className="font-mono text-xs divide-y divide-slate-100 dark:divide-white/5">
                    {page.unifiedRows.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 dark:text-gray-500 italic">
                        No text content on this page.
                      </div>
                    ) : (
                      page.unifiedRows.map((row, idx) => {
                        const isAdded = row.type === 'added';
                        const isRemoved = row.type === 'removed';

                        return (
                          <div
                            key={idx}
                            className={`flex items-start p-1.5 pl-4 ${
                              isAdded
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-l-4 border-emerald-500 text-slate-900 dark:text-gray-200'
                                : isRemoved
                                ? 'bg-red-50/70 dark:bg-red-950/25 border-l-4 border-red-500 text-slate-900 dark:text-gray-200'
                                : 'text-slate-800 dark:text-gray-300 border-l-4 border-transparent'
                            }`}
                          >
                            <span className="w-8 shrink-0 text-[10px] text-slate-400 select-none">
                              {row.lineNumLeft || ''}
                            </span>
                            <span className="w-8 shrink-0 text-[10px] text-slate-400 select-none">
                              {row.lineNumRight || ''}
                            </span>
                            <span
                              className={`w-6 shrink-0 font-bold select-none ${
                                isAdded
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : isRemoved
                                  ? 'text-red-500 dark:text-red-400'
                                  : 'text-slate-300 dark:text-gray-600'
                              }`}
                            >
                              {isAdded ? '+' : isRemoved ? '-' : ' '}
                            </span>
                            <div className="flex-1 whitespace-pre-wrap break-words">
                              {row.words ? (
                                row.words.map((w, wIdx) => {
                                  if (w.added) {
                                    return (
                                      <span
                                        key={wIdx}
                                        className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded px-1 font-bold"
                                      >
                                        {w.value}
                                      </span>
                                    );
                                  }
                                  if (w.removed) {
                                    return (
                                      <span
                                        key={wIdx}
                                        className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded px-1 line-through font-bold"
                                      >
                                        {w.value}
                                      </span>
                                    );
                                  }
                                  return <span key={wIdx}>{w.value}</span>;
                                })
                              ) : (
                                row.text
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SEO Deep-Dive Article Section */}
      {toolArticles['pdf-compare'] && <ToolArticle {...toolArticles['pdf-compare']} />}
    </ToolLayout>
  );
}

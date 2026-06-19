"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import {
  FileText, Download, UploadCloud, Trash2,
  Files, Scissors, Minimize2, AlertCircle,
  CheckCircle, RefreshCw, Info, FileUp, Shield,
  ArrowUp, ArrowDown, ChevronLeft, ArrowRight, FilePenLine
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';

const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

type TabId = 'merge' | 'split' | 'compress';

const TABS = [
  { id: 'merge', label: 'Merge PDF', icon: Files },
  { id: 'split', label: 'Split PDF', icon: Scissors },
  { id: 'compress', label: 'Optimize PDF', icon: Minimize2 },
] as const;

export default function PdfTools() {
  const [activeTab, setActiveTab] = useState<TabId>('merge');

  // File States
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [compressFile, setCompressFile] = useState<File | null>(null);

  // Specific States
  const [splitRange, setSplitRange] = useState<string>('');
  const [compressResult, setCompressResult] = useState<{ size: number, url: string, reductionPct: number } | null>(null);

  // UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const mergeInputRef = useRef<HTMLInputElement>(null);
  const splitInputRef = useRef<HTMLInputElement>(null);
  const compressInputRef = useRef<HTMLInputElement>(null);

  // ------------------------------------
  // COMMON HELPERS
  // ------------------------------------
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // const downloadBlob = (bytes: Uint8Array, filename: string) => {
  //   const blob = new Blob([bytes], { type: 'application/pdf' });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = filename;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   URL.revokeObjectURL(url);
  // };

  const downloadBlob = (bytes: Uint8Array, filename: string) => {
    const blob = new Blob([uint8ArrayToArrayBuffer(bytes)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const switchTab = (tabId: TabId) => {
    setActiveTab(tabId);
    clearMessages();
    setCompressResult(null);
  };

  const resetAll = () => {
    setMergeFiles([]);
    setSplitFile(null);
    setCompressFile(null);
    setSplitRange('');
    setCompressResult(null);
    clearMessages();

    // Reset file inputs
    if (mergeInputRef.current) mergeInputRef.current.value = '';
    if (splitInputRef.current) splitInputRef.current.value = '';
    if (compressInputRef.current) compressInputRef.current.value = '';
  };

  // ------------------------------------
  // DRAG AND DROP
  // ------------------------------------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    clearMessages();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const pdfFiles = files.filter(f => f.type === 'application/pdf');

      if (pdfFiles.length === 0) {
        setError("Please drop valid PDF files only.");
        return;
      }
      if (pdfFiles.length < files.length) {
        setError("Some files were ignored because they are not PDFs.");
      }

      if (activeTab === 'merge') {
        setMergeFiles(prev => [...prev, ...pdfFiles]);
      } else if (activeTab === 'split') {
        setSplitFile(pdfFiles[0]);
      } else if (activeTab === 'compress') {
        setCompressFile(pdfFiles[0]);
        setCompressResult(null);
      }
    }
  };

  // ------------------------------------
  // MERGE LOGIC
  // ------------------------------------
  const handleAddMergeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      if (newFiles.length === 0) {
        setError("Please select valid PDF files.");
        return;
      }
      setMergeFiles(prev => [...prev, ...newFiles]);
    }
    if (mergeInputRef.current) mergeInputRef.current.value = '';
  };

  const removeMergeFile = (index: number) => {
    setMergeFiles(prev => prev.filter((_, i) => i !== index));
    clearMessages();
  };

  const moveMergeFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === mergeFiles.length - 1) return;

    setMergeFiles(prev => {
      const newFiles = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      return newFiles;
    });
  };

  const processMerge = async () => {
    if (mergeFiles.length < 2) {
      setError("Please select at least 2 PDF files to merge.");
      return;
    }
    setIsProcessing(true);
    clearMessages();

    try {
      const { PDFDocument } = await import('pdf-lib');
      const mergedPdf = await PDFDocument.create();
      for (const file of mergeFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      downloadBlob(pdfBytes, 'merged_document.pdf');
      setSuccess("PDFs merged successfully!");
    } catch (err: any) {
      console.error(err);
      setError("Failed to merge PDFs. A file might be encrypted or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ------------------------------------
  // SPLIT LOGIC
  // ------------------------------------
  const handleSplitFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSplitFile(file);
    } else if (file) {
      setError("Please select a valid PDF file.");
    }
    if (splitInputRef.current) splitInputRef.current.value = '';
  };

  const parsePageRanges = (rangeStr: string, totalPages: number): number[] => {
    const pages: number[] = [];
    if (!rangeStr.trim()) return [];
    const parts = rangeStr.split(',').map(s => s.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
          const actualStart = Math.min(start, totalPages);
          const actualEnd = Math.min(end, totalPages);
          for (let i = actualStart; i <= actualEnd; i++) pages.push(i - 1);
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num > 0 && num <= totalPages) pages.push(num - 1);
      }
    }
    return Array.from(new Set(pages)).sort((a, b) => a - b);
  };

  const processSplit = async () => {
    if (!splitFile) return;
    if (!splitRange.trim()) { setError("Please enter a page range."); return; }
    setIsProcessing(true);
    clearMessages();

    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await splitFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      const indices = parsePageRanges(splitRange, totalPages);
      if (indices.length === 0) throw new Error("Invalid page range format or numbers out of bounds.");

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, indices);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      downloadBlob(pdfBytes, `split_${splitFile.name}`);
      setSuccess(`Successfully extracted ${indices.length} page(s)!`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to split PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ------------------------------------
  // COMPRESS / OPTIMIZE LOGIC
  // ------------------------------------
  const handleCompressFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    setCompressResult(null);
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setCompressFile(file);
    } else if (file) {
      setError("Please select a valid PDF file.");
    }
    if (compressInputRef.current) compressInputRef.current.value = '';
  };

  const processCompress = async () => {
    if (!compressFile) return;
    setIsProcessing(true);
    clearMessages();

    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await compressFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

      const blob = new Blob([uint8ArrayToArrayBuffer(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      const reductionPct = Math.max(0, ((compressFile.size - pdfBytes.length) / compressFile.size) * 100);

      setCompressResult({
        size: pdfBytes.length,
        url,
        reductionPct
      });

    } catch (err) {
      console.error(err);
      setError("Failed to optimize PDF. The file might be encrypted.");
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden mb-12">

          {/* HEADER */}
          <div className="p-8 sm:p-10 border-b border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter">PDF Tools</h1>
                  <p className="text-gray-400 font-medium mt-1">Merge, split, and optimize your PDF files effortlessly.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Private & Secure</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            {/* TAB NAVIGATION */}
            <div className="flex flex-wrap gap-4 mb-10">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id as TabId)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* SHARED MESSAGES */}
            {error && (
              <div className="mb-8 bg-red-500/10 text-red-400 p-5 rounded-[2rem] flex items-start gap-4 border border-red-500/20 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-8 bg-emerald-500/10 text-emerald-400 p-5 rounded-[2rem] flex items-start gap-4 border border-emerald-500/20 animate-fade-in">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* 1. MERGE PDF */}
            {activeTab === 'merge' && (
              <div className="space-y-8 animate-fade-in">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => mergeInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[3rem] p-12 sm:p-20 text-center transition-all cursor-pointer group
                    ${isDragging ? 'border-blue-500 bg-blue-500/5 scale-[1.01]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}
                  `}
                >
                  <input type="file" ref={mergeInputRef} onChange={handleAddMergeFiles} multiple accept="application/pdf" className="hidden" />
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center transition-colors ${isDragging ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 group-hover:text-blue-400 group-hover:bg-white/10'}`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-white tracking-tight mb-2">Select PDF files to Merge</h4>
                  <p className="text-sm text-gray-500 mb-8">or drag and drop them here</p>
                  <button className="rounded-xl bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                    Browse Files
                  </button>
                </div>

                {mergeFiles.length > 0 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Selected Files ({mergeFiles.length})</h4>
                      <button onClick={() => setMergeFiles([])} className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors">Clear All</button>
                    </div>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
                      {mergeFiles.map((f, i) => (
                        <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-4 overflow-hidden w-full">
                            <div className="bg-[#030712] p-3 rounded-xl border border-white/5 flex-shrink-0">
                              <FileText className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-white truncate">{f.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatBytes(f.size)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                            <button onClick={() => moveMergeFile(i, 'up')} disabled={i === 0} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all" title="Move Up">
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button onClick={() => moveMergeFile(i, 'down')} disabled={i === mergeFiles.length - 1} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all" title="Move Down">
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <div className="w-px h-6 bg-white/10 mx-2"></div>
                            <button onClick={() => removeMergeFile(i)} className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Remove">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-white/5 mt-8">
                  <button onClick={resetAll} className="w-full sm:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                    Reset
                  </button>
                  <button
                    onClick={processMerge}
                    disabled={isProcessing || mergeFiles.length < 2}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Files className="w-4 h-4" />}
                    {isProcessing ? 'Merging...' : 'Merge PDFs & Download'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. SPLIT PDF */}
            {activeTab === 'split' && (
              <div className="space-y-8 animate-fade-in">
                {!splitFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => splitInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-[3rem] p-12 sm:p-20 text-center transition-all cursor-pointer group
                      ${isDragging ? 'border-blue-500 bg-blue-500/5 scale-[1.01]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}
                    `}
                  >
                    <input type="file" ref={splitInputRef} onChange={handleSplitFileUpload} accept="application/pdf" className="hidden" />
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center transition-colors ${isDragging ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 group-hover:text-blue-400 group-hover:bg-white/10'}`}>
                      <FileUp className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-white tracking-tight mb-2">Select a PDF to Split</h4>
                    <p className="text-sm text-gray-500 mb-8">or drag and drop it here</p>
                    <button className="rounded-xl bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                      Browse File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 gap-6">
                      <div className="flex items-center gap-5 overflow-hidden w-full">
                        <div className="bg-[#030712] p-4 rounded-2xl border border-white/5 flex-shrink-0">
                          <FileText className="w-7 h-7 text-red-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-base font-black text-white truncate">{splitFile.name}</p>
                          <p className="text-sm text-gray-500 mt-1">{formatBytes(splitFile.size)}</p>
                        </div>
                      </div>
                      <button onClick={() => { setSplitFile(null); setSplitRange(''); }} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20 transition-all w-full sm:w-auto text-center">
                        Remove
                      </button>
                    </div>

                    <div className="bg-blue-600/5 border border-blue-600/10 rounded-[2rem] p-8">
                      <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 ml-1">Pages to Extract</label>
                      <input
                        type="text"
                        value={splitRange}
                        onChange={(e) => setSplitRange(e.target.value)}
                        placeholder="e.g. 1, 3-5, 8"
                        className="w-full rounded-2xl border border-white/10 px-6 py-4 text-sm font-bold bg-[#030712] text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xl"
                      />
                      <div className="flex items-start gap-3 mt-4 text-xs text-gray-500">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <p className="leading-relaxed">Format: Use commas for individual pages and dashes for ranges. <br />Example: <span className="font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded ml-1">1-3, 5, 8-10</span></p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-white/5">
                      <button onClick={resetAll} className="w-full sm:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                        Reset
                      </button>
                      <button
                        onClick={processSplit}
                        disabled={isProcessing || !splitRange.trim()}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                      >
                        {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                        {isProcessing ? 'Processing...' : 'Extract & Download'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. OPTIMIZE PDF */}
            {activeTab === 'compress' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-start gap-4 bg-amber-500/10 p-6 rounded-[2rem] border border-amber-500/20">
                  <Info className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-200 leading-relaxed">
                    Browser-side optimization strips unreferenced metadata and objects. For high-resolution image compression, a server-side update is coming soon.
                  </p>
                </div>

                {!compressFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => compressInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-[3rem] p-12 sm:p-20 text-center transition-all cursor-pointer group
                      ${isDragging ? 'border-blue-500 bg-blue-500/5 scale-[1.01]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}
                    `}
                  >
                    <input type="file" ref={compressInputRef} onChange={handleCompressFileUpload} accept="application/pdf" className="hidden" />
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center transition-colors ${isDragging ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 group-hover:text-blue-400 group-hover:bg-white/10'}`}>
                      <Minimize2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-white tracking-tight mb-2">Select a PDF to Optimize</h4>
                    <p className="text-sm text-gray-500 mb-8">or drag and drop it here</p>
                    <button className="rounded-xl bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                      Browse File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 gap-6">
                      <div className="flex items-center gap-5 overflow-hidden w-full">
                        <div className="bg-[#030712] p-4 rounded-2xl border border-white/5 flex-shrink-0">
                          <FileText className="w-7 h-7 text-red-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-base font-black text-white truncate">{compressFile.name}</p>
                          <p className="text-sm text-gray-500 mt-1">Original Size: <span className="font-bold text-gray-300">{formatBytes(compressFile.size)}</span></p>
                        </div>
                      </div>
                      <button onClick={() => { setCompressFile(null); setCompressResult(null); }} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20 transition-all w-full sm:w-auto text-center">
                        Remove
                      </button>
                    </div>

                    {compressResult && (
                      <div className={`border rounded-[2.5rem] p-10 text-center shadow-2xl animate-fade-in ${compressResult.reductionPct >= 5 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                        {compressResult.reductionPct >= 5 ? (
                          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
                            <CheckCircle className="w-10 h-10" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500">
                            <Info className="w-8 h-8" />
                          </div>
                        )}

                        <h4 className={`text-2xl font-black tracking-tight mb-2 ${compressResult.reductionPct >= 5 ? 'text-emerald-400' : 'text-white'}`}>
                          {compressResult.reductionPct >= 5
                            ? 'Optimization Complete!'
                            : compressResult.reductionPct < 1
                              ? 'Minimal reduction possible'
                              : 'Already optimized'}
                        </h4>

                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-black uppercase tracking-widest mt-8 bg-[#030712] w-fit mx-auto px-8 py-5 rounded-2xl border border-white/5 shadow-xl">
                          <div>
                            <span className="text-gray-500">Original</span>
                            <span className="text-white ml-3">{formatBytes(compressFile.size)}</span>
                          </div>
                          <div className="hidden sm:block w-px h-6 bg-white/10"></div>
                          <div>
                            <span className="text-gray-500">New Size</span>
                            <span className={`ml-3 ${compressResult.size < compressFile.size ? 'text-emerald-400' : 'text-white'}`}>
                              {formatBytes(compressResult.size)}
                            </span>
                          </div>
                          <div className="hidden sm:block w-px h-6 bg-white/10"></div>
                          <div>
                            <span className="text-gray-500">Reduction</span>
                            <span className={`ml-3 ${compressResult.reductionPct >= 5 ? 'text-emerald-400' : 'text-gray-400'}`}>
                              {compressResult.reductionPct > 0 ? compressResult.reductionPct.toFixed(1) : "0"}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-white/5">
                      <button onClick={resetAll} className="w-full sm:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                        Reset
                      </button>

                      {!compressResult ? (
                        <button
                          onClick={processCompress}
                          disabled={isProcessing}
                          className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                        >
                          {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Minimize2 className="w-4 h-4" />}
                          {isProcessing ? 'Optimizing...' : 'Optimize PDF'}
                        </button>
                      ) : (
                        <a
                          href={compressResult.url}
                          download={`optimized_${compressFile.name}`}
                          className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
                        >
                          <Download className="w-4 h-4" />
                          Download Result
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RELATED TOOLS SECTION */}
        <div className="mb-12 animate-fade-in">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 ml-1">Explore More PDF Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              href="/tools/pdf-tools/edit-pdf"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 block w-full h-full glass"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>

              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white shadow-2xl border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <FilePenLine className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Edit PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Add text to PDF, fill PDF forms, and download edited PDF online.
                </p>
              </div>

              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Try Tool
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Decorative corner accent */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-blue-600/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </div>

      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['pdf-tools']} />
    </div>
  );
}

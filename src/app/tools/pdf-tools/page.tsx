"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  FileText, Download, UploadCloud, Trash2,
  Files, Scissors, Minimize2, AlertCircle,
  CheckCircle, RefreshCw, Info, FileUp, Shield,
  ArrowUp, ArrowDown
} from 'lucide-react';

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
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link href="/tools" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all tools
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">

          {/* HEADER */}
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">PDF Tools</h1>
                  <p className="text-sm text-gray-500 mt-1">Merge, split, and optimize your PDF files effortlessly.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-800">Files are processed in your browser. Nothing is uploaded.</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-gray-50/50">
            {/* TAB NAVIGATION */}
            <div className="flex flex-wrap gap-3 mb-8">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id as TabId)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* SHARED MESSAGES */}
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100 shadow-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-start gap-3 border border-emerald-100 shadow-sm animate-fade-in">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* 1. MERGE PDF */}
            {activeTab === 'merge' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Merge Multiple PDFs</h3>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => mergeInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 sm:p-16 text-center transition-all cursor-pointer mb-6 group
                    ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-blue-400'}
                  `}
                >
                  <input type="file" ref={mergeInputRef} onChange={handleAddMergeFiles} multiple accept="application/pdf" className="hidden" />
                  <UploadCloud className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Select PDF files to Merge</h4>
                  <p className="text-sm text-gray-500 mb-6">or drag and drop them here</p>
                  <button className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm pointer-events-none">
                    Browse Files
                  </button>
                </div>

                {mergeFiles.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Selected Files ({mergeFiles.length})</h4>
                      <button onClick={() => setMergeFiles([])} className="text-xs font-semibold text-red-600 hover:text-red-700">Clear All</button>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {mergeFiles.map((f, i) => (
                        <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 group hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden w-full">
                            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex-shrink-0">
                              <FileText className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{formatBytes(f.size)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                            <button onClick={() => moveMergeFile(i, 'up')} disabled={i === 0} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Move Up">
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button onClick={() => moveMergeFile(i, 'down')} disabled={i === mergeFiles.length - 1} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Move Down">
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <button onClick={() => removeMergeFile(i)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-gray-100 mt-6">
                  <button onClick={resetAll} className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                    Reset
                  </button>
                  <button
                    onClick={processMerge}
                    disabled={isProcessing || mergeFiles.length < 2}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Files className="w-5 h-5" />}
                    {isProcessing ? 'Processing...' : 'Merge PDFs & Download'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. SPLIT PDF */}
            {activeTab === 'split' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Extract Pages from PDF</h3>

                {!splitFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => splitInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 sm:p-16 text-center transition-all cursor-pointer bg-white
                      ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:bg-gray-50 hover:border-blue-400'}
                    `}
                  >
                    <input type="file" ref={splitInputRef} onChange={handleSplitFileUpload} accept="application/pdf" className="hidden" />
                    <FileUp className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Select a PDF to Split</h4>
                    <p className="text-sm text-gray-500 mb-6">or drag and drop it here</p>
                    <button className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm pointer-events-none">
                      Browse File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-4">
                      <div className="flex items-center gap-4 overflow-hidden w-full">
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
                          <FileText className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-gray-900 truncate">{splitFile.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatBytes(splitFile.size)}</p>
                        </div>
                      </div>
                      <button onClick={() => { setSplitFile(null); setSplitRange(''); }} className="flex-shrink-0 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg border border-red-100 transition-colors w-full sm:w-auto text-center">
                        Remove
                      </button>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6">
                      <label className="block text-sm font-bold text-gray-900 mb-2">Pages to Extract</label>
                      <input
                        type="text"
                        value={splitRange}
                        onChange={(e) => setSplitRange(e.target.value)}
                        placeholder="e.g. 1, 3-5, 8"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow bg-white shadow-sm"
                      />
                      <div className="flex items-start gap-2 mt-3 text-xs text-gray-600">
                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <p>Format: Commas to separate pages, dashes for ranges. <br />Example: <span className="font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm font-bold text-blue-700">1-3, 5, 8-10</span></p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-gray-100">
                      <button onClick={resetAll} className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        Reset
                      </button>
                      <button
                        onClick={processSplit}
                        disabled={isProcessing || !splitRange.trim()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      >
                        {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Scissors className="w-5 h-5" />}
                        {isProcessing ? 'Processing...' : 'Split PDF & Download'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. OPTIMIZE PDF */}
            {activeTab === 'compress' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Optimize PDF Metadata</h3>

                <div className="mb-8 flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900 leading-relaxed">
                    Browser-only optimization may slightly reduce file size by stripping unused objects. Strong PDF compression needs image re-encoding and will be added soon.
                  </p>
                </div>

                {!compressFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => compressInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 sm:p-16 text-center transition-all cursor-pointer bg-white
                      ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:bg-gray-50 hover:border-blue-400'}
                    `}
                  >
                    <input type="file" ref={compressInputRef} onChange={handleCompressFileUpload} accept="application/pdf" className="hidden" />
                    <Minimize2 className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Select a PDF to Optimize</h4>
                    <p className="text-sm text-gray-500 mb-6">or drag and drop it here</p>
                    <button className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm pointer-events-none">
                      Browse File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-4">
                      <div className="flex items-center gap-4 overflow-hidden w-full">
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
                          <FileText className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-gray-900 truncate">{compressFile.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Original Size: <span className="font-semibold text-gray-700">{formatBytes(compressFile.size)}</span></p>
                        </div>
                      </div>
                      <button onClick={() => { setCompressFile(null); setCompressResult(null); }} className="flex-shrink-0 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg border border-red-100 transition-colors w-full sm:w-auto text-center">
                        Remove
                      </button>
                    </div>

                    {compressResult && (
                      <div className={`border rounded-xl p-6 text-center shadow-sm animate-fade-in ${compressResult.reductionPct >= 5 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                        {compressResult.reductionPct >= 5 ? (
                          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        ) : (
                          <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        )}

                        <h4 className={`text-lg font-bold mb-1 ${compressResult.reductionPct >= 5 ? 'text-emerald-900' : 'text-gray-800'}`}>
                          {compressResult.reductionPct >= 5
                            ? 'Optimization Complete!'
                            : compressResult.reductionPct < 1
                              ? 'Almost no reduction'
                              : 'This PDF is already optimized'}
                        </h4>

                        {compressResult.reductionPct < 5 && (
                          <p className="text-sm text-gray-500 mt-1 mb-4">No major reduction possible in browser mode.</p>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm mt-2 bg-white w-fit mx-auto px-4 py-3 rounded-lg shadow-sm border border-gray-100">
                          <div>
                            <span className="text-gray-500">Original:</span>
                            <span className="font-semibold text-gray-900 ml-1.5">{formatBytes(compressFile.size)}</span>
                          </div>
                          <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
                          <div>
                            <span className="text-gray-500">New:</span>
                            <span className={`font-bold ml-1.5 ${compressResult.size < compressFile.size ? 'text-emerald-600' : 'text-gray-700'}`}>
                              {formatBytes(compressResult.size)}
                            </span>
                          </div>
                          <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
                          <div>
                            <span className="text-gray-500">Reduction:</span>
                            <span className={`font-bold ml-1.5 ${compressResult.reductionPct >= 5 ? 'text-emerald-600' : 'text-gray-700'}`}>
                              {compressResult.reductionPct > 0 ? compressResult.reductionPct.toFixed(1) : "0"}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-gray-100">
                      <button onClick={resetAll} className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        Reset
                      </button>

                      {!compressResult ? (
                        <button
                          onClick={processCompress}
                          disabled={isProcessing}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                          {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Minimize2 className="w-5 h-5" />}
                          {isProcessing ? 'Processing...' : 'Optimize PDF'}
                        </button>
                      ) : (
                        <a
                          href={compressResult.url}
                          download={`optimized_${compressFile.name}`}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
                        >
                          <Download className="w-5 h-5" />
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
      </div>
    </div>
  );
}

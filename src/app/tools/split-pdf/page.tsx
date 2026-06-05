"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, UploadCloud, Trash2,
  Files, AlertCircle, CheckCircle, RefreshCw,
  ChevronLeft, ArrowRight, Shield, FileUp, Sparkles,
  Scissors, Grid, Layers, CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';

interface ThumbnailState {
  pageIndex: number;
  url: string;
}

type SplitMode = 'custom' | 'ranges' | 'all';

const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

export default function SplitPdf() {
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Workspace UI States
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]); // 1-based page indexes
  const [splitMode, setSplitMode] = useState<SplitMode>('custom');
  const [pageRangesInput, setPageRangesInput] = useState("");
  const [outputPrefix, setOutputPrefix] = useState("split_document");
  
  // Progress & Alert States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [success, setSuccess] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Initialize and load PDF.js dynamically
  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        const lib = await import('pdfjs-dist');
        lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
        setPdfjs(lib);
      } catch (err) {
        console.error("Failed to load pdfjs-dist", err);
        toast.error("Failed to initialize document preview engine.");
      }
    };
    loadPdfjs();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ------------------------------------
  // PREVIEW THUMBNAILS GENERATOR
  // ------------------------------------
  const generateThumbnails = async (doc: any) => {
    setThumbnailUrls([]);
    const urls: string[] = [];
    
    for (let i = 1; i <= doc.numPages; i++) {
      try {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });
        
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        
        if (context) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
          urls.push(canvas.toDataURL('image/jpeg', 0.85));
        }
      } catch (err) {
        console.error(`Thumbnail failed for page ${i}`, err);
        urls.push(''); // blank placeholder fallback
      }
    }
    setThumbnailUrls(urls);
  };

  // ------------------------------------
  // FILE LOADING
  // ------------------------------------
  const handlePdfUpload = (file: File) => {
    setPdfFile(file);
    setIsProcessing(true);
    setSuccess(false);
    setSelectedPages([]);
    setThumbnailUrls([]);
    setPageRangesInput("");
    setOutputPrefix(file.name.replace(/\.[^/.]+$/, "")); // Strip extension for prefix default
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        setPdfBytes(bytes);
        
        if (!pdfjs) {
          toast.error("PDF engine is initializing, please drop the file again.");
          setIsProcessing(false);
          setPdfFile(null);
          return;
        }

        const loadingTask = pdfjs.getDocument({ data: bytes });
        const doc = await loadingTask.promise;
        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        
        // Auto select all pages initially for custom mode
        setSelectedPages(Array.from({ length: doc.numPages }, (_, i) => i + 1));
        
        // Render previews asynchronously
        await generateThumbnails(doc);
      } catch (err) {
        console.error(err);
        toast.error("Invalid PDF document or failed to decrypt/read.");
        setPdfFile(null);
        setPdfBytes(null);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handlePdfUpload(file);
      } else {
        toast.error("Please upload valid PDF file only.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfBytes(null);
    pdfDocRef.current = null;
    setTotalPages(0);
    setThumbnailUrls([]);
    setSelectedPages([]);
    setPageRangesInput("");
    setOutputPrefix("split_document");
    setProgress(0);
    setIsProcessing(false);
    setSuccess(false);
    setDownloadCount(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ------------------------------------
  // GRID SELECTION CONTROLS
  // ------------------------------------
  const togglePageSelect = (pageNumber: number) => {
    setSelectedPages(prev => 
      prev.includes(pageNumber)
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber].sort((a, b) => a - b)
    );
    setSuccess(false);
  };

  const selectAll = () => {
    setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
    setSuccess(false);
  };

  const selectNone = () => {
    setSelectedPages([]);
    setSuccess(false);
  };

  // ------------------------------------
  // PARSE PAGE RANGES
  // ------------------------------------
  const parsePageRanges = (rangeStr: string): number[][] => {
    const outputs: number[][] = [];
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
          const block: number[] = [];
          for (let i = actualStart; i <= actualEnd; i++) {
            block.push(i);
          }
          if (block.length > 0) outputs.push(block);
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num > 0 && num <= totalPages) {
          outputs.push([num]);
        }
      }
    }
    return outputs;
  };

  // ------------------------------------
  // SPLIT & EXTRACT ALGORITHM
  // ------------------------------------
  const processSplit = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    setProgress(0);
    setSuccess(false);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const parentPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const prefix = outputPrefix.trim() ? outputPrefix.trim() : "split_document";
      const filesToDownload: { bytes: Uint8Array; name: string }[] = [];

      if (splitMode === 'custom') {
        // Mode 1: Custom extraction -> Merges all selected pages into a single file
        if (selectedPages.length === 0) {
          toast.error("Please select at least 1 page to extract.");
          setIsProcessing(false);
          return;
        }

        const newDoc = await PDFDocument.create();
        // PDFDocument page indices are 0-based
        const targetIndices = selectedPages.map(p => p - 1);
        const copiedPages = await newDoc.copyPages(parentPdf, targetIndices);
        copiedPages.forEach(p => newDoc.addPage(p));
        
        const bytes = await newDoc.save();
        filesToDownload.push({
          bytes,
          name: `${prefix}_extracted.pdf`
        });
        setProgress(100);

      } else if (splitMode === 'ranges') {
        // Mode 2: Page Ranges -> Splitting into multiple documents per range
        const ranges = parsePageRanges(pageRangesInput);
        if (ranges.length === 0) {
          toast.error("Invalid page range. Format should be like: 1-3, 5, 7-9");
          setIsProcessing(false);
          return;
        }

        for (let i = 0; i < ranges.length; i++) {
          const rangeBlock = ranges[i];
          const newDoc = await PDFDocument.create();
          const targetIndices = rangeBlock.map(p => p - 1);
          const copiedPages = await newDoc.copyPages(parentPdf, targetIndices);
          copiedPages.forEach(p => newDoc.addPage(p));
          
          const bytes = await newDoc.save();
          const rangeLabel = rangeBlock.length === 1 ? `${rangeBlock[0]}` : `${rangeBlock[0]}-${rangeBlock[rangeBlock.length - 1]}`;
          filesToDownload.push({
            bytes,
            name: `${prefix}_page_${rangeLabel}.pdf`
          });
          setProgress(Math.round(((i + 1) / ranges.length) * 100));
        }

      } else if (splitMode === 'all') {
        // Mode 3: Split All -> Splits every page into single page files
        for (let i = 0; i < totalPages; i++) {
          const newDoc = await PDFDocument.create();
          const copiedPages = await newDoc.copyPages(parentPdf, [i]);
          copiedPages.forEach(p => newDoc.addPage(p));
          
          const bytes = await newDoc.save();
          filesToDownload.push({
            bytes,
            name: `${prefix}_page_${i + 1}.pdf`
          });
          setProgress(Math.round(((i + 1) / totalPages) * 100));
        }
      }

      // Download segments sequentially with 200ms delay to prevent pop-up blocker issues
      setDownloadCount(filesToDownload.length);
      filesToDownload.forEach((file, index) => {
        setTimeout(() => {
          const blob = new Blob([uint8ArrayToArrayBuffer(file.bytes)], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const dl = document.createElement("a");
          dl.href = url;
          dl.download = file.name;
          document.body.appendChild(dl);
          dl.click();
          document.body.removeChild(dl);
          URL.revokeObjectURL(url);
        }, index * 220);
      });

      setSuccess(true);
      toast.success(`PDF split into ${filesToDownload.length} files successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to split PDF. Check that the document is not corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag-and-drop workspace triggers
  const handleDragOverUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverUpload(true);
  };

  const handleDragLeaveUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverUpload(false);
  };

  const handleDropUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverUpload(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handlePdfUpload(file);
      } else {
        toast.error("Drop PDF documents only.");
      }
    }
  };

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      <MeshGradient />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Navigation Link */}
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* Main Tool Container */}
        <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-16">
          
          {/* Header Banner */}
          <div className="p-8 sm:p-10 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                  <Scissors className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Split PDF</h1>
                  <p className="text-gray-400 font-medium mt-1">Extract specific page segments or break PDFs into individual files securely.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 h-fit">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Secure Processing</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 bg-black/[0.15]">
            
            {/* Success alert message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-[2rem] text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/25 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Split Completed!</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                  Your PDF was successfully split into {downloadCount} file(s). Downloading triggered automatically.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button 
                    onClick={processSplit} 
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <Download className="w-4 h-4" /> Download Segments Again
                  </button>
                  <button 
                    onClick={resetAll} 
                    className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                  >
                    Split New File
                  </button>
                </div>
              </motion.div>
            )}

            {/* Layout Split */}
            {!pdfFile ? (
              
              /* Upload zone */
              <div
                onDragOver={handleDragOverUpload}
                onDragLeave={handleDragLeaveUpload}
                onDrop={handleDropUpload}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[3rem] p-12 sm:p-24 text-center transition-all cursor-pointer group relative overflow-hidden
                  ${isDraggingOverUpload 
                    ? 'border-blue-500 bg-blue-500/10 scale-[1.01] shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                  }
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="application/pdf" 
                  className="hidden" 
                />
                
                {/* Decorative glow background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 border border-white/5 group-hover:text-blue-400 group-hover:bg-blue-500/10 group-hover:scale-110 transition-all duration-300 shadow-2xl">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-3">Upload a PDF to Split</h3>
                  <p className="text-sm text-gray-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                    Drag and drop your PDF here, or click to choose from your device. Files remain strictly inside your browser.
                  </p>
                  <button className="rounded-xl bg-white text-black px-8 py-3.5 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]">
                    Browse File
                  </button>
                </div>
              </div>
            ) : (
              
              /* Interactive Split Workspace */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left side page visualizer (2/3 Col) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* File Metadata Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/5 border border-white/5 rounded-2xl gap-4">
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <div className="bg-[#030712] p-3 rounded-xl border border-white/5 flex-shrink-0">
                        <FileText className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">{pdfFile.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{formatBytes(pdfFile.size)} • {totalPages} pages</p>
                      </div>
                    </div>
                    <button 
                      onClick={resetAll} 
                      className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 bg-red-500/10 px-4 py-2 border border-red-500/20 rounded-xl transition-all self-end sm:self-auto"
                    >
                      Clear File
                    </button>
                  </div>

                  {/* Visualizer header controls */}
                  <div className="flex items-center justify-between pb-2">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                      PDF Page Previews ({totalPages})
                    </h4>
                    {splitMode === 'custom' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={selectAll} 
                          className="text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Select All
                        </button>
                        <span className="text-gray-700">|</span>
                        <button 
                          onClick={selectNone} 
                          className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-400 transition-colors"
                        >
                          Clear Selection
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail rendering slot */}
                  {thumbnailUrls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-white/[0.01] border border-white/5 rounded-3xl gap-4">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Generating page previews...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {thumbnailUrls.map((url, idx) => {
                        const pageNum = idx + 1;
                        const isSelected = selectedPages.includes(pageNum);
                        const isDisabled = splitMode !== 'custom';
                        
                        return (
                          <div 
                            key={idx}
                            onClick={() => !isDisabled && togglePageSelect(pageNum)}
                            className={`relative border rounded-2xl overflow-hidden aspect-[3/4] bg-white/[0.02] flex flex-col justify-between transition-all group
                              ${isDisabled ? 'cursor-not-allowed opacity-80 border-white/5' : 'cursor-pointer'}
                              ${isSelected && !isDisabled 
                                ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-2 ring-blue-500/20' 
                                : 'border-white/5 hover:border-white/20'
                              }
                            `}
                          >
                            {/* Canvas render background */}
                            <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden bg-white/5">
                              {url ? (
                                <img src={url} alt={`Page ${pageNum}`} className="max-h-full max-w-full object-contain rounded shadow-lg transition-transform group-hover:scale-[1.02]" />
                              ) : (
                                <div className="text-center text-xs text-gray-600 font-bold uppercase">Page {pageNum}</div>
                              )}
                              
                              {/* Selection overlay indicator */}
                              {!isDisabled && (
                                <div className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all
                                  ${isSelected 
                                    ? 'bg-blue-500 border-blue-500 text-white scale-100 shadow-md' 
                                    : 'bg-black/40 border-white/10 text-transparent scale-90 group-hover:scale-100'
                                  }
                                `}>
                                  <CheckSquare className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>

                            {/* Page Index Banner */}
                            <div className={`p-2.5 text-center text-[10px] font-black uppercase tracking-widest border-t transition-colors
                              ${isSelected && !isDisabled ? 'bg-blue-500/10 border-blue-500/10 text-blue-400' : 'bg-[#030712] border-white/5 text-gray-500'}
                            `}>
                              Page {pageNum}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* Right side config panel (1/3 Col) */}
                <div>
                  <div className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 space-y-8 sticky top-28 self-start bg-white/[0.01]">
                    
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pb-4 border-b border-white/5">
                      Split Configurations
                    </h4>

                    {/* Mode selection block */}
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Select Split Mode
                      </label>
                      <div className="space-y-2.5">
                        
                        {/* Custom Mode */}
                        <button
                          onClick={() => setSplitMode('custom')}
                          className={`w-full flex items-start gap-3.5 p-4 rounded-xl border transition-all text-left
                            ${splitMode === 'custom' 
                              ? 'bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.05)]' 
                              : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/[0.02] hover:border-white/10'
                            }
                          `}
                        >
                          <Grid className={`w-5 h-5 flex-shrink-0 mt-0.5 ${splitMode === 'custom' ? 'text-blue-400' : 'text-gray-500'}`} />
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider">Custom Extract</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1">Select specific pages to combine into a single PDF.</p>
                          </div>
                        </button>

                        {/* Page Ranges Mode */}
                        <button
                          onClick={() => setSplitMode('ranges')}
                          className={`w-full flex items-start gap-3.5 p-4 rounded-xl border transition-all text-left
                            ${splitMode === 'ranges' 
                              ? 'bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.05)]' 
                              : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/[0.02] hover:border-white/10'
                            }
                          `}
                        >
                          <Layers className={`w-5 h-5 flex-shrink-0 mt-0.5 ${splitMode === 'ranges' ? 'text-blue-400' : 'text-gray-500'}`} />
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider">Split by Ranges</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1">Divide documents into page segments (e.g. 1-3, 4-7).</p>
                          </div>
                        </button>

                        {/* Split All Mode */}
                        <button
                          onClick={() => setSplitMode('all')}
                          className={`w-full flex items-start gap-3.5 p-4 rounded-xl border transition-all text-left
                            ${splitMode === 'all' 
                              ? 'bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.05)]' 
                              : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/[0.02] hover:border-white/10'
                            }
                          `}
                        >
                          <Scissors className={`w-5 h-5 flex-shrink-0 mt-0.5 ${splitMode === 'all' ? 'text-blue-400' : 'text-gray-500'}`} />
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider">Split All Pages</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1">Extract every page into individual single-page documents.</p>
                          </div>
                        </button>

                      </div>
                    </div>

                    {/* Conditional input details */}
                    {splitMode === 'ranges' && (
                      <div className="space-y-3 p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                        <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
                          Specify Range Blocks
                        </label>
                        <input
                          type="text"
                          value={pageRangesInput}
                          onChange={(e) => setPageRangesInput(e.target.value)}
                          placeholder="e.g. 1-2, 4, 5-8"
                          className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold bg-[#030712] text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                        />
                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                          Use commas to split distinct files, and dashes for ranges. E.g., <span className="font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">1-3, 5</span> yields 2 files.
                        </p>
                      </div>
                    )}

                    {splitMode === 'custom' && (
                      <div className="space-y-2 text-xs font-medium text-gray-400">
                        <div className="flex justify-between">
                          <span>Selected Pages</span>
                          <span className="font-bold text-white">{selectedPages.length} of {totalPages}</span>
                        </div>
                      </div>
                    )}

                    {/* Output Prefix Name */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Download Prefix
                      </label>
                      <input 
                        type="text" 
                        value={outputPrefix}
                        onChange={(e) => setOutputPrefix(e.target.value)}
                        placeholder="split_document"
                        className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold bg-[#030712] text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                      />
                    </div>

                    {/* Processing loaders */}
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-blue-400">
                          <span>Extracting pages...</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action button trigger */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <button
                        onClick={processSplit}
                        disabled={isProcessing || (splitMode === 'custom' && selectedPages.length === 0) || (splitMode === 'ranges' && !pageRangesInput.trim())}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {isProcessing ? 'Processing Split...' : 'Split & Download'}
                      </button>

                      <button
                        onClick={resetAll}
                        disabled={isProcessing}
                        className="w-full px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-30"
                      >
                        Reset Workspace
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* RELATED TOOLS LIST */}
        <div className="mb-12 animate-fade-in">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 ml-1">Explore PDF Workspace</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Merge PDF Card */}
            <Link 
              href="/tools/merge-pdf"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Files className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Merge PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Combine multiple distinct PDF documents into a single professional-grade file quickly and securely.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Edit PDF Card */}
            <Link 
              href="/tools/pdf-tools/edit-pdf"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Edit PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Add text annotations, fill complex PDF forms, write on documents, and download online.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

          </div>
        </div>

      </div>

      {/* SEO Deep-Dive Article Section */}
      {toolArticles['split-pdf'] && (
        <ToolArticle {...toolArticles['split-pdf']} />
      )}
    </div>
  );
}

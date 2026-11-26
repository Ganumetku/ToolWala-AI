"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Trash2,
  Files, AlertCircle, CheckCircle, RefreshCw,
  ChevronLeft, ArrowRight, Shield, FileUp, Sparkles,
  Image, FileArchive, CheckSquare, Grid, Layers, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';
import PdfToolIcon from '@/components/PdfToolIcon';

interface ConvertedImage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

type ConversionQuality = 'low' | 'medium' | 'high';
type SelectionMode = 'all' | 'custom';

export default function PdfToJpg() {
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Workspace UI States
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]); // 1-based page indexes
  const [quality, setQuality] = useState<ConversionQuality>('medium');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('all');
  const [outputPrefix, setOutputPrefix] = useState("document_pages");
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  
  // Progress & Alert States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Initialize and load PDF.js dynamically
  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        const lib = await import('pdfjs-dist');
        lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
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
        const viewport = page.getViewport({ scale: 0.2 }); // low res for quick grid previews
        
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
          urls.push(canvas.toDataURL('image/jpeg', 0.8));
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
    setConvertedImages([]);
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
        
        // Auto select all pages initially
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
    setConvertedImages([]);
    setOutputPrefix("document_pages");
    setProgress(0);
    setIsProcessing(false);
    setSuccess(false);
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
  };

  const selectNone = () => {
    setSelectedPages([]);
  };

  // ------------------------------------
  // CONVERSION EXECUTION
  // ------------------------------------
  const convertPdfToJpg = async () => {
    const doc = pdfDocRef.current;
    if (!doc) {
      toast.error("No document loaded.");
      return;
    }

    const pagesToConvert = selectionMode === 'all' 
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : selectedPages;

    if (pagesToConvert.length === 0) {
      toast.error("Please select at least one page to convert.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setConvertedImages([]);
    setSuccess(false);

    // DPI Quality settings mapping to scale parameters
    let scale = 1.5; // Medium
    if (quality === 'low') scale = 1.0;
    if (quality === 'high') scale = 2.5;

    const renders: ConvertedImage[] = [];

    try {
      for (let index = 0; index < pagesToConvert.length; index++) {
        const pageNum = pagesToConvert[index];
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

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

          // Convert canvas to base64 jpeg data URL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          renders.push({
            pageNumber: pageNum,
            dataUrl,
            width: viewport.width,
            height: viewport.height
          });
        }

        // Calculate progress percentage
        setProgress(Math.round(((index + 1) / pagesToConvert.length) * 100));
      }

      setConvertedImages(renders);
      setSuccess(true);
      toast.success(`Successfully converted ${renders.length} page(s) to JPG!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to render PDF pages into images.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ------------------------------------
  // DOWNLOAD UTILITIES
  // ------------------------------------
  const downloadSingleImage = (img: ConvertedImage) => {
    const dl = document.createElement('a');
    dl.href = img.dataUrl;
    dl.download = `${outputPrefix}_page_${img.pageNumber}.jpg`;
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
  };

  const downloadAllAsZip = async () => {
    if (convertedImages.length === 0) return;
    
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      
      convertedImages.forEach(img => {
        // Remove base64 metadata headers
        const base64Data = img.dataUrl.split(',')[1];
        zip.file(`${outputPrefix}_page_${img.pageNumber}.jpg`, base64Data, { base64: true });
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      
      const dl = document.createElement('a');
      dl.href = url;
      dl.download = `${outputPrefix}_images.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
      
      URL.revokeObjectURL(url);
      toast.success("ZIP archive downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Unable to generate ZIP archive.");
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
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden transition-colors duration-250 font-sans">
      <MeshGradient />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Navigation Link */}
        <Link href="/tools/" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* Main Tool Container */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          
          {/* Header Banner */}
          <div className="p-8 sm:p-10 border-b border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <PdfToolIcon toolId="pdf-to-jpg" size="xl" className="shrink-0" />
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">PDF to JPG</h1>
                  <p className="text-slate-600 dark:text-gray-400 font-medium mt-1">Convert PDF pages into high-resolution JPG images entirely in your browser.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 h-fit shadow-sm">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Secure Client Processing</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            
            {/* Success state overview */}
            {success && convertedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-10 p-8 border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl text-center shadow-sm"
              >
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Conversion Complete!</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {convertedImages.length} page(s) successfully converted to JPG files. Save them individually or download everything zipped.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button 
                    onClick={downloadAllAsZip} 
                    className="flex items-center gap-2.5 px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] cursor-pointer"
                  >
                    <FileArchive className="w-4 h-4" /> Download All as ZIP
                  </button>
                  <button 
                    onClick={resetAll} 
                    className="px-7 py-4 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Convert New PDF
                  </button>
                </div>
              </motion.div>
            )}

            {/* Layout Panels */}
            {!pdfFile ? (
              
              /* 1. Upload Deck */
              <div
                onDragOver={handleDragOverUpload}
                onDragLeave={handleDragLeaveUpload}
                onDrop={handleDropUpload}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl py-12 sm:py-20 px-6 sm:px-10 text-center transition-all cursor-pointer group relative overflow-hidden shadow-sm
                  ${isDraggingOverUpload 
                    ? 'border-blue-500 bg-blue-500/5 scale-[1.01]' 
                    : 'border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] hover:border-blue-500/50 hover:bg-blue-500/[0.02]'
                  }
                `}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="hidden"
                />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 group-hover:border-blue-500/50 transition-all duration-300 shadow-sm">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Drop your PDF here</h3>
                  <p className="text-slate-500 dark:text-gray-400 font-medium max-w-sm mx-auto mb-5 text-sm">
                    It stays in this tab — nothing is sent to a server.
                  </p>
                  <button className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer">
                    Choose PDF
                  </button>
                </div>
                
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
              </div>

            ) : (

              /* 2. Workspace View */
              <div className="space-y-10">
                
                {/* File overview card */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-2xl gap-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">{pdfFile.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-500 font-semibold mt-0.5">
                        {formatBytes(pdfFile.size)} • {totalPages} Pages
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={resetAll}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2.5 border border-red-200 dark:border-red-500/20 hover:border-red-300 bg-red-50 dark:bg-red-500/5 text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove File
                  </button>
                </div>

                {/* Configuration Panel & Visual Selection Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  
                  {/* Left Column: Settings Configuration */}
                  <div className="space-y-8 lg:col-span-1">
                    <div className="bg-[#FBFCFE] dark:bg-white/[0.02] p-6 sm:p-8 rounded-3xl border border-[#E6ECF5] dark:border-white/5 space-y-6 shadow-sm">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-[#E6ECF5] dark:border-white/5 pb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-500" /> Output Settings
                      </h3>
                      
                      {/* Name Prefix */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">File Name Prefix</label>
                        <input
                          type="text"
                          value={outputPrefix}
                          onChange={(e) => setOutputPrefix(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, "_"))}
                          className="w-full bg-white dark:bg-[#030712]/50 border border-slate-200 dark:border-white/5 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-semibold outline-none transition-all shadow-sm"
                          placeholder="document_pages"
                        />
                      </div>

                      {/* Image Quality Chips */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">Resolution Quality</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['low', 'medium', 'high'] as ConversionQuality[]).map((q) => (
                            <button
                              key={q}
                              onClick={() => setQuality(q)}
                              className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer ${
                                quality === q
                                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                                  : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-gray-500 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                        <p className="text-[9px] text-slate-500 dark:text-gray-600 font-bold leading-normal ml-1">
                          {quality === 'low' && "Low DPI (Fastest, optimized for compact file storage)"}
                          {quality === 'medium' && "Medium DPI (Standard visual resolution, balanced layout)"}
                          {quality === 'high' && "High DPI (300 DPI scale, optimized for zooms & prints)"}
                        </p>
                      </div>

                      {/* Page selection chips */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">Pages to Extract</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectionMode('all')}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer ${
                              selectionMode === 'all'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-gray-500 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            All Pages
                          </button>
                          <button
                            onClick={() => setSelectionMode('custom')}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer ${
                              selectionMode === 'custom'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-gray-500 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Custom Select
                          </button>
                        </div>
                      </div>

                      {/* Render Trigger CTA */}
                      <button
                        onClick={convertPdfToJpg}
                        disabled={isProcessing || (selectionMode === 'custom' && selectedPages.length === 0)}
                        className="w-full flex items-center justify-center gap-2.5 px-6 py-4.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Rendering... {progress}%
                          </>
                        ) : (
                          <>
                            <Image className="w-4 h-4" /> Convert PDF to JPG
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: PDF Preview Grid */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#FBFCFE] dark:bg-white/[0.02] p-6 sm:p-8 rounded-3xl border border-[#E6ECF5] dark:border-white/5 shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E6ECF5] dark:border-white/5 pb-4 mb-6 gap-4">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Visual Previewer</h3>
                          <p className="text-[10px] text-slate-500 dark:text-gray-500 font-semibold mt-0.5">
                            {selectionMode === 'all' 
                              ? "Converting all pages of the document." 
                              : `Selected ${selectedPages.length} of ${totalPages} pages.`
                            }
                          </p>
                        </div>
                        {selectionMode === 'custom' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={selectAll} 
                              className="px-3 py-1.5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-lg bg-slate-100 dark:bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm"
                            >
                              Select All
                            </button>
                            <button 
                              onClick={selectNone} 
                              className="px-3 py-1.5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-lg bg-slate-100 dark:bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>

                      {thumbnailUrls.length === 0 ? (
                        <div className="py-20 text-center text-slate-500 dark:text-gray-600">
                          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600 dark:text-blue-500" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Generating Visual Previews</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[480px] overflow-y-auto pr-2">
                          {thumbnailUrls.map((url, idx) => {
                            const pageNum = idx + 1;
                            const isSelected = selectedPages.includes(pageNum);
                            const activeCustom = selectionMode === 'custom';
                            
                            return (
                              <div
                                key={idx}
                                onClick={() => activeCustom && togglePageSelect(pageNum)}
                                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border bg-slate-100/90 dark:bg-white/5 transition-all shadow-sm
                                  ${activeCustom ? 'cursor-pointer' : 'cursor-default'}
                                  ${(isSelected || !activeCustom)
                                    ? 'border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)] bg-blue-50/50 dark:bg-blue-500/5'
                                    : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                                  }
                                `}
                              >
                                {/* Thumbnail Image */}
                                {url ? (
                                  <img 
                                    src={url} 
                                    alt={`Page ${pageNum}`} 
                                    className="w-full h-full object-contain p-2"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-gray-700 bg-slate-200/50 dark:bg-black/40">
                                    <FileText className="w-8 h-8" />
                                  </div>
                                )}

                                {/* Overlay Label */}
                                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-white/90 dark:bg-black/75 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 backdrop-blur-md shadow-sm">
                                  <span className="text-[9px] font-black text-slate-700 dark:text-gray-300">PAGE {pageNum}</span>
                                  {activeCustom && (
                                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors
                                      ${isSelected 
                                        ? 'bg-blue-600 border-blue-500 text-white' 
                                        : 'border-slate-300 dark:border-white/20'
                                      }
                                    `}>
                                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                                    </div>
                                  )}
                                </div>

                                {/* Active Selection Border Highlight */}
                                {(!activeCustom || isSelected) && (
                                  <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl pointer-events-none" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Progress bar when converting */}
                {isProcessing && progress > 0 && (
                  <div className="p-6 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-2xl space-y-3 shadow-sm">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400">
                      <span>Conversion Progress</span>
                      <span className="text-blue-600 dark:text-blue-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Generated Outputs Display Drawer */}
            {convertedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 space-y-6 pt-10 border-t border-[#E6ECF5] dark:border-white/5"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Extracted JPEG Images</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-500 font-semibold mt-0.5">Download files individually or compile everything.</p>
                  </div>
                  <button 
                    onClick={downloadAllAsZip} 
                    className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] cursor-pointer"
                  >
                    <FileArchive className="w-4 h-4" /> Download All as ZIP
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {convertedImages.map((img) => (
                    <div 
                      key={img.pageNumber}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] p-5 shadow-sm hover:border-slate-300 dark:hover:border-white/15 transition-all"
                    >
                      {/* Image card wrapper */}
                      <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 relative flex items-center justify-center p-2 mb-4 shadow-inner">
                        <img 
                          src={img.dataUrl} 
                          alt={`Page ${img.pageNumber}`} 
                          className="max-w-full max-h-full object-contain"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/75 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5 text-[9px] font-black text-slate-700 dark:text-gray-300 shadow-sm">
                          {img.width} x {img.height}
                        </div>
                      </div>

                      {/* Card meta and action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">PAGE {img.pageNumber}</h4>
                          <p className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider mt-0.5">JPEG format</p>
                        </div>
                        <button
                          onClick={() => downloadSingleImage(img)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all cursor-pointer shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </div>

        {/* RELATED TOOLS LIST */}
        <div className="mb-12 animate-fade-in">
          <h3 className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 ml-1">Explore PDF Workspace</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Split PDF Card */}
            <Link 
              href="/tools/split-pdf/"
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.03] p-7 transition-all duration-300 hover:border-blue-500/50 shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-gradient-to-br dark:from-blue-500/10 dark:to-indigo-500/10 text-blue-600 dark:text-white border border-blue-100 dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                  <Grid className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">Split PDF</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-slate-800 dark:group-hover:text-gray-300 transition-colors">
                  Extract specific page segments or split your PDF documents into separate individual files.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Merge PDF Card */}
            <Link 
              href="/tools/merge-pdf/"
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.03] p-7 transition-all duration-300 hover:border-blue-500/50 shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-gradient-to-br dark:from-blue-500/10 dark:to-indigo-500/10 text-blue-600 dark:text-white border border-blue-100 dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                  <Files className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">Merge PDF</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-slate-800 dark:group-hover:text-gray-300 transition-colors">
                  Combine multiple distinct PDF documents into a single professional-grade file quickly and securely.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* JPG to PDF Card */}
            <Link 
              href="/tools/jpg-to-pdf/"
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.03] p-7 transition-all duration-300 hover:border-blue-500/50 shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-gradient-to-br dark:from-blue-500/10 dark:to-indigo-500/10 text-blue-600 dark:text-white border border-blue-100 dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">JPG to PDF</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-slate-800 dark:group-hover:text-gray-300 transition-colors">
                  Convert JPG, JPEG, and PNG images into a single professional PDF document.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

          </div>
        </div>

      </div>

      {/* SEO Deep-Dive Article Section */}
      {toolArticles['pdf-to-jpg'] && (
        <ToolArticle preferArticleCopy {...toolArticles['pdf-to-jpg']} />
      )}
    </div>
  );
}

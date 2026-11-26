"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, UploadCloud, FileImage, Download, RefreshCw, 
  Trash2, CheckCircle2, AlertCircle, Info, ShieldCheck, Zap,
  Archive, Sliders, Image as ImageIcon, Sparkles, BookOpen,
  ArrowRight, FileCheck, Eye, Loader2, HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';
import PdfToolIcon from '@/components/PdfToolIcon';

const SEO_DESC = "Convert Apple HEIC and HEIF photos to JPG or PNG format instantly in your browser. 100% private, batch conversion, zero server uploads.";

interface ConvertedFileItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  format: 'jpg' | 'png';
  quality: number;
  status: 'idle' | 'converting' | 'completed' | 'error' | 'skipped';
  convertedBlob?: Blob;
  previewUrl?: string;
  convertedSize?: number;
  error?: string;
  isAlreadySupported?: boolean;
}

export default function HeicToJpgPngConverterPage() {
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings
  const [targetFormat, setTargetFormat] = useState<'jpg' | 'png'>('jpg');
  const [quality, setQuality] = useState<number>(90); // 60 to 100

  // File list state
  const [files, setFiles] = useState<ConvertedFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format file size utility
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Process newly added files
  const handleAddFiles = (incomingFiles: FileList | File[]) => {
    const newItems: ConvertedFileItem[] = [];

    Array.from(incomingFiles).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isHeic = ext === 'heic' || ext === 'heif' || file.type.includes('heic') || file.type.includes('heif');
      const isAlreadyImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) || file.type.startsWith('image/');

      if (isAlreadyImage && !isHeic) {
        // Already supported format, preview directly
        const previewUrl = URL.createObjectURL(file);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          originalSize: file.size,
          format: targetFormat,
          quality,
          status: 'skipped',
          convertedBlob: file,
          previewUrl,
          convertedSize: file.size,
          isAlreadySupported: true
        });
      } else {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          originalSize: file.size,
          format: targetFormat,
          quality,
          status: 'idle'
        });
      }
    });

    setFiles((prev) => [...prev, ...newItems]);
  };

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  // Convert a single HEIC file using client-side heic2any dynamic import
  const convertSingleFile = async (item: ConvertedFileItem, format: 'jpg' | 'png', q: number) => {
    if (item.status === 'completed' || item.status === 'skipped') return;

    // Update status to converting
    setFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: 'converting', error: undefined } : f))
    );

    try {
      // Dynamically import heic2any for client-side WebAssembly decoding
      const heic2anyModule = (await import('heic2any')).default;

      const outputMime = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const outputQuality = format === 'jpg' ? q / 100 : undefined;

      const result = await heic2anyModule({
        blob: item.file,
        toType: outputMime,
        quality: outputQuality
      });

      // result can be Blob or Blob[]
      const blobResult = Array.isArray(result) ? result[0] : result;
      const previewUrl = URL.createObjectURL(blobResult);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: 'completed',
                convertedBlob: blobResult,
                previewUrl,
                convertedSize: blobResult.size,
                format,
                quality: q
              }
            : f
        )
      );
    } catch (err: any) {
      console.error('HEIC Conversion Error:', err);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: 'error',
                error: err?.message || 'Failed to decode HEIC file. File might be corrupted or unsupported.'
              }
            : f
        )
      );
    }
  };

  // Convert all pending files
  const handleConvertAll = async () => {
    setIsConvertingAll(true);
    const pending = files.filter((f) => f.status === 'idle' || f.status === 'error');
    for (const item of pending) {
      await convertSingleFile(item, targetFormat, quality);
    }
    setIsConvertingAll(false);
  };

  // Remove single file
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl && !target.isAlreadySupported) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  // Clear all files
  const handleClearAll = () => {
    files.forEach((f) => {
      if (f.previewUrl && !f.isAlreadySupported) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
    setFiles([]);
  };

  // Download individual converted file
  const handleDownloadSingle = (item: ConvertedFileItem) => {
    if (!item.convertedBlob) return;
    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const ext = item.isAlreadySupported ? item.name.split('.').pop() || 'jpg' : item.format;
    const downloadName = `${baseName}-toolwala.${ext}`;
    saveAs(item.convertedBlob, downloadName);
  };

  // Download all as ZIP archive
  const handleDownloadZip = async () => {
    const readyFiles = files.filter((f) => f.convertedBlob);
    if (readyFiles.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      readyFiles.forEach((item) => {
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        const ext = item.isAlreadySupported ? item.name.split('.').pop() || 'jpg' : item.format;
        const fileName = `${baseName}-converted.${ext}`;
        zip.file(fileName, item.convertedBlob as Blob);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'ToolWala-HEIC-Converted-Images.zip');
    } catch (err) {
      console.error('ZIP generation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Summary statistics
  const stats = useMemo(() => {
    const totalFiles = files.length;
    const totalOriginalBytes = files.reduce((acc, f) => acc + f.originalSize, 0);
    const convertedCount = files.filter((f) => f.status === 'completed' || f.status === 'skipped').length;
    const totalConvertedBytes = files.reduce((acc, f) => acc + (f.convertedSize || f.originalSize), 0);
    return {
      totalFiles,
      totalOriginalBytes,
      convertedCount,
      totalConvertedBytes
    };
  }, [files]);

  const article = toolArticles['heic-to-jpg-png-converter'];

  return (
    <ToolVisibilityGuard slug="heic-to-jpg-png-converter">
      <div className="relative min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden font-sans">
        {/* Background Gradients */}
        <MeshGradient />
        <FloatingParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/tools/" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Tools
            </Link>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4" /> 100% In-Browser & Private
            </span>
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <PdfToolIcon toolId="heic-to-jpg-png-converter" size="xl" className="mx-auto mb-4" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
              <ImageIcon className="w-4 h-4" />
              <span>Apple Image Converter</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-3 uppercase leading-none">
              HEIC to JPG / PNG
            </h1>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-extrabold uppercase tracking-widest mb-4">
              Convert iPhone HEIC & HEIF Photos Instantly
            </p>
            <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
              {SEO_DESC}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 mt-6">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Zero Server Uploads
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <Zap className="w-3.5 h-3.5 text-emerald-500" /> WebAssembly Powered
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <Archive className="w-3.5 h-3.5 text-emerald-500" /> Batch ZIP Export
              </span>
            </div>
          </div>

          {/* Converter Tool Area */}
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Format & Compression Settings Bar */}
            <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-6 bg-white dark:bg-white/[0.01] shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                
                {/* Format Toggle */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-2 block">Output Format</span>
                  <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10">
                    <button
                      onClick={() => setTargetFormat('jpg')}
                      className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                        targetFormat === 'jpg' 
                          ? 'bg-white dark:bg-white/10 text-emerald-700 dark:text-emerald-400 shadow-sm font-black' 
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      JPG / JPEG
                    </button>
                    <button
                      onClick={() => setTargetFormat('png')}
                      className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                        targetFormat === 'png' 
                          ? 'bg-white dark:bg-white/10 text-emerald-700 dark:text-emerald-400 shadow-sm font-black' 
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      PNG (Lossless)
                    </button>
                  </div>
                </div>

                {/* JPG Quality Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">
                      {targetFormat === 'jpg' ? 'JPEG Quality' : 'PNG Resolution'}
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {targetFormat === 'jpg' ? `${quality}%` : 'Maximum Clarity'}
                    </span>
                  </div>

                  {targetFormat === 'jpg' ? (
                    <div className="space-y-1">
                      <input 
                        type="range" 
                        min={60} 
                        max={100} 
                        value={quality} 
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] font-semibold text-slate-400 dark:text-gray-500">
                        <span>60% (Smaller File)</span>
                        <span>90% (Recommended)</span>
                        <span>100% (Best Quality)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-medium text-slate-600 dark:text-gray-400 text-center border border-slate-200 dark:border-white/5">
                      ✨ PNG offers full uncompressed clarity with lossless quality.
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`glass rounded-[2.5rem] border-2 border-dashed p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-2xl ${
                isDragOver 
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]' 
                  : 'border-slate-300 dark:border-white/15 hover:border-emerald-500 dark:hover:border-emerald-500/50 bg-white/80 dark:bg-white/[0.01]'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                multiple
                accept=".heic,.heif,.HEIC,.HEIF,image/heic,image/heif,image/*"
                onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Drop your HEIC photos here or <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/30">Browse Files</span>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">
                    Supports <span className="font-bold text-slate-700 dark:text-slate-300">.HEIC, .HEIF</span> iPhone photos (Batch upload supported)
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[11px] font-bold text-slate-400 dark:text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Client-Side • Photos never leave your device</span>
                </div>
              </div>
            </div>

            {/* Selected File List & Controls */}
            {files.length > 0 && (
              <div className="space-y-6">
                
                {/* Summary Bar & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-md">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        {stats.totalFiles} {stats.totalFiles === 1 ? 'File' : 'Files'} selected • {formatBytes(stats.totalOriginalBytes)}
                      </p>
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {stats.convertedCount} of {stats.totalFiles} converted
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleConvertAll}
                      disabled={isConvertingAll || stats.convertedCount === stats.totalFiles}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
                    >
                      {isConvertingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      {isConvertingAll ? 'Converting...' : 'Convert All'}
                    </button>

                    {stats.convertedCount > 0 && (
                      <button
                        onClick={handleDownloadZip}
                        disabled={isZipping}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                      >
                        {isZipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                        {isZipping ? 'Zipping...' : 'Download All (ZIP)'}
                      </button>
                    )}

                    <button
                      onClick={handleClearAll}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 text-slate-600 dark:text-gray-400 font-bold text-xs transition-colors border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                  </div>
                </div>

                {/* Individual File Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.map((item) => (
                    <div 
                      key={item.id}
                      className="glass rounded-2xl border border-slate-200/80 dark:border-white/5 p-4 bg-white dark:bg-white/[0.01] flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow relative"
                    >
                      {/* Image Preview / Icon */}
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {item.previewUrl ? (
                          <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : item.status === 'converting' ? (
                          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        ) : (
                          <FileImage className="w-6 h-6 text-slate-400 dark:text-gray-500" />
                        )}
                      </div>

                      {/* File Metadata & Status */}
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate" title={item.name}>
                          {item.name}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400">
                            {formatBytes(item.originalSize)}
                          </span>

                          {item.convertedSize && item.convertedSize !== item.originalSize && (
                            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              → {formatBytes(item.convertedSize)}
                            </span>
                          )}
                        </div>

                        {/* Status Message Badges */}
                        <div className="mt-2">
                          {item.status === 'idle' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                              Ready for conversion
                            </span>
                          )}
                          {item.status === 'converting' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              <Loader2 className="w-3 h-3 animate-spin" /> Converting in browser...
                            </span>
                          )}
                          {item.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Converted to {item.format.toUpperCase()}
                            </span>
                          )}
                          {item.status === 'skipped' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                              <FileCheck className="w-3 h-3" /> Already supported image
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                              <AlertCircle className="w-3 h-3" /> {item.error || 'Conversion error'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Item Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {item.status === 'idle' && (
                          <button
                            onClick={() => convertSingleFile(item, targetFormat, quality)}
                            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                            title="Convert file"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        )}

                        {item.convertedBlob && (
                          <button
                            onClick={() => handleDownloadSingle(item)}
                            className="p-2 rounded-xl bg-emerald-500 text-white hover:brightness-110 transition-all shadow-sm"
                            title="Download Converted File"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleRemoveFile(item.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Security & Privacy Card */}
            <div className="glass rounded-2xl border border-emerald-500/20 p-5 bg-emerald-500/5 text-slate-700 dark:text-gray-300 flex items-start gap-3 text-xs font-medium shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Privacy Commitment:</strong> All HEIC image conversions happen 100% locally inside your web browser memory using WebAssembly. Your photos are never uploaded to any cloud server or database.
              </p>
            </div>

          </div>

          {/* Educational Content & Article */}
          <section id="learn-more-section" className="py-16 border-t border-slate-200 dark:border-white/5 mt-16 pt-16">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest mb-4">
                <BookOpen className="w-4 h-4" />
                <span>HEIC Image Guide</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-4">
                📚 Everything You Need to Know About HEIC Photos
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
                Why Apple uses HEIC format and how in-browser WebAssembly conversion preserves your image quality and privacy.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">
                  📱 Why HEIC on iPhone?
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  Apple introduced HEIC (High Efficiency Image File Format) in iOS 11 to cut photo storage sizes in half compared to JPEG while preserving 16-bit color depth.
                </p>
              </div>

              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                  🌐 Universal Compatibility
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  While HEIC is great on Apple devices, Windows PCs, Android phones, and web portals often cannot open HEIC files. Converting to JPG/PNG solves all compatibility issues.
                </p>
              </div>

              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3">
                  🔒 Zero Cloud Risk
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  Unlike traditional online converters that upload your photos to unknown cloud servers, ToolWala AI processes 100% of your images locally in your browser memory.
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

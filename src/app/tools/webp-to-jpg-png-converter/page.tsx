"use client";

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileImage, 
  RotateCcw, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  ZoomIn, 
  Maximize2, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  Eye, 
  Archive,
  X,
  Layers,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import JSZip from 'jszip';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { formatBytes } from '@/lib/utils/format';

interface WebPFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  originalUrl: string;
  width: number;
  height: number;
  hasTransparency: boolean;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  convertedSize: number | null;
  status: 'idle' | 'converting' | 'completed' | 'error';
  errorMessage?: string;
}

export default function WebPConverterPage() {
  // Batch files state
  const [files, setFiles] = useState<WebPFileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Settings state
  const [outputFormat, setOutputFormat] = useState<'JPG' | 'PNG'>('JPG');
  const [jpgQuality, setJpgQuality] = useState<number>(95);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [customHexColor, setCustomHexColor] = useState<string>('#FFFFFF');
  const [preserveTransparency, setPreserveTransparency] = useState<boolean>(true);
  const [pngCompression, setPngCompression] = useState<'fast' | 'balanced' | 'best'>('balanced');

  // Transformations state (per active image or global)
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Progress & Modal states
  const [isConvertingAll, setIsConvertingAll] = useState<boolean>(false);
  const [convertProgress, setConvertProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState<boolean>(false);

  const handleDragOverUpload = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingOverUpload) setIsDraggingOverUpload(true);
  };

  const handleDragLeaveUpload = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOverUpload(false);
    }
  };

  const handleDropUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverUpload(false);
    if (e.dataTransfer.files) {
      handleFilesSelection(e.dataTransfer.files);
    }
  };

  // Zoom & Fullscreen Modal State
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [compareMode, setCompareMode] = useState<'split' | 'sideBySide'>('sideBySide');
  const [splitPos, setSplitPos] = useState<number>(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.originalUrl) URL.revokeObjectURL(f.originalUrl);
        if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
      });
    };
  }, [files]);

  // Transparency detector helper
  const detectTransparencyAndDimensions = (file: File, originalUrl: string): Promise<{ width: number; height: number; hasTransparency: boolean }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        
        const canvas = document.createElement('canvas');
        const sampleWidth = Math.min(width, 300);
        const sampleHeight = Math.min(height, 300);
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ width, height, hasTransparency: false });
          return;
        }
        
        ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
        const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
        
        let hasTransparency = false;
        // Check 4th byte (alpha channel)
        for (let i = 3; i < imgData.length; i += 16) {
          if (imgData[i] < 255) {
            hasTransparency = true;
            break;
          }
        }
        
        resolve({ width, height, hasTransparency });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0, hasTransparency: false });
      };
      img.src = originalUrl;
    });
  };

  // Add files to queue
  const handleFilesSelection = async (selectedFiles: FileList | File[]) => {
    const validWebPFiles: File[] = [];
    let oversizeCount = 0;
    let nonWebPCount = 0;

    Array.from(selectedFiles).forEach(file => {
      const isWebP = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
      const isUnder50MB = file.size <= 50 * 1024 * 1024;

      if (!isWebP) {
        nonWebPCount++;
      } else if (!isUnder50MB) {
        oversizeCount++;
      } else {
        validWebPFiles.push(file);
      }
    });

    if (nonWebPCount > 0 || oversizeCount > 0) {
      const msgs = [];
      if (nonWebPCount > 0) msgs.push(`${nonWebPCount} file(s) ignored (only .webp format accepted).`);
      if (oversizeCount > 0) msgs.push(`${oversizeCount} file(s) exceeded max size limit of 50 MB.`);
      setWarningMessage(msgs.join(' '));
    } else {
      setWarningMessage(null);
    }

    if (validWebPFiles.length === 0) return;

    const newItems: WebPFileItem[] = [];

    for (const file of validWebPFiles) {
      const originalUrl = URL.createObjectURL(file);
      const { width, height, hasTransparency } = await detectTransparencyAndDimensions(file, originalUrl);

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        originalUrl,
        width,
        height,
        hasTransparency,
        convertedBlob: null,
        convertedUrl: null,
        convertedSize: null,
        status: 'idle',
      });
    }

    setFiles(prev => {
      const updated = [...prev, ...newItems];
      if (!activeFileId && updated.length > 0) {
        setActiveFileId(updated[0].id);
      }
      return updated;
    });
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      const pastedFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            // Rename pasted file if needed
            const pastedFile = new File([blob], `pasted_image_${Date.now()}.webp`, { type: 'image/webp' });
            pastedFiles.push(pastedFile);
          }
        }
      }

      if (pastedFiles.length > 0) {
        handleFilesSelection(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeFileId]);

  // Core canvas conversion logic
  const renderCanvasConversion = (item: WebPFileItem): Promise<{ blob: Blob; url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const origW = img.naturalWidth || img.width || 1;
        const origH = img.naturalHeight || img.height || 1;

        const isRotated90 = (rotationAngle / 90) % 2 !== 0;
        const canvasW = Math.max(1, isRotated90 ? origH : origW);
        const canvasH = Math.max(1, isRotated90 ? origW : origH);

        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create 2D canvas context'));
          return;
        }

        // Handle Background Color when flattening transparency or converting to JPG
        const activeBg = bgColor === 'custom' ? customHexColor : bgColor;

        if (outputFormat === 'JPG') {
          ctx.fillStyle = activeBg;
          ctx.fillRect(0, 0, canvasW, canvasH);
        } else if (outputFormat === 'PNG' && !preserveTransparency) {
          ctx.fillStyle = activeBg;
          ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // Handle transforms
        ctx.save();
        ctx.translate(canvasW / 2, canvasH / 2);
        ctx.rotate((rotationAngle * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        ctx.drawImage(img, -origW / 2, -origH / 2);
        ctx.restore();

        const mimeType = outputFormat === 'JPG' ? 'image/jpeg' : 'image/png';
        
        if (outputFormat === 'JPG') {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            const url = URL.createObjectURL(blob);
            resolve({ blob, url, size: blob.size });
          }, mimeType, jpgQuality / 100);
        } else {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            const url = URL.createObjectURL(blob);
            resolve({ blob, url, size: blob.size });
          }, mimeType);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load WebP image into canvas'));
      };

      img.src = item.originalUrl;
    });
  };

  // Single file conversion trigger
  const processSingleFile = async (item: WebPFileItem) => {
    try {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'converting' } : f));
      
      const res = await renderCanvasConversion(item);
      
      setFiles(prev => prev.map(f => {
        if (f.id === item.id) {
          const oldUrl = f.convertedUrl;
          if (oldUrl) {
            setTimeout(() => URL.revokeObjectURL(oldUrl), 5000);
          }
          return {
            ...f,
            convertedBlob: res.blob,
            convertedUrl: res.url,
            convertedSize: res.size,
            status: 'completed',
          };
        }
        return f;
      }));
    } catch (err: any) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', errorMessage: err.message } : f));
    }
  };

  // Convert All queued files
  const handleConvertAll = async () => {
    if (files.length === 0) return;

    setIsConvertingAll(true);
    setConvertProgress({ current: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      setConvertProgress({ current: i + 1, total: files.length });
      await processSingleFile(files[i]);
    }

    setIsConvertingAll(false);
  };

  // Auto conversion on setting changes for active file
  const activeFile = files.find(f => f.id === activeFileId) || files[0] || null;

  useEffect(() => {
    if (activeFile && activeFile.status === 'idle') {
      processSingleFile(activeFile);
    }
  }, [activeFileId]);

  // Trigger re-conversion on active file when conversion settings or transforms change
  useEffect(() => {
    if (activeFile) {
      processSingleFile(activeFile);
    }
  }, [outputFormat, jpgQuality, bgColor, customHexColor, preserveTransparency, pngCompression, rotationAngle, flipH, flipV]);

  // Remove single file
  const removeFile = (id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item) {
        if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      }
      const filtered = prev.filter(f => f.id !== id);
      if (activeFileId === id) {
        setActiveFileId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  // Clear all files
  const clearAll = () => {
    files.forEach(f => {
      if (f.originalUrl) URL.revokeObjectURL(f.originalUrl);
      if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
    });
    setFiles([]);
    setActiveFileId(null);
    setWarningMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Individual Download
  const downloadSingle = (item: WebPFileItem) => {
    if (!item.convertedBlob && !item.convertedUrl) return;
    const ext = outputFormat.toLowerCase() === 'jpg' ? 'jpg' : 'png';
    const originalBaseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const fileName = `toolwala-${originalBaseName}.${ext}`;

    // Create fresh URL from Blob on user action to guarantee validity
    const tempUrl = item.convertedBlob 
      ? URL.createObjectURL(item.convertedBlob)
      : item.convertedUrl!;

    const a = document.createElement('a');
    a.href = tempUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Keep URL alive for 15s to allow browser download thread to complete
    if (item.convertedBlob) {
      setTimeout(() => {
        URL.revokeObjectURL(tempUrl);
      }, 15000);
    }
  };

  // ZIP Download for all converted files
  const downloadZip = async () => {
    const completedFiles = files.filter(f => f.convertedBlob !== null);
    if (completedFiles.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const ext = outputFormat.toLowerCase() === 'jpg' ? 'jpg' : 'png';

      completedFiles.forEach((item, index) => {
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || `image_${index + 1}`;
        const fileName = `toolwala-${baseName}.${ext}`;
        if (item.convertedBlob) {
          zip.file(fileName, item.convertedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `toolwala-converted-images.zip`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        URL.revokeObjectURL(zipUrl);
      }, 15000);
    } catch (err) {
      console.error('Error generating ZIP:', err);
      alert('Error creating ZIP archive. Please try downloading files individually.');
    } finally {
      setIsZipping(false);
    }
  };

  // Reset transforms
  const resetTransforms = () => {
    setRotationAngle(0);
    setFlipH(false);
    setFlipV(false);
  };

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-20 text-slate-900 dark:text-gray-100 relative overflow-hidden transition-colors duration-250 font-sans">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Navigation Breadcrumb */}
        <Link 
          href="/tools" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Directory
        </Link>

        {/* Main Header Card */}
        <div className="glass rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl mb-8">
          <div className="p-8 sm:p-10 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                  <FileImage className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    WebP to JPG / PNG Converter
                  </h1>
                  <p className="text-slate-600 dark:text-gray-400 text-sm font-medium mt-1">
                    Convert WebP images into JPG or PNG instantly with high quality. Fast, secure, and completely browser-based.
                  </p>
                </div>
              </div>

              {/* Privacy Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-100 dark:bg-white/5 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/5">
                  <Lock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span>100% Browser</span>
                </div>
                <div className="bg-slate-100 dark:bg-white/5 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>No Server Upload</span>
                </div>
                <div className="bg-slate-100 dark:bg-white/5 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Lossless Quality</span>
                </div>
                <div className="bg-slate-100 dark:bg-white/5 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Privacy First</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-6 sm:p-10">
            {warningMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-300 text-sm flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{warningMessage}</span>
                </div>
                <button onClick={() => setWarningMessage(null)} className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload Zone when queue is empty */}
            {files.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOverUpload}
                onDragLeave={handleDragLeaveUpload}
                onDrop={handleDropUpload}
                className={`group relative border-2 border-dashed rounded-[2.5rem] p-12 sm:p-20 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
                  isDraggingOverUpload
                    ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/15 scale-[1.015] shadow-[0_0_50px_rgba(59,130,246,0.35)] ring-4 ring-blue-500/30'
                    : 'border-white/10 hover:border-blue-500/50 hover:bg-white/[0.02]'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files && handleFilesSelection(e.target.files)} 
                  accept="image/webp" 
                  multiple 
                  className="hidden" 
                />

                <div className="relative z-10 max-w-lg mx-auto">
                  <div className={`mx-auto h-20 w-20 rounded-[1.5rem] flex items-center justify-center mb-6 border transition-all duration-300 ${
                    isDraggingOverUpload
                      ? 'bg-blue-500 text-white border-blue-400 scale-125 shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-bounce'
                      : 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:scale-110 shadow-2xl'
                  }`}>
                    <Upload className="w-10 h-10" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight transition-colors">
                    {isDraggingOverUpload ? 'Drop WebP Files Right Here!' : 'Drop your WebP image here or click to browse'}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    {isDraggingOverUpload ? 'Release your file now to start conversion immediately.' : 'Supports .webp files up to 50 MB per image. Multiple files & paste (Ctrl + V) supported.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button className={`rounded-2xl px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all pointer-events-none ${
                      isDraggingOverUpload
                        ? 'bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)] scale-105'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_25px_rgba(37,99,235,0.4)]'
                    }`}>
                      {isDraggingOverUpload ? 'Release To Convert' : 'Select WebP Files'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Converter Interface */
              <div className="space-y-8">
                
                {/* Top Actions & Queue Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-light border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                      {files.length} {files.length === 1 ? 'Image' : 'Images'} Queued
                    </span>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Add More
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => e.target.files && handleFilesSelection(e.target.files)} 
                      accept="image/webp" 
                      multiple 
                      className="hidden" 
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleConvertAll}
                      disabled={isConvertingAll}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-black uppercase tracking-wider text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isConvertingAll ? 'animate-spin' : ''}`} />
                      <span>{isConvertingAll ? 'Converting...' : 'Convert All'}</span>
                    </button>

                    <button 
                      onClick={downloadZip}
                      disabled={isZipping || !files.some(f => f.convertedBlob !== null)}
                      className="px-4 py-2.5 rounded-xl glass-light border border-white/10 text-xs font-bold text-gray-200 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 disabled:opacity-40"
                    >
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isZipping ? 'Zipping...' : 'Download ZIP'}</span>
                    </button>

                    <button 
                      onClick={clearAll}
                      className="px-3.5 py-2.5 rounded-xl glass-light border border-white/5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar when converting all */}
                {isConvertingAll && (
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${(convertProgress.current / convertProgress.total) * 100}%` }}
                    />
                  </div>
                )}

                {/* Grid Layout: Settings & Live Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Settings Panel & Batch List (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Settings Box */}
                    <div className="glass rounded-2xl p-6 border border-white/10 space-y-6">
                      <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-400" />
                        Output Settings
                      </h3>

                      {/* Output Format Selector */}
                      <div>
                        <label className="text-xs font-bold text-gray-300 block mb-2 uppercase tracking-wider">
                          Target Format
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setOutputFormat('JPG')}
                            className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                              outputFormat === 'JPG'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            Convert to JPG
                          </button>
                          <button
                            onClick={() => setOutputFormat('PNG')}
                            className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                              outputFormat === 'PNG'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            Convert to PNG
                          </button>
                        </div>
                      </div>

                      {/* JPG Specific Settings */}
                      {outputFormat === 'JPG' && (
                        <div className="space-y-5 pt-2 border-t border-white/5">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                                Quality Slider: {jpgQuality}%
                              </label>
                              <span className="text-[10px] text-gray-500 font-semibold">
                                {jpgQuality > 85 ? 'High Quality' : jpgQuality > 50 ? 'Balanced' : 'Small Size'}
                              </span>
                            </div>
                            <input 
                              type="range" 
                              min="10" 
                              max="100" 
                              value={jpgQuality} 
                              onChange={(e) => setJpgQuality(Number(e.target.value))}
                              className="w-full accent-blue-500 bg-white/10 h-2 rounded-lg cursor-pointer" 
                            />
                          </div>

                          {/* Background Color selector for JPG */}
                          <div>
                            <label className="text-xs font-bold text-gray-300 block mb-2 uppercase tracking-wider">
                              Background Color (for transparent WebP)
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setBgColor('#FFFFFF')}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                                  bgColor === '#FFFFFF' ? 'bg-white text-gray-900 border-blue-500 ring-2 ring-blue-500/30' : 'bg-white/5 text-gray-300 border-white/10'
                                }`}
                              >
                                <span className="w-3.5 h-3.5 rounded-full bg-white border border-gray-400" />
                                White
                              </button>

                              <button
                                onClick={() => setBgColor('#000000')}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                                  bgColor === '#000000' ? 'bg-gray-900 text-white border-blue-500 ring-2 ring-blue-500/30' : 'bg-white/5 text-gray-300 border-white/10'
                                }`}
                              >
                                <span className="w-3.5 h-3.5 rounded-full bg-black border border-gray-600" />
                                Black
                              </button>

                              <label 
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  bgColor === 'custom' ? 'bg-blue-600/20 text-blue-300 border-blue-500' : 'bg-white/5 text-gray-300 border-white/10'
                                }`}
                              >
                                <input 
                                  type="color" 
                                  value={customHexColor} 
                                  onChange={(e) => {
                                    setCustomHexColor(e.target.value);
                                    setBgColor('custom');
                                  }} 
                                  className="w-4 h-4 rounded cursor-pointer bg-transparent border-0" 
                                />
                                Custom
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PNG Specific Settings */}
                      {outputFormat === 'PNG' && (
                        <div className="space-y-5 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-xs font-bold text-gray-200 block">
                                Preserve Transparency
                              </label>
                              <span className="text-[10px] text-gray-400">Maintain alpha channel if WebP has transparent background</span>
                            </div>
                            <button
                              onClick={() => setPreserveTransparency(!preserveTransparency)}
                              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                                preserveTransparency ? 'bg-blue-600' : 'bg-white/10'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                preserveTransparency ? 'translate-x-6' : 'translate-x-0'
                              }`} />
                            </button>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-300 block mb-2 uppercase tracking-wider">
                              Compression Level
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {(['fast', 'balanced', 'best'] as const).map((level) => (
                                <button
                                  key={level}
                                  onClick={() => setPngCompression(level)}
                                  className={`py-2 px-2 rounded-lg text-[11px] font-bold uppercase transition-all border ${
                                    pngCompression === level 
                                      ? 'bg-blue-600/20 text-blue-400 border-blue-500' 
                                      : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rotation & Flip Controls */}
                      <div className="pt-4 border-t border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                            Transform Image
                          </label>
                          <button 
                            onClick={resetTransforms}
                            className="text-[10px] text-gray-400 hover:text-blue-400 flex items-center gap-1 font-bold"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Reset
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <button 
                            onClick={() => setRotationAngle((prev) => (prev - 90) % 360)}
                            className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                            title="Rotate Left 90°"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setRotationAngle((prev) => (prev + 90) % 360)}
                            className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                            title="Rotate Right 90°"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setFlipH(!flipH)}
                            className={`py-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                              flipH ? 'bg-blue-600/20 text-blue-400 border-blue-500' : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10'
                            }`}
                            title="Flip Horizontal"
                          >
                            <FlipHorizontal className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setFlipV(!flipV)}
                            className={`py-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                              flipV ? 'bg-blue-600/20 text-blue-400 border-blue-500' : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10'
                            }`}
                            title="Flip Vertical"
                          >
                            <FlipVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Batch File Queue List */}
                    <div className="glass rounded-2xl p-5 border border-white/10 space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                        Queued Files ({files.length})
                      </h4>

                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {files.map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => setActiveFileId(item.id)}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              activeFileId === item.id 
                                ? 'bg-blue-600/10 border-blue-500/50 shadow-md' 
                                : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 relative">
                                <img src={item.originalUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-bold text-gray-200 truncate">{item.name}</p>
                                <p className="text-[10px] text-gray-400">
                                  {formatBytes(item.size)} • {item.width}x{item.height} • {item.hasTransparency ? 'Transparent' : 'Opaque'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {item.status === 'completed' && item.convertedSize && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {formatBytes(item.convertedSize)}
                                </span>
                              )}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(item.id);
                                }}
                                className="text-gray-500 hover:text-rose-400 p-1 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Preview & Inspection (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    {activeFile ? (
                      <div className="glass rounded-2xl p-6 border border-white/10 space-y-6 relative">
                        
                        {/* Live Preview Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                          <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                              <Eye className="w-4 h-4 text-blue-400" />
                              Live Preview
                            </h3>
                            <p className="text-xs text-gray-400 truncate max-w-sm mt-0.5">{activeFile.name}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Mode Toggle */}
                            <button
                              onClick={() => setCompareMode(compareMode === 'sideBySide' ? 'split' : 'sideBySide')}
                              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 border border-white/5 transition-colors flex items-center gap-1.5"
                            >
                              <Layers className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{compareMode === 'sideBySide' ? 'Split Compare' : 'Side by Side'}</span>
                            </button>

                            {/* Zoom & Fullscreen */}
                            <button 
                              onClick={() => setIsFullscreenModalOpen(true)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-colors"
                              title="Zoom & Fullscreen Preview"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>

                            {/* Download Active File */}
                            <button 
                              onClick={() => downloadSingle(activeFile)}
                              disabled={!activeFile.convertedUrl}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-black uppercase tracking-wider text-white transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>

                        {/* Image Metadata Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">Original Format</span>
                            <span className="text-xs font-black text-blue-400">WebP</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">Resolution</span>
                            <span className="text-xs font-black text-white">{activeFile.width} x {activeFile.height}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">Original Size</span>
                            <span className="text-xs font-black text-gray-300">{formatBytes(activeFile.size)}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">Converted Size</span>
                            <span className="text-xs font-black text-emerald-400">
                              {activeFile.convertedSize ? formatBytes(activeFile.convertedSize) : 'Calculating...'}
                            </span>
                          </div>
                        </div>

                        {/* Preview Display Screen */}
                        {compareMode === 'sideBySide' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Original WebP */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <span className="text-xs font-bold text-gray-400 uppercase">Original WebP</span>
                                <span className="text-[10px] text-gray-500 font-semibold">{activeFile.hasTransparency ? 'Transparency Detected' : 'No Transparency'}</span>
                              </div>
                              <div className="h-64 sm:h-80 rounded-2xl border border-white/10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-black/40 flex items-center justify-center overflow-hidden p-3 relative">
                                <img 
                                  src={activeFile.originalUrl} 
                                  alt="Original WebP" 
                                  className="max-h-full max-w-full object-contain transition-transform"
                                  style={{
                                    transform: `rotate(${rotationAngle}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
                                  }}
                                />
                              </div>
                            </div>

                            {/* Converted Output Preview */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <span className="text-xs font-bold text-emerald-400 uppercase">
                                  Converted {outputFormat}
                                </span>
                                {activeFile.convertedSize && (
                                  <span className="text-[10px] font-bold text-gray-400">
                                    {((activeFile.convertedSize - activeFile.size) / activeFile.size * 100).toFixed(1)}% size change
                                  </span>
                                )}
                              </div>
                              <div className="h-64 sm:h-80 rounded-2xl border border-white/10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-black/40 flex items-center justify-center overflow-hidden p-3 relative">
                                {activeFile.convertedUrl ? (
                                  <img 
                                    src={activeFile.convertedUrl} 
                                    alt="Converted Preview" 
                                    className="max-h-full max-w-full object-contain"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                                    <span className="text-xs font-bold">Rendering preview...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Interactive Split Comparison Mode */
                          <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                              <span className="text-xs font-bold text-blue-400 uppercase">Original WebP vs Converted {outputFormat}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">Drag slider to compare</span>
                            </div>
                            <div 
                              className="h-80 rounded-2xl border border-white/10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-black/40 relative overflow-hidden select-none"
                              onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                                setSplitPos((x / rect.width) * 100);
                              }}
                            >
                              {/* Converted Background Layer */}
                              {activeFile.convertedUrl && (
                                <img 
                                  src={activeFile.convertedUrl} 
                                  alt="Converted Layer" 
                                  className="absolute inset-0 w-full h-full object-contain p-4" 
                                />
                              )}

                              {/* Original Foreground Layer clipped */}
                              <div 
                                className="absolute inset-0 overflow-hidden border-r-2 border-blue-500 shadow-2xl"
                                style={{ width: `${splitPos}%` }}
                              >
                                <img 
                                  src={activeFile.originalUrl} 
                                  alt="Original Layer" 
                                  className="absolute inset-0 w-full h-full object-contain p-4 max-w-none"
                                  style={{
                                    width: '100%',
                                    transform: `rotate(${rotationAngle}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
                                  }} 
                                />
                              </div>

                              {/* Split Divider Knob */}
                              <div 
                                className="absolute top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] cursor-ew-resize flex items-center justify-center"
                                style={{ left: `${splitPos}%` }}
                              >
                                <div className="w-7 h-7 rounded-full bg-blue-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-xs font-black">
                                  ↔
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bottom Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5 text-blue-400" />
                            Add Another WebP Image
                          </button>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => downloadSingle(activeFile)}
                              disabled={!activeFile.convertedUrl}
                              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-black uppercase tracking-wider text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download {outputFormat}
                            </button>
                          </div>
                        </div>

                      </div>
                    ) : null}
                  </div>

                </div>

              </div>
            )}
          </div>
        </div>

        {/* Fullscreen & Zoom Modal */}
        <AnimatePresence>
          {isFullscreenModalOpen && activeFile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4 sm:p-8"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-white uppercase tracking-wider">{activeFile.name}</span>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                    Zoom: {zoomLevel}%
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Zoom controls */}
                  <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button 
                      onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
                      className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold px-2">{zoomLevel}%</span>
                    <button 
                      onClick={() => setZoomLevel((z) => Math.min(400, z + 25))}
                      className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => setZoomLevel(100)}
                      className="text-[10px] text-gray-400 hover:text-blue-400 font-bold px-2"
                    >
                      Reset Zoom
                    </button>
                  </div>

                  <button 
                    onClick={() => setIsFullscreenModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Canvas Viewport */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                <div 
                  className="transition-transform duration-150 ease-out max-w-full max-h-full"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                  <img 
                    src={activeFile.convertedUrl || activeFile.originalUrl} 
                    alt="Full View" 
                    className="max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO Article Section */}
        <div className="mt-16">
          <ToolArticle {...toolArticles['webp-to-jpg-png-converter']} />
        </div>

      </div>
    </div>
  );
}

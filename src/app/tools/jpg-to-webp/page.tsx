"use client";

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Upload, 
  Download, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  Archive,
  X,
  Sparkles,
  Info,
  SlidersHorizontal,
  AlertCircle,
  FileUp
} from 'lucide-react';
import JSZip from 'jszip';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { formatBytes } from '@/lib/utils/format';

interface QualityPreset {
  id: string;
  name: string;
  stars: string;
  quality: number;
  badge: string;
  description: string;
}

const QUALITY_PRESETS: QualityPreset[] = [
  {
    id: 'max',
    name: 'Maximum Quality',
    stars: '⭐',
    quality: 95,
    badge: '95%',
    description: 'Largest file • Best for photography'
  },
  {
    id: 'balanced',
    name: 'Balanced',
    stars: '⭐⭐',
    quality: 80,
    badge: '80%',
    description: 'Recommended • Best quality/size ratio'
  },
  {
    id: 'small',
    name: 'Small Size',
    stars: '⭐⭐⭐',
    quality: 65,
    badge: '65%',
    description: 'Smaller file • Great for websites'
  },
  {
    id: 'ultra',
    name: 'Ultra Compression',
    stars: '⭐⭐⭐⭐',
    quality: 40,
    badge: '40%',
    description: 'Smallest file • Web delivery'
  }
];

interface JPGFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  originalUrl: string;
  width: number;
  height: number;
  aspectRatio: string;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  convertedSize: number | null;
  status: 'idle' | 'converting' | 'completed' | 'error';
  errorMessage?: string;
}

// Calculate Greatest Common Divisor for Aspect Ratio
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function calculateAspectRatio(w: number, h: number): string {
  if (!w || !h) return 'N/A';
  const divisor = gcd(w, h);
  const rw = w / divisor;
  const rh = h / divisor;
  if (rw > 32 || rh > 32) {
    const ratio = (w / h).toFixed(2);
    return `${ratio}:1`;
  }
  return `${rw}:${rh}`;
}

export default function JPGToWebPConverterPage() {
  // Batch files state
  const [files, setFiles] = useState<JPGFileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Compression Quality Settings
  const [jpgQuality, setJpgQuality] = useState<number>(80);

  // Advanced Options State
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(true);
  const [keepOriginalResolution, setKeepOriginalResolution] = useState<boolean>(true);
  const [resizeWidth, setResizeWidth] = useState<number | ''>('');
  const [resizeHeight, setResizeHeight] = useState<number | ''>('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);

  // Progress & UI States
  const [isConvertingAll, setIsConvertingAll] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Converting...');
  const [convertProgress, setConvertProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [errorCards, setErrorCards] = useState<{ id: string; name: string; reason: string }[]>([]);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.originalUrl) URL.revokeObjectURL(f.originalUrl);
        if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
      });
    };
  }, [files]);

  // Helper to load image metadata (width, height, aspect ratio)
  const getJpgDimensions = (originalUrl: string): Promise<{ width: number; height: number; aspectRatio: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const aspectRatio = calculateAspectRatio(width, height);
        resolve({ width, height, aspectRatio });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image. The file may be corrupted or invalid.'));
      };
      img.src = originalUrl;
    });
  };

  // Add files to queue with strict format & size validation
  const handleFilesSelection = useCallback(async (selectedFiles: FileList | File[]) => {
    const validJpgFiles: File[] = [];
    const newErrorCards: { id: string; name: string; reason: string }[] = [];
    let oversizeCount = 0;
    let nonJpgCount = 0;

    const filesArray = Array.from(selectedFiles);

    for (const file of filesArray) {
      const isJpg = file.type === 'image/jpeg' || 
                    file.type === 'image/jpg' || 
                    file.name.toLowerCase().endsWith('.jpg') || 
                    file.name.toLowerCase().endsWith('.jpeg');
      
      const isUnder50MB = file.size <= 50 * 1024 * 1024;

      if (!isJpg) {
        nonJpgCount++;
        newErrorCards.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          reason: 'Unsupported file type. Only .JPG and .JPEG files are supported.'
        });
      } else if (!isUnder50MB) {
        oversizeCount++;
        newErrorCards.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          reason: 'File size exceeds maximum limit of 50 MB.'
        });
      } else {
        validJpgFiles.push(file);
      }
    }

    if (newErrorCards.length > 0) {
      setErrorCards(prev => [...prev, ...newErrorCards]);
    }

    if (nonJpgCount > 0 || oversizeCount > 0) {
      const msgs = [];
      if (nonJpgCount > 0) msgs.push(`${nonJpgCount} file(s) skipped (only JPG/JPEG supported).`);
      if (oversizeCount > 0) msgs.push(`${oversizeCount} file(s) exceeded 50 MB limit.`);
      setWarningMessage(msgs.join(' '));
    } else {
      setWarningMessage(null);
    }

    if (validJpgFiles.length === 0) return;

    const newItems: JPGFileItem[] = [];

    for (const file of validJpgFiles) {
      const originalUrl = URL.createObjectURL(file);
      try {
        const { width, height, aspectRatio } = await getJpgDimensions(originalUrl);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          size: file.size,
          originalUrl,
          width,
          height,
          aspectRatio,
          convertedBlob: null,
          convertedUrl: null,
          convertedSize: null,
          status: 'idle',
        });
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : 'Corrupted or unreadable image file.';
        setErrorCards(prev => [...prev, {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          reason: errMessage
        }]);
      }
    }

    setFiles(prev => {
      const updated = [...prev, ...newItems];
      if (!activeFileId && updated.length > 0) {
        setActiveFileId(updated[0].id);
      }
      return updated;
    });
  }, [activeFileId]);

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
            const pastedFile = new File([blob], `pasted_image_${Date.now()}.jpg`, { type: 'image/jpeg' });
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
  }, [handleFilesSelection]);

  // Core WebP Conversion via Canvas API
  const renderWebPConversion = useCallback((item: JPGFileItem): Promise<{ blob: Blob; url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const origW = img.naturalWidth || img.width || 1;
        const origH = img.naturalHeight || img.height || 1;

        let targetW = origW;
        let targetH = origH;

        if (!keepOriginalResolution) {
          const customW = typeof resizeWidth === 'number' && resizeWidth > 0 ? resizeWidth : null;
          const customH = typeof resizeHeight === 'number' && resizeHeight > 0 ? resizeHeight : null;

          if (customW && customH && !maintainAspectRatio) {
            targetW = customW;
            targetH = customH;
          } else if (customW && maintainAspectRatio) {
            targetW = customW;
            targetH = Math.round((origH / origW) * customW);
          } else if (customH && maintainAspectRatio) {
            targetH = customH;
            targetW = Math.round((origW / origH) * customH);
          } else if (customW) {
            targetW = customW;
          } else if (customH) {
            targetH = customH;
          }
        }

        targetW = Math.max(1, targetW);
        targetH = Math.max(1, targetH);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Browser failed to initialize 2D canvas context. Memory limit reached.'));
          return;
        }

        // Draw image onto canvas (Canvas naturally strips EXIF metadata if removeMetadata is true)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const qualityFraction = Math.min(1.0, Math.max(0.01, jpgQuality / 100));

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('WebP encoding failed. Your browser may lack WebP canvas support.'));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve({ blob, url, size: blob.size });
        }, 'image/webp', qualityFraction);
      };

      img.onerror = () => {
        reject(new Error('Failed to render JPG image into canvas.'));
      };

      img.src = item.originalUrl;
    });
  }, [jpgQuality, keepOriginalResolution, resizeWidth, resizeHeight, maintainAspectRatio]);

  // Process a single file in the queue
  const processSingleFile = useCallback(async (item: JPGFileItem) => {
    try {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'converting' } : f));
      
      const res = await renderWebPConversion(item);
      
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
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'Unknown canvas conversion error';
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', errorMessage: errMessage } : f));
    }
  }, [renderWebPConversion]);

  // Convert all files sequentially with animated loading text
  const handleConvertAll = async () => {
    if (files.length === 0) return;

    setIsConvertingAll(true);
    setConvertProgress({ current: 0, total: files.length });

    const loadingStages = ['Converting...', 'Optimizing...', 'Creating WebP...'];

    for (let i = 0; i < files.length; i++) {
      setConvertProgress({ current: i + 1, total: files.length });
      setLoadingText(loadingStages[i % loadingStages.length]);
      await processSingleFile(files[i]);
    }

    setIsConvertingAll(false);
    toast.success('All images successfully converted to WebP!');
  };

  // Active file reference
  const activeFile = useMemo(() => {
    return files.find(f => f.id === activeFileId) || files[0] || null;
  }, [files, activeFileId]);

  // Automatically trigger conversion when active file is idle
  useEffect(() => {
    let isMounted = true;
    if (activeFile && activeFile.status === 'idle') {
      Promise.resolve().then(() => {
        if (isMounted) processSingleFile(activeFile);
      });
    }
    return () => { isMounted = false; };
  }, [activeFile, processSingleFile]);

  // Re-run conversion when quality or resolution settings change
  useEffect(() => {
    let isMounted = true;
    if (activeFile && activeFile.status === 'completed') {
      Promise.resolve().then(() => {
        if (isMounted) processSingleFile(activeFile);
      });
    }
    return () => { isMounted = false; };
  }, [jpgQuality, keepOriginalResolution, resizeWidth, resizeHeight, maintainAspectRatio, removeMetadata, processSingleFile, activeFile]);

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
    setErrorCards([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Individual WebP Download
  const downloadSingle = (item: JPGFileItem) => {
    if (!item.convertedBlob && !item.convertedUrl) return;
    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const fileName = `toolwala-${baseName}.webp`;

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

    if (item.convertedBlob) {
      setTimeout(() => {
        URL.revokeObjectURL(tempUrl);
      }, 15000);
    }
    toast.success(`Downloaded ${fileName}`);
  };

  // Download all converted WebP files as ZIP
  const downloadZip = async () => {
    const completedFiles = files.filter(f => f.convertedBlob !== null);
    if (completedFiles.length === 0) {
      toast.error('No converted WebP images available for download.');
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();

      completedFiles.forEach((item, index) => {
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || `image_${index + 1}`;
        const fileName = `toolwala-${baseName}.webp`;
        if (item.convertedBlob) {
          zip.file(fileName, item.convertedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `toolwala-webp-images.zip`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        URL.revokeObjectURL(zipUrl);
      }, 15000);

      toast.success('ZIP package created and downloaded!');
    } catch (err) {
      console.error('ZIP generation error:', err);
      toast.error('Failed to build ZIP file. Try downloading files individually.');
    } finally {
      setIsZipping(false);
    }
  };

  // Reduction percentage calculation helper
  const getReductionPercent = (origSize: number, newSize: number | null): number => {
    if (!newSize || origSize === 0) return 0;
    const diff = origSize - newSize;
    const pct = Math.round((diff / origSize) * 100);
    return pct > 0 ? pct : 0;
  };

  // Handle aspect ratio input calculations
  const handleWidthChange = (val: string) => {
    const num = val === '' ? '' : parseInt(val, 10);
    setResizeWidth(num);

    if (activeFile && maintainAspectRatio && typeof num === 'number' && activeFile.width > 0) {
      const calculatedHeight = Math.round((activeFile.height / activeFile.width) * num);
      setResizeHeight(calculatedHeight);
    }
  };

  const handleHeightChange = (val: string) => {
    const num = val === '' ? '' : parseInt(val, 10);
    setResizeHeight(num);

    if (activeFile && maintainAspectRatio && typeof num === 'number' && activeFile.height > 0) {
      const calculatedWidth = Math.round((activeFile.width / activeFile.height) * num);
      setResizeWidth(calculatedWidth);
    }
  };

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-16 sm:py-20 text-slate-900 dark:text-gray-100 relative overflow-hidden transition-colors duration-250 font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-600/15 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Navigation Breadcrumb */}
        <Link 
          href="/tools" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-400 transition-colors mb-8 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Directory
        </Link>

        {/* Main Header Card */}
        <div className="glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl mb-8">
          <div className="p-8 sm:p-10 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    Free JPG to WebP Converter
                  </h1>
                  <p className="text-slate-600 dark:text-gray-400 text-sm font-medium mt-1">
                    Convert single or batch JPG / JPEG images to modern high-quality WebP format directly in your browser.
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
                  <span>Fast Conversion</span>
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

            {/* Error Cards Display */}
            {errorCards.length > 0 && (
              <div className="mb-6 space-y-3">
                {errorCards.map(err => (
                  <div key={err.id} className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-900 dark:text-rose-200 text-sm flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                      <div>
                        <strong className="font-bold text-rose-950 dark:text-rose-100">{err.name}: </strong>
                        <span className="text-rose-900 dark:text-rose-200">{err.reason}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setErrorCards(prev => prev.filter(c => c.id !== err.id))}
                      className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 p-1 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty Upload State */}
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
                  accept="image/jpeg,image/jpg,.jpg,.jpeg" 
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
                  
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight transition-colors">
                    {isDraggingOverUpload ? 'Drop JPG Images Right Here!' : 'Drop your JPG images here or click to browse'}
                  </h2>
                  
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    {isDraggingOverUpload ? 'Release your file now to start WebP conversion immediately.' : 'Supports JPG & JPEG files up to 50 MB each. Batch uploads & paste (Ctrl + V) supported.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button className={`rounded-2xl px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all pointer-events-none ${
                      isDraggingOverUpload
                        ? 'bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)] scale-105'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_25px_rgba(37,99,235,0.4)]'
                    }`}>
                      {isDraggingOverUpload ? 'Release To Convert' : 'Browse Files'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Converter Interface */
              <div className="space-y-8">
                
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-light border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                      {files.length} {files.length === 1 ? 'Image' : 'Images'} Loaded
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
                      accept="image/jpeg,image/jpg,.jpg,.jpeg" 
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
                      <span>{isConvertingAll ? loadingText : 'Convert All to WebP'}</span>
                    </button>

                    <button 
                      onClick={downloadZip}
                      disabled={isZipping || !files.some(f => f.convertedBlob !== null)}
                      className="px-4 py-2.5 rounded-xl glass-light border border-white/10 text-xs font-bold text-gray-200 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 disabled:opacity-40"
                    >
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isZipping ? 'Creating ZIP...' : 'Download ZIP'}</span>
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

                {/* Batch Progress Bar */}
                {isConvertingAll && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400 font-semibold">
                      <span>{loadingText}</span>
                      <span>{convertProgress.current} / {convertProgress.total}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full transition-all duration-300"
                        style={{ width: `${(convertProgress.current / convertProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Workspace Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Settings & Queue List (5 Cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Quality Presets & Slider */}
                    <div className="glass rounded-2xl p-6 border border-white/10 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-blue-400" />
                          Quality Options
                        </h3>
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                          {jpgQuality}% WebP
                        </span>
                      </div>

                      {/* 4 Quality Presets */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {QUALITY_PRESETS.map((preset) => {
                          const isSelected = jpgQuality === preset.quality;
                          return (
                            <button
                              key={preset.id}
                              onClick={() => setJpgQuality(preset.quality)}
                              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                                isSelected 
                                  ? 'bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/30' 
                                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-white flex items-center gap-1">
                                  <span>{preset.stars}</span>
                                  <span>{preset.name}</span>
                                </span>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'
                                }`}>
                                  {preset.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 leading-tight">
                                {preset.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Quality Slider */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                            Custom Quality Slider
                          </label>
                          <span className="text-[11px] text-gray-400 font-semibold">
                            {jpgQuality >= 90 ? 'Maximum Quality' : jpgQuality >= 75 ? 'Balanced' : jpgQuality >= 55 ? 'Small Size' : 'Ultra Compression'}
                          </span>
                        </div>

                        <input 
                          type="range" 
                          min="40" 
                          max="100" 
                          value={jpgQuality} 
                          onChange={(e) => setJpgQuality(Number(e.target.value))}
                          className="w-full accent-blue-500 bg-white/10 h-2 rounded-lg cursor-pointer" 
                        />

                        <div className="flex justify-between text-[10px] text-gray-500 font-semibold px-1">
                          <span>40% (Smallest)</span>
                          <span>70%</span>
                          <span>100% (Best)</span>
                        </div>
                      </div>

                      {/* Advanced Options Accordion */}
                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                          Advanced Settings
                        </h4>

                        {/* Metadata Control */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                          <div>
                            <label className="text-xs font-bold text-gray-200 block">
                              Strip EXIF Metadata
                            </label>
                            <span className="text-[10px] text-gray-400 block">Remove camera &amp; location privacy data</span>
                          </div>
                          <button
                            onClick={() => setRemoveMetadata(!removeMetadata)}
                            className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                              removeMetadata ? 'bg-blue-600' : 'bg-white/10'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              removeMetadata ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>

                        {/* Resolution Mode */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-300">
                              Resolution Output
                            </label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setKeepOriginalResolution(true)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                                  keepOriginalResolution ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'
                                }`}
                              >
                                Keep Original
                              </button>
                              <button
                                onClick={() => setKeepOriginalResolution(false)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                                  !keepOriginalResolution ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'
                                }`}
                              >
                                Custom Resize
                              </button>
                            </div>
                          </div>

                          {!keepOriginalResolution && (
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                                    Width (px)
                                  </label>
                                  <input 
                                    type="number"
                                    placeholder={activeFile ? String(activeFile.width) : '1920'}
                                    value={resizeWidth}
                                    onChange={(e) => handleWidthChange(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                                    Height (px)
                                  </label>
                                  <input 
                                    type="number"
                                    placeholder={activeFile ? String(activeFile.height) : '1080'}
                                    value={resizeHeight}
                                    onChange={(e) => handleHeightChange(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                              </div>

                              <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input 
                                  type="checkbox"
                                  checked={maintainAspectRatio}
                                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                                  className="accent-blue-500 rounded"
                                />
                                <span className="text-xs text-gray-300 font-semibold">
                                  Maintain Aspect Ratio ({activeFile ? activeFile.aspectRatio : 'Auto'})
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Image Batch List Queue */}
                    <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">
                        Queued Images ({files.length})
                      </h4>

                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {files.map((item) => {
                          const isActive = activeFileId === item.id;
                          return (
                            <div 
                              key={item.id}
                              onClick={() => setActiveFileId(item.id)}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                isActive 
                                  ? 'bg-blue-600/15 border-blue-500' 
                                  : 'bg-white/5 border-white/5 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img 
                                  src={item.originalUrl} 
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-white/10 flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate max-w-[180px]">
                                    {item.name}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {formatBytes(item.size)} • {item.width}×{item.height}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {item.status === 'converting' && (
                                  <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                                )}
                                {item.status === 'completed' && (
                                  <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                                    {getReductionPercent(item.size, item.convertedSize)}% Smaller
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(item.id);
                                  }}
                                  className="p-1 text-gray-500 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Active Preview & Result Card (7 Cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    {activeFile ? (
                      <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
                        
                        {/* Status Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-3 w-3 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                              Conversion Successful
                            </span>
                          </div>

                          <span className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                            Target: WebP
                          </span>
                        </div>

                        {/* Image Preview Container */}
                        <div className="relative rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center min-h-[300px] max-h-[450px]">
                          <img 
                            src={activeFile.convertedUrl || activeFile.originalUrl} 
                            alt={activeFile.name}
                            className="max-h-[420px] w-auto object-contain p-4 rounded-xl"
                          />
                        </div>

                        {/* Comparison Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          
                          {/* Original Size */}
                          <div className="p-3.5 rounded-xl glass-light border border-white/5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Original Size
                            </span>
                            <span className="text-sm font-black text-white mt-1 block">
                              {formatBytes(activeFile.size)}
                            </span>
                            <span className="text-[10px] text-gray-500 font-semibold">JPG Format</span>
                          </div>

                          {/* Converted Size */}
                          <div className="p-3.5 rounded-xl glass-light border border-white/5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Converted Size
                            </span>
                            <span className="text-sm font-black text-emerald-400 mt-1 block">
                              {activeFile.convertedSize ? formatBytes(activeFile.convertedSize) : 'Calculating...'}
                            </span>
                            <span className="text-[10px] text-emerald-400/80 font-semibold">WebP Format</span>
                          </div>

                          {/* Reduction Percentage */}
                          <div className="p-3.5 rounded-xl bg-blue-600/10 border border-blue-500/20">
                            <span className="text-[10px] font-bold text-blue-300 uppercase block">
                              Size Reduction
                            </span>
                            <span className="text-sm font-black text-blue-400 mt-1 block">
                              {getReductionPercent(activeFile.size, activeFile.convertedSize)}% Smaller
                            </span>
                            <span className="text-[10px] text-blue-300/80 font-semibold">Saved Space</span>
                          </div>

                          {/* Resolution */}
                          <div className="p-3.5 rounded-xl glass-light border border-white/5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Resolution
                            </span>
                            <span className="text-sm font-black text-white mt-1 block truncate">
                              {activeFile.width} × {activeFile.height}
                            </span>
                            <span className="text-[10px] text-gray-500 font-semibold">Ratio {activeFile.aspectRatio}</span>
                          </div>
                        </div>

                        {/* Image Metadata Specifications List */}
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-2">
                          <div className="flex justify-between text-gray-400">
                            <span>File Name:</span>
                            <strong className="text-white font-mono truncate max-w-[240px]">{activeFile.name}</strong>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Output Format:</span>
                            <strong className="text-emerald-400 uppercase">WebP (Google Image Standard)</strong>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Quality Encoding:</span>
                            <strong className="text-white">{jpgQuality}% Canvas WebP Encoder</strong>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Privacy Security:</span>
                            <strong className="text-emerald-400">100% Client-Side (No Upload)</strong>
                          </div>
                        </div>

                        {/* Result Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                          <button
                            onClick={() => downloadSingle(activeFile)}
                            disabled={!activeFile.convertedBlob && !activeFile.convertedUrl}
                            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-xs font-black uppercase tracking-wider text-white hover:from-blue-500 hover:to-purple-500 transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download WebP</span>
                          </button>

                          <button
                            onClick={downloadZip}
                            disabled={isZipping || !files.some(f => f.convertedBlob !== null)}
                            className="w-full sm:w-auto py-3.5 px-5 rounded-xl glass-light border border-white/10 text-xs font-bold text-gray-200 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                          >
                            <Archive className="w-4 h-4 text-amber-400" />
                            <span>Download All ({files.filter(f => f.convertedBlob).length}) as ZIP</span>
                          </button>

                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full sm:w-auto py-3.5 px-5 rounded-xl glass-light border border-white/5 text-xs font-bold text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <FileUp className="w-4 h-4" />
                            <span>Convert More</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="glass rounded-2xl p-12 border border-white/10 text-center text-gray-400">
                        Select an image from the queue to view details.
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO Article & Schemas */}
        <div className="mt-16">
          <ToolArticle
            title={toolArticles["jpg-to-webp"].title}
            intro={toolArticles["jpg-to-webp"].intro}
            whatItDoes={toolArticles["jpg-to-webp"].whatItDoes}
            howToUse={toolArticles["jpg-to-webp"].howToUse}
            specificationTable={toolArticles["jpg-to-webp"].specificationTable}
            keyFeatures={toolArticles["jpg-to-webp"].keyFeatures}
            benefits={toolArticles["jpg-to-webp"].benefits}
            whyChoose={toolArticles["jpg-to-webp"].whyChoose}
            useCases={toolArticles["jpg-to-webp"].useCases}
            faqs={toolArticles["jpg-to-webp"].faqs}
            conclusion={toolArticles["jpg-to-webp"].conclusion}
            relatedTools={toolArticles["jpg-to-webp"].relatedTools}
            toolId="jpg-to-webp"
          />
        </div>

      </div>
    </div>
  );
}

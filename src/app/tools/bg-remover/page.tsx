"use client";

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, RefreshCw, UploadCloud, 
  ImageIcon, Sparkles, AlertCircle, Maximize2,
  ChevronLeft, Trash2, ShieldCheck, Zap, Share2,
  Copy, Check, Palette, Eye, Columns2, SlidersHorizontal,
  Wand2, Sliders, Layers
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { useAnalytics } from '@/hooks/useAnalytics';

type ViewMode = 'slider' | 'side-by-side' | 'result';
type ModelQuality = 'isnet_fp16' | 'isnet' | 'isnet_quint8';

interface BgPreset {
  id: string;
  name: string;
  value: string;
  type: 'transparent' | 'color';
}

const BG_PRESETS: BgPreset[] = [
  { id: 'transparent', name: 'Transparent', value: 'transparent', type: 'transparent' },
  { id: 'white', name: 'White', value: '#FFFFFF', type: 'color' },
  { id: 'black', name: 'Black', value: '#0F172A', type: 'color' },
  { id: 'passport-blue', name: 'Passport Blue', value: '#2563EB', type: 'color' },
  { id: 'studio-gray', name: 'Studio Gray', value: '#F1F5F9', type: 'color' },
  { id: 'warm-peach', name: 'Warm Peach', value: '#FFEDD5', type: 'color' },
  { id: 'soft-mint', name: 'Soft Mint', value: '#DCFCE7', type: 'color' },
  { id: 'lavender', name: 'Lavender', value: '#EDE9FE', type: 'color' },
];

export default function BackgroundRemover() {
  const { trackToolRun } = useAnalytics();
  const [mounted, setMounted] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [rawResultUrl, setRawResultUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing AI neural engine...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [modelQuality, setModelQuality] = useState<ModelQuality>('isnet_fp16');
  const [edgeCleanLevel, setEdgeCleanLevel] = useState<number>(20); // 0 to 50 alpha threshold
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [selectedBg, setSelectedBg] = useState<string>('transparent');
  const [customColor, setCustomColor] = useState<string>('#3B82F6');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customColorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Post-process mask to remove stray background specks & clean edge halos
  const applyEdgeCleanup = useCallback((baseImageUrl: string, threshold: number): Promise<string> => {
    return new Promise((resolve) => {
      if (threshold === 0) {
        resolve(baseImageUrl);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(baseImageUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Eliminate isolated low-alpha noise and soften edge halos
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a > 0 && a < threshold) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(baseImageUrl);
      img.src = baseImageUrl;
    });
  }, []);

  // Re-apply edge cleanup whenever edgeCleanLevel or rawResultUrl changes
  useEffect(() => {
    if (!rawResultUrl) return;
    let isCancelled = false;
    applyEdgeCleanup(rawResultUrl, edgeCleanLevel).then((cleanedUrl) => {
      if (!isCancelled) {
        setResultUrl(cleanedUrl);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [rawResultUrl, edgeCleanLevel, applyEdgeCleanup]);

  const processImageWithQuality = async (file: File, quality: ModelQuality) => {
    setIsProcessing(true);
    setLoadingText('Initializing Neural AI Model...');
    setProgress(5);
    setError(null);
    
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      
      const publicPath = `${window.location.origin}/api/imgly/`;
      
      const blob = await removeBackground(file, {
        publicPath,
        model: quality,
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            let p = 5;
            if (key.includes('fetch')) {
              // Phase 1: Download AI Model (maps 0-100% download into 5% -> 65% total progress)
              const downloadPct = Math.round((current / total) * 100);
              p = Math.min(65, Math.round(5 + (current / total) * 60));
              setLoadingText(`Downloading Neural Network assets... ${downloadPct}%`);
            } else if (key.includes('compute')) {
              // Phase 2: AI Neural Computation (maps 0-100% compute into 65% -> 95% total progress)
              const computePct = Math.round((current / total) * 100);
              p = Math.min(95, Math.round(65 + (current / total) * 30));
              setLoadingText(`Segmenting subject & isolating edges... ${computePct}%`);
            } else {
              p = Math.min(95, Math.round((current / total) * 90));
              setLoadingText(`Processing image... ${p}%`);
            }
            setProgress((prev) => Math.max(prev, p));
          }
        }
      });
      
      setProgress(100);
      setLoadingText('Finalizing transparent cutout...');
      
      const url = URL.createObjectURL(blob);
      setRawResultUrl(url);
      trackToolRun('background-remover');
    } catch (err: unknown) {
      console.error('Background removal failed:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.toLowerCase().includes('memory') || errorMessage.toLowerCase().includes('size')) {
        setError('Image is too large for in-browser processing. Please try a smaller image (under 5MB).');
      } else {
        setError(`Failed to process image: ${errorMessage || 'Unknown error'}. Please try again.`);
      }
      setSourceFile(null);
      setSourceUrl(null);
      setRawResultUrl(null);
      setResultUrl(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    
    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
    setRawResultUrl(null);
    setResultUrl(null);
    setError(null);
    setSliderPosition(50);
    setSelectedBg('transparent');
    
    processImageWithQuality(file, modelQuality);
  }, [modelQuality]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const reprocessWithQuality = (quality: ModelQuality) => {
    setModelQuality(quality);
    if (sourceFile) {
      processImageWithQuality(sourceFile, quality);
    }
  };

  const resetAll = () => {
    setSourceFile(null);
    setSourceUrl(null);
    setRawResultUrl(null);
    setResultUrl(null);
    setError(null);
    setProgress(0);
    setSliderPosition(50);
    setSelectedBg('transparent');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTransparentPNG = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `toolwala-transparent-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    import('sonner').then(({ toast }) => {
      toast.success('Transparent PNG downloaded!');
    });
  };

  const downloadWithBackground = async (format: 'png' | 'jpeg' = 'png') => {
    if (!resultUrl) return;
    if (selectedBg === 'transparent') {
      downloadTransparentPNG();
      return;
    }

    setIsDownloading(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = resultUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for export'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      // Fill background
      ctx.fillStyle = selectedBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw cutout
      ctx.drawImage(img, 0, 0);

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const ext = format === 'jpeg' ? 'jpg' : 'png';
      const dataUrl = canvas.toDataURL(mimeType, 0.95);

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `toolwala-bg-replaced-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      import('sonner').then(({ toast }) => {
        toast.success(`Image with background downloaded (${ext.toUpperCase()})!`);
      });
    } catch (e) {
      console.error('Download error:', e);
      import('sonner').then(({ toast }) => {
        toast.error('Failed to export image with background.');
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!resultUrl) return;
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      import('sonner').then(({ toast }) => {
        toast.success('Cutout copied to clipboard! Ready to paste 📋');
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
      import('sonner').then(({ toast }) => {
        toast.error('Could not copy to clipboard. Please use the Download button.');
      });
    }
  };

  const shareTool = () => {
    navigator.clipboard.writeText(window.location.href);
    import('sonner').then(({ toast }) => {
      toast.success('Link copied! Share ToolWala with a teammate ⚡');
    });
  };

  if (!mounted) return <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712]" />;

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-6 sm:py-10 relative overflow-hidden transition-colors duration-250 font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[350px] bg-blue-600/5 blur-[100px] -z-10" />

      <div className="container mx-auto px-3 sm:px-6 max-w-5xl">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-4 group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>
        
        <div className="rounded-3xl sm:rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl bg-white dark:bg-slate-900/80 backdrop-blur-xl">
          {/* Compact Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI Background Remover</h1>
                  <p className="text-slate-500 dark:text-gray-400 font-medium text-xs hidden sm:block">100% private in-browser AI subject separation.</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-500">16-Bit Studio</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Private</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-xl flex items-start gap-3 border border-red-500/20 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold uppercase tracking-wider">Processing Notice</h4>
                  <p className="mt-0.5 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {/* STATE 1: Upload Dropzone */}
            {!isProcessing && !resultUrl && (
              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center transition-all duration-300 cursor-pointer group overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 scale-[1.01] shadow-[0_0_30px_rgba(59,130,246,0.25)] ring-2 ring-blue-500/20' 
                    : 'border-slate-300 dark:border-white/10 hover:border-blue-500/60 hover:bg-blue-50/40 dark:hover:bg-white/[0.02]'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                />

                <div className="relative z-10">
                  <div className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4 border transition-all duration-300 ${
                    isDragging 
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg scale-105 animate-bounce' 
                      : 'text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 shadow-md group-hover:scale-105'
                  }`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">
                    {isDragging ? 'Drop Image to Remove Background!' : 'Drop photo here or click to browse'}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-400 mb-6 max-w-sm mx-auto font-medium text-xs leading-relaxed">
                    Supports JPG, PNG, and WebP. Works automatically for portraits, products, and graphics.
                  </p>

                  {/* Quality Mode Picker before upload */}
                  <div className="inline-flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm mb-4" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 px-2">
                      Precision:
                    </span>
                    <button
                      type="button"
                      onClick={() => setModelQuality('isnet_fp16')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        modelQuality === 'isnet_fp16'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Studio HD
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelQuality('isnet')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        modelQuality === 'isnet'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Ultra FP32
                    </button>
                  </div>
                  
                  <div className="flex justify-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
                    <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Fast AI</div>
                    <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Private</div>
                  </div>
                </div>
              </div>
            )}

            {/* STATE 2: Compact AI Processing View with Live Scanner */}
            {isProcessing && (
              <div className="rounded-2xl p-6 sm:p-10 border-2 border-blue-500/30 bg-blue-50/30 dark:bg-slate-900/80 shadow-lg flex flex-col items-center justify-center min-h-[340px] text-center relative overflow-hidden">
                
                {/* Image Preview with Scanner Beam Animation */}
                {sourceUrl && (
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-xl mb-5 bg-slate-900 flex items-center justify-center">
                    <img 
                      src={sourceUrl} 
                      alt="Processing Source" 
                      className="w-full h-full object-cover opacity-80" 
                    />
                    <div className="absolute inset-0 bg-blue-600/15" />
                    {/* Laser scanning beam */}
                    <motion.div 
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] z-20"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="absolute bottom-1.5 inset-x-1.5 bg-black/70 backdrop-blur-md rounded-lg py-0.5 px-1.5 text-[9px] font-black uppercase tracking-widest text-cyan-300">
                      Neural Scanning
                    </div>
                  </div>
                )}

                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                  Removing Background with AI
                </h3>
                <p className="text-slate-600 dark:text-gray-300 font-medium text-xs max-w-sm mb-5">
                  {loadingText}
                </p>
                
                {/* Progress Bar */}
                <div className="w-full max-w-xs sm:max-w-sm bg-slate-200 dark:bg-white/10 rounded-full h-3 overflow-hidden border border-slate-300 dark:border-white/10 p-0.5 relative shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between w-full max-w-xs sm:max-w-sm mt-1.5 px-1 text-[11px] font-black text-slate-500 dark:text-gray-400">
                  <span>{progress < 65 ? '1. Downloading Assets' : progress < 95 ? '2. Segmenting Edges' : '3. Finalizing'}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono">{progress}%</span>
                </div>
              </div>
            )}

            {/* STATE 3: Interactive Compact Result View */}
            {!isProcessing && resultUrl && sourceUrl && (
              <div className="space-y-3.5 animate-in fade-in duration-300">
                
                {/* Top Controls Bar: View Modes, Backdrops, Defringe */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100/90 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm text-xs">
                  
                  {/* Left: View Mode Toggle */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 mr-1 hidden sm:inline">
                      View:
                    </span>
                    <div className="inline-flex p-0.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
                      <button
                        onClick={() => setViewMode('slider')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          viewMode === 'slider'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <SlidersHorizontal className="w-3 h-3" /> Split
                      </button>
                      <button
                        onClick={() => setViewMode('side-by-side')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          viewMode === 'side-by-side'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Columns2 className="w-3 h-3" /> Side-by-Side
                      </button>
                      <button
                        onClick={() => setViewMode('result')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          viewMode === 'result'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" /> Cutout
                      </button>
                    </div>
                  </div>

                  {/* Right: Backdrop Swatches & Defringe */}
                  <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5">
                      {BG_PRESETS.map((preset) => {
                        const isSelected = selectedBg === preset.value;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => setSelectedBg(preset.value)}
                            title={preset.name}
                            className={`group relative h-6 w-6 rounded-lg transition-all flex items-center justify-center border ${
                              isSelected
                                ? 'scale-110 border-blue-600 shadow-sm ring-1 ring-blue-500/40'
                                : 'border-slate-300 dark:border-white/20 hover:scale-105'
                            } ${preset.type === 'transparent' ? 'bg-checkerboard' : ''}`}
                            style={preset.type === 'color' ? { backgroundColor: preset.value } : undefined}
                          >
                            {isSelected && (
                              <Check className={`w-3 h-3 ${
                                preset.value === '#FFFFFF' || preset.value === '#F1F5F9' || preset.value === '#FFEDD5' || preset.value === '#DCFCE7' || preset.value === '#EDE9FE' || preset.value === 'transparent'
                                  ? 'text-slate-900'
                                  : 'text-white'
                              }`} />
                            )}
                          </button>
                        );
                      })}

                      {/* Custom Color Swatch */}
                      <div className="relative flex items-center">
                        <button
                          onClick={() => customColorInputRef.current?.click()}
                          title="Custom Color"
                          className={`h-6 px-1.5 rounded-lg border flex items-center gap-1 text-[11px] font-bold transition-all ${
                            selectedBg === customColor
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'border-slate-300 dark:border-white/20 text-slate-600 dark:text-gray-400'
                          }`}
                        >
                          <div
                            className="w-3 h-3 rounded-sm border border-slate-300 dark:border-white/30"
                            style={{ backgroundColor: customColor }}
                          />
                        </button>
                        <input
                          ref={customColorInputRef}
                          type="color"
                          value={customColor}
                          onChange={(e) => {
                            setCustomColor(e.target.value);
                            setSelectedBg(e.target.value);
                          }}
                          className="sr-only"
                        />
                      </div>
                    </div>

                    {/* Compact Defringe Slider */}
                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300 dark:border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 hidden md:inline">Defringe:</span>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        title="Edge Halo Cleanup"
                        value={edgeCleanLevel}
                        onChange={(e) => setEdgeCleanLevel(Number(e.target.value))}
                        className="w-16 accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* MAIN CANVAS VIEWS (Compact 380px - 440px max height) */}
                {/* 1. Split Comparison Slider */}
                {viewMode === 'slider' && (
                  <div 
                    className={`relative w-full h-[360px] sm:h-[420px] max-h-[46vh] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl group select-none ${
                      selectedBg === 'transparent' ? 'bg-checkerboard' : ''
                    }`}
                    style={selectedBg !== 'transparent' ? { backgroundColor: selectedBg } : undefined}
                  >
                    {/* AFTER Image (Clean AI Cutout) */}
                    <img 
                      src={resultUrl} 
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none p-4 sm:p-6" 
                      alt="AI Background Removed Cutout" 
                    />
                    
                    {/* BEFORE Image (Original with dark background container) */}
                    <div 
                      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none border-r-2 border-white shadow-xl" 
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <div className="absolute inset-0 bg-slate-900">
                        <img 
                          src={sourceUrl} 
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none p-4 sm:p-6" 
                          alt="Original Photo" 
                        />
                      </div>
                    </div>

                    {/* Laser Comparison Line */}
                    <div 
                      className="absolute top-0 bottom-0 w-[2px] bg-blue-500 shadow-[0_0_10px_#3b82f6] z-20 pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    />

                    {/* Slider Handle */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 flex items-center justify-center pointer-events-none z-30"
                      style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="w-9 h-9 bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center border-2 border-blue-500 text-blue-600 group-active:scale-95 transition-transform">
                        <div className="flex gap-0.5">
                          <div className="w-0.5 h-3 bg-blue-500 rounded-full" />
                          <div className="w-0.5 h-3 bg-blue-500 rounded-full" />
                        </div>
                      </div>
                    </div>

                    {/* Invisible Range Input */}
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={sliderPosition} 
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
                    />
                    
                    {/* Floating Labels */}
                    <div className="absolute top-3.5 left-3.5 bg-slate-900/80 backdrop-blur-md text-white border border-white/20 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider pointer-events-none z-20 shadow-md">
                      Original
                    </div>
                    <div className="absolute top-3.5 right-3.5 bg-blue-600/90 backdrop-blur-md text-white border border-blue-400/40 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider pointer-events-none z-20 shadow-md">
                      AI Cutout
                    </div>
                  </div>
                )}

                {/* 2. Side-by-Side Comparison */}
                {viewMode === 'side-by-side' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 h-[300px] sm:h-[360px] max-h-[44vh] shadow-md flex items-center justify-center">
                      <img 
                        src={sourceUrl} 
                        className="w-full h-full object-contain p-4" 
                        alt="Original" 
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white border border-white/20 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                        Original Photo
                      </div>
                    </div>

                    <div 
                      className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 h-[300px] sm:h-[360px] max-h-[44vh] shadow-md flex items-center justify-center ${
                        selectedBg === 'transparent' ? 'bg-checkerboard' : ''
                      }`}
                      style={selectedBg !== 'transparent' ? { backgroundColor: selectedBg } : undefined}
                    >
                      <img 
                        src={resultUrl} 
                        className="w-full h-full object-contain p-4" 
                        alt="AI Cutout" 
                      />
                      <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm">
                        AI Result
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Result Only Focused View */}
                {viewMode === 'result' && (
                  <div 
                    className={`relative w-full h-[360px] sm:h-[420px] max-h-[46vh] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl flex items-center justify-center ${
                      selectedBg === 'transparent' ? 'bg-checkerboard' : ''
                    }`}
                    style={selectedBg !== 'transparent' ? { backgroundColor: selectedBg } : undefined}
                  >
                    <img 
                      src={resultUrl} 
                      className="w-full h-full object-contain p-4 sm:p-6" 
                      alt="AI Cutout Result" 
                    />
                    <div className="absolute top-3.5 right-3.5 bg-blue-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md">
                      {selectedBg === 'transparent' ? 'Transparent Cutout' : 'Custom Backdrop'}
                    </div>
                  </div>
                )}

                {/* Bottom Action & Export Toolbar (Compact & always in view) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={resetAll} 
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-gray-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all active:scale-[0.98] shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Start Over
                    </button>
                    <button 
                      onClick={copyToClipboard} 
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-gray-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all active:scale-[0.98] shadow-sm"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                    {/* Re-process with Ultra if needed */}
                    {modelQuality !== 'isnet' && (
                      <button
                        onClick={() => reprocessWithQuality('isnet')}
                        title="Re-run with 32-bit Ultra model"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" /> Ultra HD
                      </button>
                    )}

                    {selectedBg !== 'transparent' && (
                      <button 
                        onClick={() => downloadWithBackground('jpeg')}
                        disabled={isDownloading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 rounded-xl transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" /> Download JPG
                      </button>
                    )}

                    <button 
                      onClick={selectedBg === 'transparent' ? downloadTransparentPNG : () => downloadWithBackground('png')}
                      disabled={isDownloading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98] disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" /> 
                      {selectedBg === 'transparent' ? 'Download Transparent PNG' : 'Download PNG'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 text-center md:text-left">
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1.5">16-Bit Studio Neural AI</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium leading-relaxed">Runs high-fidelity FP16 neural networks locally in WebAssembly with zero compression artifacts.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1.5">Automatic Edge Defringing</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium leading-relaxed">Built-in alpha halo cleaning removes white specks and cleanly separates complex hair and garment edges.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1.5">100% Private & Free</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium leading-relaxed">No uploads, no limits, no accounts required. All processing happens securely on your device.</p>
          </div>
        </div>
      </div>

      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['bg-remover']} />
    </div>
  );
}

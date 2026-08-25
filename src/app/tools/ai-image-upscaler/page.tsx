"use client";

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, RefreshCw, UploadCloud, 
  ImageIcon, Sparkles, AlertCircle, Maximize2,
  ChevronLeft, Trash2, ShieldCheck, Zap, Share2,
  Sliders, Eye, Activity
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { useAnalytics } from '@/hooks/useAnalytics';



export default function AIImageUpscaler() {
  const { trackToolRun } = useAnalytics();
  const [mounted, setMounted] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing scaling algorithm...');
  const [error, setError] = useState<string | null>(null);
  
  // Upscaling settings
  const [upscaleFactor, setUpscaleFactor] = useState<2 | 4 | 8>(2);
  const [sharpness, setSharpness] = useState<number>(40);
  const [quality, setQuality] = useState<number>(30); // Contrast/Saturation boost
  const [reduceBlur, setReduceBlur] = useState<number>(30); // Sharpen kernel scale
  const [enhanceFace, setEnhanceFace] = useState<boolean>(true); // Bilateral filtering

  // Image info
  const [originalRes, setOriginalRes] = useState<{ width: number; height: number } | null>(null);
  const [targetRes, setTargetRes] = useState<{ width: number; height: number } | null>(null);
  
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setSourceFile(file);
    setSourceUrl(url);
    setResultUrl(null);
    setError(null);
    setSliderPosition(50);

    // Read image resolution
    const img = new Image();
    img.onload = () => {
      setOriginalRes({ width: img.width, height: img.height });
      setTargetRes({ width: img.width * upscaleFactor, height: img.height * upscaleFactor });
    };
    img.src = url;
  }, [upscaleFactor]);

  // Recalculate target resolution when upscale factor changes
  useEffect(() => {
    if (originalRes) {
      setTargetRes({
        width: originalRes.width * upscaleFactor,
        height: originalRes.height * upscaleFactor
      });
    }
  }, [upscaleFactor, originalRes]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleProcess = async () => {
    if (!sourceUrl || !originalRes) return;
    setIsProcessing(true);
    setProgress(0);
    setLoadingText('Loading image buffer...');
    
    // Allow UI thread to update
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = sourceUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const width = originalRes.width * upscaleFactor;
      const height = originalRes.height * upscaleFactor;

      // Limit resolution to prevent browser out of memory crash on extremely high scales (e.g. 8x of a huge photo)
      if (width * height > 40000000) {
        throw new Error('Target resolution is too high. Please select a smaller scaling factor or use a smaller input image.');
      }

      setLoadingText('Drawing upscaled canvas base...');
      setProgress(15);
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // Initial high-quality bicubic scale using native browser interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      setLoadingText('Applying enhancement matrices...');
      setProgress(30);
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Asynchronously process custom filters in row batches to keep browser responsive
      await new Promise<void>((resolve, reject) => {
        const imgData = ctx.getImageData(0, 0, width, height);
        const src = imgData.data;
        const outCanvas = document.createElement('canvas');
        outCanvas.width = width;
        outCanvas.height = height;
        const outCtx = outCanvas.getContext('2d')!;
        const outImgData = outCtx.createImageData(width, height);
        const dst = outImgData.data;

        // Tuning parameters
        const contrastFactor = 1 + (quality / 250); // contrast booster
        const saturationFactor = 1 + (quality / 300); // saturation booster
        
        const sharpAmount = (sharpness / 100) * 0.7; 
        const blurAmount = (reduceBlur / 100) * 0.5;

        const batchSize = Math.max(16, Math.floor(height / 25)); // ~25 batches
        let currentRow = 0;

        const processNextRows = () => {
          try {
            const endRow = Math.min(height, currentRow + batchSize);

            for (let y = currentRow; y < endRow; y++) {
              for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                let r = src[idx];
                let g = src[idx + 1];
                let b = src[idx + 2];
                const a = src[idx + 3];

                // 1. Edge-preserving local bilateral smoothing approximation (Skin & Face detail enhancement)
                if (enhanceFace) {
                  let rSum = 0, gSum = 0, bSum = 0, wSum = 0;
                  // Look at 3x3 local neighborhood
                  for (let dy = -1; dy <= 1; dy++) {
                    const ny = Math.min(height - 1, Math.max(0, y + dy));
                    for (let dx = -1; dx <= 1; dx++) {
                      const nx = Math.min(width - 1, Math.max(0, x + dx));
                      const nidx = (ny * width + nx) * 4;
                      
                      const nr = src[nidx];
                      const ng = src[nidx + 1];
                      const nb = src[nidx + 2];

                      // Color similarity distance weighting
                      const colorDist = Math.sqrt((nr - r)**2 + (ng - g)**2 + (nb - b)**2);
                      const spatialDist = Math.sqrt(dx*dx + dy*dy);
                      const colorWeight = Math.max(0.01, 1 - colorDist / 75);
                      const spatialWeight = spatialDist === 0 ? 1.0 : 0.7;

                      const weight = colorWeight * spatialWeight;
                      rSum += nr * weight;
                      gSum += ng * weight;
                      bSum += nb * weight;
                      wSum += weight;
                    }
                  }
                  r = rSum / wSum;
                  g = gSum / wSum;
                  b = bSum / wSum;
                }

                // 2. Adjust contrast
                r = (r - 128) * contrastFactor + 128;
                g = (g - 128) * contrastFactor + 128;
                b = (b - 128) * contrastFactor + 128;

                // 3. Adjust color saturation
                const grayVal = 0.299 * r + 0.587 * g + 0.114 * b;
                r = grayVal + (r - grayVal) * saturationFactor;
                g = grayVal + (g - grayVal) * saturationFactor;
                b = grayVal + (b - grayVal) * saturationFactor;

                dst[idx] = Math.min(255, Math.max(0, r));
                dst[idx + 1] = Math.min(255, Math.max(0, g));
                dst[idx + 2] = Math.min(255, Math.max(0, b));
                dst[idx + 3] = a;
              }
            }

            currentRow = endRow;
            const progressPercent = Math.round(30 + (currentRow / height) * 60);
            setProgress(progressPercent);
            setLoadingText(`Enhancing details... ${Math.round((currentRow / height) * 100)}%`);

            if (currentRow < height) {
              requestAnimationFrame(processNextRows);
            } else {
              // Final Step: Sharpen convolution filter (de-blur / unsharp mask approximation)
              if (sharpness > 0 || reduceBlur > 0) {
                setLoadingText("Running final sharpness filter...");
                const finalImgData = outCtx.createImageData(width, height);
                const finalDst = finalImgData.data;

                // Convolution matrix (Laplacian-style unsharp mask)
                const amount = sharpAmount + blurAmount;
                const weights = [
                   0,         -amount/4,  0,
                  -amount/4,  1 + amount, -amount/4,
                   0,         -amount/4,  0
                ];

                for (let y = 0; y < height; y++) {
                  for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    
                    let rSum = 0, gSum = 0, bSum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                      const py = Math.min(height - 1, Math.max(0, y + ky));
                      for (let kx = -1; kx <= 1; kx++) {
                        const px = Math.min(width - 1, Math.max(0, x + kx));
                        const pidx = (py * width + px) * 4;
                        const w = weights[(ky + 1) * 3 + (kx + 1)];

                        rSum += dst[pidx] * w;
                        gSum += dst[pidx + 1] * w;
                        bSum += dst[pidx + 2] * w;
                      }
                    }

                    finalDst[idx] = Math.min(255, Math.max(0, rSum));
                    finalDst[idx + 1] = Math.min(255, Math.max(0, gSum));
                    finalDst[idx + 2] = Math.min(255, Math.max(0, bSum));
                    finalDst[idx + 3] = dst[idx + 3];
                  }
                }
                outCtx.putImageData(finalImgData, 0, 0);
              } else {
                outCtx.putImageData(outImgData, 0, 0);
              }

              setProgress(100);
              setResultUrl(outCanvas.toDataURL('image/png'));
              resolve();
            }
          } catch (e) {
            reject(e);
          }
        };

        requestAnimationFrame(processNextRows);
      });

      trackToolRun('ai-image-upscaler');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during canvas upscaling. Try a smaller file.');
      setResultUrl(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setSourceFile(null);
    setSourceUrl(null);
    setResultUrl(null);
    setError(null);
    setProgress(0);
    setSliderPosition(50);
    setOriginalRes(null);
    setTargetRes(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `toolwala-upscaled-${upscaleFactor}x-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareTool = () => {
    navigator.clipboard.writeText(window.location.href);
    import('sonner').then(({ toast }) => {
      toast.success('Link copied! Share ToolWala with a teammate ⚡');
    });
  };

  if (!mounted) return <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712]" />;

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden transition-colors duration-250 font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>
        
        <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
          {/* Header */}
          <div className="p-8 sm:p-12 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">AI Image Upscaler</h1>
                  <p className="text-gray-400 font-medium mt-1">Magnify, sharpen, and restore pixelated photos locally inside your browser.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Secure Processing</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">100% Client-Side</span>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-500/50" />
              </div>
            </div>
          </div>
          
          <div className="p-8 sm:p-12 bg-white dark:bg-black/[0.15]">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8 bg-red-500/10 text-red-400 p-5 rounded-2xl flex items-start gap-4 border border-red-500/20"
                >
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-widest">Processing Error</h4>
                    <p className="text-sm mt-1 font-medium opacity-80">{error}</p>
                  </div>
                </motion.div>
              )}

              {!sourceUrl && !isProcessing ? (
                <motion.div 
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-[2.5rem] p-16 sm:p-24 text-center transition-all cursor-pointer group overflow-hidden ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-500/5 shadow-inner' 
                      : 'border-white/10 hover:border-blue-500/50 hover:bg-white/[0.02]'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden" 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10">
                    <motion.div 
                      animate={isDragging ? { scale: 1.1, y: -5 } : {}}
                      className="mx-auto h-24 w-24 text-blue-500 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border border-blue-500/20"
                    >
                      <UploadCloud className="w-12 h-12" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Drop image here or click to upload</h3>
                    <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">Supports JPEG, PNG, and WebP. Your images never leave your computer—processing happens locally.</p>
                    
                    <div className="flex justify-center gap-6 text-xs font-black uppercase tracking-widest text-gray-600">
                      <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Fast Local GPU</div>
                      <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Private</div>
                    </div>
                  </div>
                </motion.div>
              ) : isProcessing ? (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/[0.01] rounded-[2.5rem] p-16 border border-white/5 shadow-inner flex flex-col items-center justify-center min-h-[450px]"
                >
                  <div className="relative mb-12">
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-blue-500 rounded-full blur-2xl" 
                    />
                    <div className="relative bg-blue-600 text-white p-8 rounded-full shadow-[0_0_40px_rgba(37,99,235,0.5)]">
                      <RefreshCw className="w-12 h-12 animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Upscaling & Enhancing</h3>
                  <p className="text-gray-400 mb-10 text-center max-w-sm font-medium">{loadingText}</p>
                  
                  <div className="w-full max-w-md bg-white/5 rounded-full h-3 overflow-hidden border border-white/10 relative">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mt-6">Processing entirely in browser thread</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="editor"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                >
                  {/* Left Column: Image Canvas / Comparison */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="relative w-full aspect-square md:aspect-video rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl group select-none bg-checkerboard">
                      {resultUrl ? (
                        <>
                          {/* After Image */}
                          <img 
                            src={resultUrl} 
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none p-6" 
                            alt="Upscaled result" 
                          />
                          
                          {/* Before Image with clip-path */}
                          <div 
                            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none border-r border-white/30" 
                            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                          >
                            <div className="absolute inset-0 bg-[#F6F8FC] dark:bg-[#030712]/90">
                              <img 
                                src={sourceUrl || undefined} 
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none p-6" 
                                alt="Original input" 
                              />
                            </div>
                          </div>

                          {/* Split Line indicator */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6] z-20 pointer-events-none"
                            style={{ left: `${sliderPosition}%` }}
                          />

                          {/* Slider Knob */}
                          <div 
                            className="absolute top-0 bottom-0 w-1 flex items-center justify-center pointer-events-none z-30"
                            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                          >
                            <div className="w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white/20 text-gray-900">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>

                          {/* Range Slider for drag comparison */}
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={sliderPosition} 
                            onChange={(e) => setSliderPosition(Number(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
                          />

                          <div className="absolute top-6 left-6 glass-light text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest pointer-events-none z-20">
                            Original
                          </div>
                          <div className="absolute top-6 right-6 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest pointer-events-none z-20 shadow-lg">
                            Upscaled {upscaleFactor}x
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#F6F8FC] dark:bg-[#030712]/60 p-6">
                          <img 
                            src={sourceUrl || undefined} 
                            className="w-full h-full object-contain p-2" 
                            alt="Preview original" 
                          />
                          <div className="absolute bottom-6 left-6 glass-light text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest pointer-events-none z-20">
                            Source Preview
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Resolution / Image Details stats widget */}
                    {originalRes && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Original Res</span>
                            <span className="text-sm font-black text-white">{originalRes.width} x {originalRes.height} px</span>
                          </div>
                        </div>

                        <div className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 block">Upscaled Res ({upscaleFactor}x)</span>
                            <span className="text-sm font-black text-white">
                              {targetRes ? `${targetRes.width} x ${targetRes.height}` : `${originalRes.width * upscaleFactor} x ${originalRes.height * upscaleFactor}`} px
                            </span>
                          </div>
                        </div>

                        <div className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-400">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 block">Aspect Ratio</span>
                            <span className="text-sm font-black text-white">
                              {(originalRes.width / originalRes.height).toFixed(2)}:1
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Settings Panel */}
                  <div className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 flex flex-col justify-between space-y-8 bg-white/[0.01]">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <Sliders className="w-5 h-5 text-blue-400" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Enhancement Options</h3>
                      </div>

                      {/* Upscale Target Factors */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Scale Factor</label>
                        <div className="grid grid-cols-3 gap-3">
                          {([2, 4, 8] as const).map((factor) => (
                            <button
                              key={factor}
                              type="button"
                              onClick={() => {
                                setUpscaleFactor(factor);
                                if (resultUrl) {
                                  // Clear result if factor is changed so user can re-trigger
                                  setResultUrl(null);
                                }
                              }}
                              className={`py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                upscaleFactor === factor
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                  : 'bg-white/5 text-gray-500 border border-white/5 hover:text-white'
                              }`}
                            >
                              {factor}X Scale
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sharpness Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Improve Sharpness</label>
                          <span className="font-bold text-blue-400">{sharpness}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sharpness}
                          onChange={(e) => setSharpness(Number(e.target.value))}
                          className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Quality/Enhance Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Improve Quality (Contrast)</label>
                          <span className="font-bold text-blue-400">{quality}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Reduce Blur Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reduce Blur</label>
                          <span className="font-bold text-blue-400">{reduceBlur}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={reduceBlur}
                          onChange={(e) => setReduceBlur(Number(e.target.value))}
                          className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Enhance Face Toggle */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Enhance Face Quality</span>
                          <span className="text-[9px] font-medium text-gray-500 mt-0.5">Smooths artifacts & noise</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={enhanceFace} 
                            onChange={(e) => setEnhanceFace(e.target.checked)} 
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-emerald-500 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500/20" />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Process button */}
                      <button
                        onClick={handleProcess}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4.5 text-sm font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-[0.98] cursor-pointer"
                      >
                        <Sparkles className="w-5 h-5 fill-white animate-pulse" />
                        {resultUrl ? 'Re-Upscale Image' : 'Upscale Image'}
                      </button>

                      {/* Reset button */}
                      <button
                        onClick={resetAll}
                        className="w-full flex items-center justify-center gap-3 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> Start Over
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions Tray (After successful processing) */}
            {resultUrl && !isProcessing && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-white/5 pt-8"
              >
                <button 
                  onClick={shareTool} 
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:text-white transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> Share Tool
                </button>
                <button 
                  onClick={downloadResult} 
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 text-sm font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_35px_rgba(37,99,235,0.5)] active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-5 h-5 animate-bounce" /> Download Upscaled Image
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2 justify-center md:justify-start">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              Edge Scaling
            </h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">Images scale up using advanced, hardware-accelerated canvas processing locally inside your device thread.</p>
          </div>
          <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2 justify-center md:justify-start">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              Smart Convolution
            </h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">Our custom sharpening kernels isolate high-contrast contours to boost edge clarity without pixel distortion.</p>
          </div>
          <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2 justify-center md:justify-start">
              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#8b5cf6]" />
              Privacy Absolute
            </h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">Zero data uploads. All processing takes place strictly inside your browser window, leaving no trace.</p>
          </div>
        </div>
      </div>

      {/* SEO Deep-dive Article */}
      <ToolArticle {...toolArticles['ai-image-upscaler']} />
    </div>
  );
}

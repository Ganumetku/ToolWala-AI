"use client";

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, RefreshCw, UploadCloud, 
  ImageIcon, Sparkles, AlertCircle, Maximize2,
  ChevronLeft, Trash2, ShieldCheck, Zap
} from 'lucide-react';

const checkerboardStyle = {
  backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05)), repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 25%, #030712 25%, #030712 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05))',
  backgroundPosition: '0 0, 12px 12px',
  backgroundSize: '24px 24px'
};

export default function BackgroundRemover() {
  const [mounted, setMounted] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing AI model...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
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
    
    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setError(null);
    setSliderPosition(50);
    
    processImage(file);
  }, []);

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

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setLoadingText('Loading AI model...');
    setProgress(0);
    
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      
      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const p = Math.round((current / total) * 100);
            setProgress(p);
            if (key.includes('fetch')) {
              setLoadingText(`Downloading AI assets... ${p}%`);
            } else if (key.includes('compute')) {
              setLoadingText(`Removing background... ${p}%`);
            }
          }
        }
      });
      
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Try a smaller file or a different format.');
      setSourceFile(null);
      setSourceUrl(null);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `toolgpt-bg-removed-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!mounted) return <div className="min-h-screen bg-[#030712]" />;

  return (
    <div className="bg-[#030712] min-h-screen py-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
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
                  <h1 className="text-3xl font-black text-white tracking-tighter">Background Remover</h1>
                  <p className="text-gray-400 font-medium mt-1">Professional client-side background removal with 100% privacy.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Secure Processing</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">In-Browser Only</span>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-500/50" />
              </div>
            </div>
          </div>
          
          <div className="p-8 sm:p-12">
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
                  
                  {/* Decorative Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10">
                    <motion.div 
                      animate={isDragging ? { scale: 1.1, y: -5 } : {}}
                      className="mx-auto h-24 w-24 text-blue-500 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border border-blue-500/20"
                    >
                      <UploadCloud className="w-12 h-12" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Drop image here or click to upload</h3>
                    <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">Supports JPG, PNG, and WebP. Your images never leave your computer—processing happens locally.</p>
                    
                    <div className="flex justify-center gap-6 text-xs font-black uppercase tracking-widest text-gray-600">
                      <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Fast AI</div>
                      <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Private</div>
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
                      <Sparkles className="w-12 h-12 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">Analyzing Image</h3>
                  <p className="text-gray-400 mb-10 text-center max-w-sm font-medium">{loadingText}</p>
                  
                  <div className="w-full max-w-md bg-white/5 rounded-full h-3 overflow-hidden border border-white/10 relative">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 shimmer opacity-30" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mt-6">First run downloads ~40MB AI model assets</p>
                </motion.div>
              ) : resultUrl && sourceUrl ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  {/* Comparison Slider Wrapper */}
                  <div className="relative w-full aspect-square md:aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group select-none" style={checkerboardStyle}>
                    
                    {/* AFTER Image (Transparent PNG) */}
                    <img 
                      src={resultUrl} 
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none p-8" 
                      alt="Background Removed" 
                    />
                    
                    {/* BEFORE Image (Original) wrapped in clip-path */}
                    <div 
                      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none border-r-2 border-white/50 shadow-2xl" 
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <div className="absolute inset-0 bg-[#030712]">
                        <img 
                          src={sourceUrl} 
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none p-8" 
                          alt="Original" 
                        />
                      </div>
                    </div>

                    {/* AI Scanning Animation Line (Only when slider is active) */}
                    <motion.div 
                      className="absolute top-0 bottom-0 w-px bg-blue-400 shadow-[0_0_15px_#3b82f6] z-20 pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    />

                    {/* Slider Handle UI */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 flex items-center justify-center pointer-events-none z-30"
                      style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white/20 text-gray-900 group-active:scale-90 transition-transform">
                        <div className="flex gap-0.5">
                          <div className="w-0.5 h-4 bg-gray-300 rounded-full" />
                          <div className="w-0.5 h-4 bg-gray-300 rounded-full" />
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
                    
                    {/* Labels */}
                    <div className="absolute top-6 left-6 glass-light text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest pointer-events-none z-20">
                      Original
                    </div>
                    <div className="absolute top-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest pointer-events-none z-20 shadow-lg">
                      AI Result
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button 
                      onClick={resetAll} 
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
                    >
                      <Trash2 className="w-4 h-4" /> Start Over
                    </button>
                    <button 
                      onClick={downloadResult} 
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 text-sm font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-[0.98]"
                    >
                      <Download className="w-5 h-5" /> Download Result
                    </button>
                  </div>
                  <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mt-8">
                    Drag the handle to compare results
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-3">Browser Based</h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">Images are processed on your GPU using WebAssembly, ensuring your data never touches our servers.</p>
          </div>
          <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-3">High Precision</h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">Our AI model is optimized for complex edges like hair and semi-transparent objects.</p>
          </div>
          <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-3">Total Privacy</h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">No accounts, no tracking. Just professional background removal with zero footprint.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Download, Crop, RefreshCw, CheckCircle,
  ImageIcon, Sliders, ImagePlus, AlertCircle, Palette
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';

type SizeKey = "India Passport (35x45 mm)" | "US Passport (2x2 inch)" | "Visa Photo (35x45 mm)" | "Custom (Square)";

const SIZES: Record<SizeKey, { width: number; height: number; label: string }> = {
  "India Passport (35x45 mm)": { width: 413, height: 531, label: "35x45 mm" },
  "US Passport (2x2 inch)": { width: 600, height: 600, label: "2x2 inch" },
  "Visa Photo (35x45 mm)": { width: 413, height: 531, label: "35x45 mm" },
  "Custom (Square)": { width: 600, height: 600, label: "Custom Square" },
};

const STANDARD_BG_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Light Blue', hex: '#eff6ff' },
  { name: 'Light Gray', hex: '#f3f4f6' },
];

export default function PassportPhotoMaker() {
  const [step, setStep] = useState<'upload' | 'processing' | 'editor'>('upload');
  const [loadingText, setLoadingText] = useState("");
  
  const [originalImgUrl, setOriginalImgUrl] = useState<string | null>(null);
  const [processedImg, setProcessedImg] = useState<HTMLImageElement | null>(null);
  const [hasBgError, setHasBgError] = useState(false);
  const [subjectBounds, setSubjectBounds] = useState<{minX: number, minY: number, maxX: number, maxY: number} | null>(null);
  const [detectedType, setDetectedType] = useState<'Passport Photo' | 'Full Body' | 'Half Body' | null>(null);
  
  const [selectedSize, setSelectedSize] = useState<SizeKey>("India Passport (35x45 mm)");
  const [selectedBgHex, setSelectedBgHex] = useState(STANDARD_BG_COLORS[0].hex);
  
  const [singlePhotoUrl, setSinglePhotoUrl] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [moveX, setMoveX] = useState(0);
  const [moveY, setMoveY] = useState(0);

  const [autoCropDefaults, setAutoCropDefaults] = useState({ zoom: 1, moveX: 0, moveY: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const processUploadedImage = async (file: File) => {
    try {
      setStep('processing');
      setLoadingText("Uploading image...");
      setHasBgError(false);
      
      const url = URL.createObjectURL(file);
      setOriginalImgUrl(url);

      const originalImg = new Image();
      await new Promise((resolve, reject) => {
        originalImg.onload = resolve;
        originalImg.onerror = reject;
        originalImg.src = url;
      });

      setLoadingText("Removing background with AI...");
      let finalImg = originalImg;
      
      try {
        let processBlob: Blob | null = file;
        if (originalImg.width > 1200 || originalImg.height > 1200) {
          processBlob = await new Promise<Blob | null>((resolve) => {
            let { width, height } = originalImg;
            const maxSize = 1200;
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(originalImg, 0, 0, width, height);
              canvas.toBlob(resolve, 'image/jpeg', 0.95);
            } else {
              resolve(null);
            }
          });
        }
        
        const finalBlobToProcess = processBlob || file;

        const { removeBackground } = await import('@imgly/background-removal');
        const bgRemovedBlob = await removeBackground(finalBlobToProcess);
        const bgRemovedUrl = URL.createObjectURL(bgRemovedBlob);
        
        const aiImg = new Image();
        await new Promise((resolve, reject) => {
          aiImg.onload = resolve;
          aiImg.onerror = reject;
          aiImg.src = bgRemovedUrl;
        });
        finalImg = aiImg;
      } catch (bgError) {
        console.error("Background removal failed:", bgError);
        setHasBgError(true);
      }

      setLoadingText("Detecting subject and auto-cropping...");
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = finalImg.width;
      tempCanvas.height = finalImg.height;
      const ctx = tempCanvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(finalImg, 0, 0);
        const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
        
        let minX = tempCanvas.width, minY = tempCanvas.height, maxX = 0, maxY = 0;
        let foundPixels = false;
        
        for (let y = 0; y < tempCanvas.height; y += 4) {
          for (let x = 0; x < tempCanvas.width; x += 4) {
            const alpha = imgData[(y * tempCanvas.width + x) * 4 + 3];
            if (alpha > 20) {
              foundPixels = true;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        
        if (!foundPixels) {
          minX = 0; maxX = tempCanvas.width; minY = 0; maxY = tempCanvas.height;
        }

        const subjectHeight = Math.max(maxY - minY, 1);
        const imageHeight = tempCanvas.height;
        const subjectHeightRatio = subjectHeight / imageHeight;

        let type: 'Passport Photo' | 'Full Body' | 'Half Body' = 'Half Body';
        if (subjectHeightRatio > 0.55) {
          type = 'Passport Photo';
        } else if (subjectHeightRatio < 0.45) {
          type = 'Full Body';
        }
        
        setDetectedType(type);
        setSubjectBounds({ minX, minY, maxX, maxY });
      }

      setZoom(1);
      setMoveX(0);
      setMoveY(0);
      setAutoCropDefaults({ zoom: 1, moveX: 0, moveY: 0 });

      setProcessedImg(finalImg);
      setStep('editor');
    } catch (err) {
      console.error(err);
      alert("Failed to process image. Please try another one.");
      setStep('upload');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedImage(file);
  };

  const generateSinglePhoto = async (
    img: HTMLImageElement, 
    sizeKey: SizeKey, 
    bgColor: string, 
    currentZoom: number, 
    cMoveX: number, 
    cMoveY: number,
    bounds: {minX: number, minY: number, maxX: number, maxY: number} | null,
    type: 'Passport Photo' | 'Full Body' | 'Half Body' | null
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');
      
      const { width, height } = SIZES[sizeKey];
      canvas.width = width;
      canvas.height = height;
      
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      
      if (bounds && type) {
        const { minX, minY, maxX, maxY } = bounds;
        const subjectHeight = Math.max(maxY - minY, 1);
        const ratio = width / height;

        let baseCropTop = 0;
        let baseCropBottom = 0;

        if (type === 'Passport Photo') {
          baseCropTop = Math.max(0, minY - subjectHeight * 0.04);
          baseCropBottom = maxY;
        } else if (type === 'Full Body') {
          baseCropTop = Math.max(0, minY - subjectHeight * 0.05);
          baseCropBottom = minY + subjectHeight * 0.50;
        } else {
          // Half Body
          baseCropTop = Math.max(0, minY - subjectHeight * 0.06);
          baseCropBottom = minY + subjectHeight * 0.58;
        }

        const baseCropHeight = baseCropBottom - baseCropTop;
        
        const centerX = (minX + maxX) / 2;
        const baseCropWidth = baseCropHeight * ratio;
        const baseCropLeft = centerX - baseCropWidth / 2;

        const finalCropWidth = baseCropWidth / currentZoom;
        const finalCropHeight = baseCropHeight / currentZoom;

        const finalCropLeft = baseCropLeft + (baseCropWidth - finalCropWidth) / 2 - cMoveX;
        const finalCropTop = baseCropTop + (baseCropHeight - finalCropHeight) / 2 - cMoveY;

        ctx.drawImage(
          img,
          finalCropLeft, finalCropTop, finalCropWidth, finalCropHeight,
          0, 0, width, height
        );
      } else {
        const baseScale = Math.max(width / img.width, height / img.height);
        const appliedScale = baseScale * currentZoom;
        
        const scaledWidth = img.width * appliedScale;
        const scaledHeight = img.height * appliedScale;
        
        const startX = (width - scaledWidth) / 2 + cMoveX;
        const startY = (height - scaledHeight) / 2 + cMoveY;
        
        ctx.drawImage(img, startX, startY, scaledWidth, scaledHeight);
      }
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    });
  };

  const generateSheet = async (singleUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = 1800; // 6 inches at 300 dpi
        canvas.height = 1200; // 4 inches at 300 dpi
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const cols = 4;
        const rows = 2;
        
        const paddingX = (canvas.width - (img.width * cols)) / (cols + 1);
        const paddingY = (canvas.height - (img.height * rows)) / (rows + 1);
        
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = paddingX + c * (img.width + paddingX);
            const y = paddingY + r * (img.height + paddingY);
            
            ctx.strokeStyle = '#e5e7eb'; 
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, img.width, img.height);
            
            ctx.drawImage(img, x, y, img.width, img.height);
          }
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = singleUrl;
    });
  };

  const processFinalImages = useCallback(async () => {
    if (!processedImg) return;
    try {
      const single = await generateSinglePhoto(processedImg, selectedSize, selectedBgHex, zoom, moveX, moveY, subjectBounds, detectedType);
      setSinglePhotoUrl(single);
      if (single) {
        const sheet = await generateSheet(single);
        setSheetUrl(sheet);
      }
    } catch (err) {
      console.error(err);
    }
  }, [processedImg, selectedSize, selectedBgHex, zoom, moveX, moveY, subjectBounds, detectedType]);

  useEffect(() => {
    if (step === 'editor' && processedImg) {
      const timeoutId = setTimeout(() => {
        processFinalImages();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [step, processedImg, selectedSize, selectedBgHex, zoom, moveX, moveY, processFinalImages]);

  const resetCrop = () => {
    setZoom(autoCropDefaults.zoom);
    setMoveX(autoCropDefaults.moveX);
    setMoveY(autoCropDefaults.moveY);
  };

  const resetAll = () => {
    setStep('upload');
    setOriginalImgUrl(null);
    setProcessedImg(null);
    setSubjectBounds(null);
    setDetectedType(null);
    setSinglePhotoUrl(null);
    setSheetUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = e.target.value as SizeKey;
    setSelectedSize(newSize);
    
    // Reset manual crop settings when size changes so the auto-crop correctly applies to new ratio
    setZoom(1);
    setMoveX(0);
    setMoveY(0);
  };

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Directory
        </Link>
        
        <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 sm:p-10 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/20">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Passport Photo Maker</h1>
                <p className="text-gray-400 font-medium mt-1">Automatically remove background and crop for official IDs.</p>
              </div>
            </div>
            {step === 'editor' && (
              <button onClick={resetAll} className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 px-6 py-3.5 rounded-2xl border border-white/5 hover:border-red-500/20 transition-all active:scale-95">
                <RefreshCw className="w-4 h-4" /> Start Over
              </button>
            )}
          </div>
          
          <div className="p-8 sm:p-10">
            {step === 'upload' && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-white/10 rounded-[2.5rem] p-16 sm:p-24 text-center hover:border-blue-500/50 hover:bg-white/[0.02] transition-all cursor-pointer overflow-hidden"
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
                  <div className="mx-auto h-24 w-24 text-blue-500 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <ImagePlus className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Drop your photo here</h3>
                  <p className="text-gray-500 mb-10 max-w-xl mx-auto font-medium leading-relaxed text-lg">We recommend a photo with good lighting. Our AI will automatically remove the background and perfectly align your face for official requirements.</p>
                  <button className="rounded-2xl bg-blue-600 px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] pointer-events-none transition-all group-hover:bg-blue-500">
                    Select Photo From Device
                  </button>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="min-h-[500px] flex items-center justify-center glass rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-inner">
                {/* Progress Bar Top */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] w-2/3 animate-pulse" />
                </div>
                
                <div className="flex flex-col items-center max-w-md text-center px-10 w-full relative z-10">
                  <div className="relative mb-12">
                    <div className="absolute inset-0 rounded-full blur-3xl bg-blue-500 opacity-20 animate-pulse" />
                    <div className="relative bg-[#030712] p-8 rounded-full shadow-2xl border border-white/10">
                      <RefreshCw className="animate-spin h-14 w-14 text-blue-500" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">{loadingText || "Initializing AI..."}</h3>
                  <p className="text-gray-500 mb-10 font-medium leading-relaxed">
                    Analyzing facial features and preparing standardized framing. This usually takes less than 10 seconds.
                  </p>
                  
                  <div className="w-full glass rounded-3xl p-6 border border-white/5 text-left space-y-4 shadow-2xl">
                    <div className="flex items-center gap-4 text-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">Image Uploaded</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {loadingText.includes("Removing") ? (
                         <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" />
                      ) : (
                         <CheckCircle className={`w-5 h-5 flex-shrink-0 ${loadingText.includes('Detecting') || loadingText.includes('Creating') ? 'text-emerald-500' : 'text-white/10'}`} />
                      )}
                      <span className={loadingText.includes('Removing') ? "text-blue-400 font-black uppercase tracking-widest text-[10px]" : "text-gray-500 font-bold uppercase tracking-widest text-[10px]"}>Removing background...</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {loadingText.includes("Detecting") ? (
                         <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" />
                      ) : (
                         <CheckCircle className={`w-5 h-5 flex-shrink-0 text-white/10`} />
                      )}
                      <span className={loadingText.includes('Detecting') ? "text-blue-400 font-black uppercase tracking-widest text-[10px]" : "text-gray-500 font-bold uppercase tracking-widest text-[10px]"}>Auto-cropping Face...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'editor' && (
              <div className="flex flex-col xl:flex-row gap-10 items-start">
                {/* Previews Panel - Left Side */}
                <div className="w-full xl:w-[65%] space-y-8 flex flex-col">
                  {hasBgError && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex items-start gap-4 shadow-2xl">
                      <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest">Manual Assistance Required</h4>
                        <p className="text-sm text-gray-400 mt-1 font-medium leading-relaxed">AI background removal was limited for this image. You can still manually adjust the background color and crop using the controls.</p>
                      </div>
                    </div>
                  )}

                  <div className="glass p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col sm:flex-row gap-10 justify-center items-center flex-1 min-h-[450px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/5 blur-[120px] -z-10" />
                    
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-5">Original Context</span>
                      <div className="w-48 h-64 shadow-2xl border border-white/5 rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center p-3 relative group">
                        {originalImgUrl && <img src={originalImgUrl} alt="Original" className="max-w-full max-h-full object-contain rounded-lg opacity-60 group-hover:opacity-100 transition-opacity" />}
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex text-white/10">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-5 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Final AI Result
                      </span>
                      <div className="w-56 h-[auto] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/5 rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-[#030712] relative group">
                         <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                         {singlePhotoUrl && <img src={singlePhotoUrl} alt="Result" className="w-full h-auto object-cover border border-white/5 relative z-10 rounded-lg shadow-2xl" />}
                      </div>
                      {detectedType && (
                        <div className="mt-6 px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-white/10">
                          {detectedType} Detected
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="glass p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-blue-600/10 rounded-xl border border-blue-500/20">
                        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white tracking-tight uppercase">Printable Sheet Preview</h4>
                        <p className="text-sm text-gray-500 font-medium">Auto-formatted 4x6" (10x15cm) sheet with 8 copies.</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 p-8 rounded-[2rem] flex items-center justify-center shadow-inner border border-white/5 overflow-hidden group">
                      {sheetUrl && <img src={sheetUrl} alt="4x6 Sheet" className="w-full max-w-[450px] h-auto object-contain shadow-2xl bg-white border border-white/10 transition-transform group-hover:scale-[1.02]" />}
                    </div>
                  </div>
                </div>

                {/* Settings Panel - Right Side */}
                <div className="w-full xl:w-[35%] space-y-8 sticky top-8">
                  {/* Settings */}
                  <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                      <Sliders className="w-5 h-5 text-blue-500" />
                      <h3 className="text-xl font-black text-white tracking-tight uppercase">Configuration</h3>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Country & Standards</label>
                        <select 
                          value={selectedSize}
                          onChange={handleSizeChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                        >
                          {Object.keys(SIZES).map((key) => (
                            <option key={key} value={key} className="bg-slate-900">{key}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Official Background Color</label>
                        <div className="flex gap-4 items-center flex-wrap">
                          {STANDARD_BG_COLORS.map((bg) => (
                            <div key={bg.name} className="flex flex-col items-center gap-2">
                              <button
                                onClick={() => setSelectedBgHex(bg.hex)}
                                className={`w-12 h-12 rounded-2xl border-4 transition-all shadow-xl active:scale-90 ${
                                  selectedBgHex === bg.hex ? 'border-blue-600 scale-110' : 'border-white/5'
                                }`}
                                style={{ backgroundColor: bg.hex }}
                                title={bg.name}
                              />
                            </div>
                          ))}
                          
                          <div className="w-px h-10 bg-white/5 mx-1" />
                          
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={() => colorInputRef.current?.click()}
                              className={`w-12 h-12 rounded-2xl border-4 transition-all shadow-xl flex items-center justify-center relative overflow-hidden group ${
                                !STANDARD_BG_COLORS.some(bg => bg.hex === selectedBgHex) 
                                ? 'border-blue-600 scale-110' 
                                : 'border-white/5 hover:border-white/20'
                              }`}
                              style={{ 
                                background: 'linear-gradient(45deg, #ff0000, #ffee00, #00ff66, #3366ff, #ff0099)' 
                              }}
                              title="Custom Color"
                            >
                              <Palette className="w-6 h-6 text-white drop-shadow-lg relative z-10" />
                              <input 
                                type="color" 
                                ref={colorInputRef}
                                value={selectedBgHex} 
                                onChange={(e) => setSelectedBgHex(e.target.value)} 
                                className="sr-only" 
                              />
                            </button>
                          </div>
                        </div>
                        
                        {!STANDARD_BG_COLORS.some(bg => bg.hex === selectedBgHex) && (
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hex Code</span>
                            <span className="text-sm font-black text-blue-500 tracking-wider">{selectedBgHex.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Manual Crop */}
                  <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                      <div className="flex items-center gap-3">
                        <Crop className="w-5 h-5 text-blue-500"/>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase">Face Alignment</h3>
                      </div>
                      <button onClick={resetCrop} className="text-[10px] font-black text-blue-500 flex items-center gap-2 hover:text-blue-400 transition-colors uppercase tracking-widest bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
                        <RefreshCw className="w-3.5 h-3.5" /> Auto-Fit
                      </button>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Zoom Level</label>
                          <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">{zoom.toFixed(2)}x</span>
                        </div>
                        <input type="range" min="0.1" max="10" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full accent-blue-600 h-2 bg-white/5 rounded-full appearance-none cursor-pointer" />
                      </div>

                      <div className="space-y-5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Horizontal Offset</label>
                          <span className="text-xs font-black text-gray-400 bg-white/5 px-3 py-1 rounded-lg border border-white/5">{Math.round(moveX)}px</span>
                        </div>
                        <input type="range" min="-1500" max="1500" step="5" value={moveX} onChange={(e) => setMoveX(parseFloat(e.target.value))} className="w-full accent-blue-600 h-2 bg-white/5 rounded-full appearance-none cursor-pointer" />
                      </div>

                      <div className="space-y-5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Vertical Offset</label>
                          <span className="text-xs font-black text-gray-400 bg-white/5 px-3 py-1 rounded-lg border border-white/5">{Math.round(moveY)}px</span>
                        </div>
                        <input type="range" min="-1500" max="1500" step="5" value={moveY} onChange={(e) => setMoveY(parseFloat(e.target.value))} className="w-full accent-blue-600 h-2 bg-white/5 rounded-full appearance-none cursor-pointer" />
                      </div>
                    </div>
                  </div>
                  
                  {singlePhotoUrl && sheetUrl && (
                    <div className="space-y-4 pt-4">
                      <button 
                        onClick={() => downloadImage(singlePhotoUrl, 'passport_photo.jpg')}
                        className="w-full flex items-center justify-center gap-4 rounded-[2rem] bg-white text-black px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-all shadow-2xl active:scale-[0.98]"
                      >
                        <Download className="w-5 h-5" />
                        Download Single Photo
                      </button>
                      <button 
                        onClick={() => downloadImage(sheetUrl, 'passport_sheet_4x6.jpg')}
                        className="w-full flex items-center justify-center gap-4 rounded-[2rem] bg-blue-600 text-white px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] active:scale-[0.98]"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Download 4x6 Sheet (8 Copies)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['passport-photo-maker']} />
    </div>
  );

}

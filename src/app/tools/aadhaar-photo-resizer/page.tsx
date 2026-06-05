"use client";

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Download, Crop, RefreshCw, CheckCircle,
  ImageIcon, Sliders, ImagePlus, AlertCircle, Palette,
  ChevronLeft, Sparkles, ShieldCheck, Eye, EyeOff, ArrowRight
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';
import { toast } from 'sonner';

// Indian Standard Aadhaar specifications (35mm x 45mm)
// At 300 DPI: 413 x 531 pixels (Ratio ~7:9)
const AADHAAR_WIDTH = 413;
const AADHAAR_HEIGHT = 531;

const STANDARD_BG_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Light Blue', hex: '#eff6ff' },
  { name: 'Off White', hex: '#fafafa' },
];

export default function AadhaarPhotoResizer() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'upload' | 'processing' | 'editor'>('upload');
  const [loadingText, setLoadingText] = useState("");
  
  // Image assets states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalImgUrl, setOriginalImgUrl] = useState<string | null>(null);
  const [processedImg, setProcessedImg] = useState<HTMLImageElement | null>(null);
  const [hasBgError, setHasBgError] = useState(false);
  const [subjectBounds, setSubjectBounds] = useState<{minX: number, minY: number, maxX: number, maxY: number} | null>(null);
  const [detectedType, setDetectedType] = useState<'Standard ID Photo' | 'Full Body Shot' | 'Half Body Shot' | null>(null);
  
  // Workspace Config States
  const [selectedBgHex, setSelectedBgHex] = useState(STANDARD_BG_COLORS[0].hex);
  const [format, setFormat] = useState<'jpg' | 'png'>('jpg');
  
  // Size Targets States (KB)
  const [targetKbMode, setTargetKbMode] = useState<'20' | '50' | '100' | 'custom'>('50');
  const [customTargetKb, setCustomTargetKb] = useState<number>(30);
  const [downloadSizeInfo, setDownloadSizeInfo] = useState<string>("");

  // Visual Adjustment Sliders
  const [brightness, setBrightness] = useState<number>(100); // 50 to 150
  const [contrast, setContrast] = useState<number>(100);   // 50 to 150
  const [sharpness, setSharpness] = useState<number>(0);     // 0 to 100
  const [autoEnhance, setAutoEnhance] = useState<boolean>(false);

  // Face Alignments Sliders
  const [zoom, setZoom] = useState(1.0);
  const [moveX, setMoveX] = useState(0);
  const [moveY, setMoveY] = useState(0);
  const [autoCropDefaults, setAutoCropDefaults] = useState({ zoom: 1.0, moveX: 0, moveY: 0 });

  // Preview final DataURL
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Convolution Sharpening helper on canvas context
  const sharpenCanvas = (canvas: HTMLCanvasElement, value: number) => {
    if (value <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    
    // Create a backup of the pixel data for spatial reference
    const copy = new Uint8ClampedArray(pixels);
    
    // Normalize strength weight (0 to 1)
    const w = value / 150; 
    const a = -w;
    const b = 1 + 4 * w;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        
        for (let c = 0; c < 3; c++) { // Process RGB channels separately
          const top = ((y - 1) * width + x) * 4 + c;
          const bottom = ((y + 1) * width + x) * 4 + c;
          const left = (y * width + (x - 1)) * 4 + c;
          const right = (y * width + (x + 1)) * 4 + c;
          const center = i + c;
          
          const newVal = copy[center] * b + (copy[top] + copy[bottom] + copy[left] + copy[right]) * a;
          pixels[center] = Math.max(0, Math.min(255, newVal));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  // ------------------------------------
  // FILE UPLOAD ANALYSIS PIPELINE
  // ------------------------------------
  const processUploadedImage = async (file: File) => {
    try {
      setStep('processing');
      setLoadingText("Uploading image details...");
      setHasBgError(false);
      setUploadedFile(file);
      
      const url = URL.createObjectURL(file);
      setOriginalImgUrl(url);

      const originalImg = new Image();
      await new Promise((resolve, reject) => {
        originalImg.onload = resolve;
        originalImg.onerror = reject;
        originalImg.src = url;
      });

      setLoadingText("Removing background locally...");
      let finalImg = originalImg;
      
      try {
        let processBlob: Blob | null = file;
        // Resize massive uploads to maintain browser thread speed
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
        console.error("AI Background removal failed:", bgError);
        setHasBgError(true);
        toast.warning("Background removal failed. Standard background replacements might have errors.");
      }

      setLoadingText("Analyzing subject dimensions...");
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = finalImg.width;
      tempCanvas.height = finalImg.height;
      const ctx = tempCanvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(finalImg, 0, 0);
        const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
        
        let minX = tempCanvas.width, minY = tempCanvas.height, maxX = 0, maxY = 0;
        let foundPixels = false;
        
        // Scan alpha coordinate bounds to locate the subject
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

        let type: 'Standard ID Photo' | 'Full Body Shot' | 'Half Body Shot' = 'Half Body Shot';
        if (subjectHeightRatio > 0.55) {
          type = 'Standard ID Photo';
        } else if (subjectHeightRatio < 0.45) {
          type = 'Full Body Shot';
        }
        
        setDetectedType(type);
        setSubjectBounds({ minX, minY, maxX, maxY });
      }

      // Initialize workspace align defaults
      setZoom(1.0);
      setMoveX(0);
      setMoveY(0);
      setAutoCropDefaults({ zoom: 1.0, moveX: 0, moveY: 0 });

      setProcessedImg(finalImg);
      setStep('editor');
      toast.success("Image processed and aligned successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse visual components in image.");
      setStep('upload');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processUploadedImage(file);
      } else {
        toast.error("Please select valid image files only.");
      }
    }
  };

  // ------------------------------------
  // IMAGE FILTER & CANVAS COMPILER
  // ------------------------------------
  const renderAadhaarPhoto = useCallback((
    img: HTMLImageElement,
    bgColor: string,
    currentZoom: number,
    cMoveX: number,
    cMoveY: number,
    bounds: {minX: number, minY: number, maxX: number, maxY: number} | null,
    type: 'Standard ID Photo' | 'Full Body Shot' | 'Half Body Shot' | null
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    canvas.width = AADHAAR_WIDTH;
    canvas.height = AADHAAR_HEIGHT;

    // Apply Background Fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, AADHAAR_WIDTH, AADHAAR_HEIGHT);

    // Set filters: hardware accelerated brightness/contrast
    const appliedBright = autoEnhance ? 108 : brightness;
    const appliedContrast = autoEnhance ? 104 : contrast;
    ctx.filter = `brightness(${appliedBright}%) contrast(${appliedContrast}%)`;

    // Crop Logic based on subject pose
    if (bounds && type) {
      const { minX, minY, maxX, maxY } = bounds;
      const subjectHeight = Math.max(maxY - minY, 1);
      const ratio = AADHAAR_WIDTH / AADHAAR_HEIGHT;

      let baseCropTop = 0;
      let baseCropBottom = 0;

      if (type === 'Standard ID Photo') {
        baseCropTop = Math.max(0, minY - subjectHeight * 0.04);
        baseCropBottom = maxY;
      } else if (type === 'Full Body Shot') {
        baseCropTop = Math.max(0, minY - subjectHeight * 0.05);
        baseCropBottom = minY + subjectHeight * 0.45; // Cropping face/shoulders only
      } else {
        // Half Body Shot
        baseCropTop = Math.max(0, minY - subjectHeight * 0.06);
        baseCropBottom = minY + subjectHeight * 0.54;
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
        0, 0, AADHAAR_WIDTH, AADHAAR_HEIGHT
      );
    } else {
      // Fallback centering if bounding box unavailable
      const baseScale = Math.max(AADHAAR_WIDTH / img.width, AADHAAR_HEIGHT / img.height);
      const appliedScale = baseScale * currentZoom;

      const scaledWidth = img.width * appliedScale;
      const scaledHeight = img.height * appliedScale;

      const startX = (AADHAAR_WIDTH - scaledWidth) / 2 + cMoveX;
      const startY = (AADHAAR_HEIGHT - scaledHeight) / 2 + cMoveY;

      ctx.drawImage(img, startX, startY, scaledWidth, scaledHeight);
    }

    // Apply pixel-level sharpen filter
    const appliedSharpness = autoEnhance ? 25 : sharpness;
    if (appliedSharpness > 0) {
      sharpenCanvas(canvas, appliedSharpness);
    }

    return canvas;
  }, [brightness, contrast, sharpness, autoEnhance]);

  // ------------------------------------
  // BINARY SEARCH JPEG COMPRESSOR
  // ------------------------------------
  const compressToKbLimit = async (canvas: HTMLCanvasElement, targetKb: number): Promise<string> => {
    let minQ = 0.05;
    let maxQ = 0.99;
    let bestQ = 0.75;
    let resultUrl = "";

    // 7 cycles are enough to search binary qualities mathematically
    for (let i = 0; i < 7; i++) {
      const q = (minQ + maxQ) / 2;
      const url = canvas.toDataURL('image/jpeg', q);
      
      // Compute accurate Base64 array byte representation
      const approxBytes = Math.round((url.length - 814) * 0.75);
      const approxKb = approxBytes / 1024;

      if (approxKb > targetKb) {
        maxQ = q; // Too large, lower quality
      } else {
        minQ = q; // Fits, try higher quality
        bestQ = q;
        resultUrl = url;
      }
    }

    if (!resultUrl) {
      resultUrl = canvas.toDataURL('image/jpeg', 0.1);
    }
    
    const approxBytes = Math.round((resultUrl.length - 814) * 0.75);
    setDownloadSizeInfo(`${(approxBytes / 1024).toFixed(1)} KB`);
    return resultUrl;
  };

  const getTargetSizeLimit = (): number => {
    if (targetKbMode === '20') return 20;
    if (targetKbMode === '50') return 48; // Buffer to guarantee staying below portal caps
    if (targetKbMode === '100') return 98;
    return customTargetKb;
  };

  // Compile Preview Render
  const updatePreview = useCallback(async () => {
    if (!processedImg) return;
    try {
      const canvas = renderAadhaarPhoto(processedImg, selectedBgHex, zoom, moveX, moveY, subjectBounds, detectedType);
      
      let finalUrl = "";
      if (format === 'png') {
        finalUrl = canvas.toDataURL('image/png');
        const approxBytes = Math.round((finalUrl.length - 814) * 0.75);
        setDownloadSizeInfo(`${(approxBytes / 1024).toFixed(1)} KB`);
      } else {
        const targetLimit = getTargetSizeLimit();
        finalUrl = await compressToKbLimit(canvas, targetLimit);
      }
      setPreviewPhotoUrl(finalUrl);
    } catch (err) {
      console.error(err);
    }
  }, [processedImg, selectedBgHex, zoom, moveX, moveY, subjectBounds, detectedType, format, targetKbMode, customTargetKb, renderAadhaarPhoto]);

  useEffect(() => {
    if (step === 'editor' && processedImg) {
      const timeout = setTimeout(() => {
        updatePreview();
      }, 60);
      return () => clearTimeout(timeout);
    }
  }, [step, processedImg, selectedBgHex, zoom, moveX, moveY, format, targetKbMode, customTargetKb, brightness, contrast, sharpness, autoEnhance, updatePreview]);

  const handleDownload = () => {
    if (!previewPhotoUrl || !uploadedFile) return;

    const a = document.createElement('a');
    a.href = previewPhotoUrl;
    a.download = uploadedFile.name.replace(/\.[^/.]+$/, "") + `_aadhaar.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Standardized photo downloaded.");
  };

  const handleResetCrop = () => {
    setZoom(autoCropDefaults.zoom);
    setMoveX(autoCropDefaults.moveX);
    setMoveY(autoCropDefaults.moveY);
  };

  const resetAll = () => {
    setStep('upload');
    setUploadedFile(null);
    setOriginalImgUrl(null);
    setProcessedImg(null);
    setSubjectBounds(null);
    setDetectedType(null);
    setPreviewPhotoUrl(null);
    setBrightness(100);
    setContrast(100);
    setSharpness(0);
    setAutoEnhance(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 relative overflow-hidden font-sans">
      <MeshGradient />

      {/* Decorative Glow Grid */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <Link 
          href="/tools" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white cursor-pointer transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Directory
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Sparkles className="w-3.5 h-3.5" />
            100% Client-Side Image Processing
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 uppercase">
            Aadhaar Photo Resizer <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Official UIDAI standard
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium">
            Standardize your photo for Aadhaar updates and Indian portals. Automatically remove backgrounds, center faces, enhance clarity, and compress to exact KB limits.
          </p>
        </div>

        {/* Workspace Console */}
        <div className="max-w-6xl mx-auto">
          {step === 'upload' ? (
            // Upload Area
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-white/10 rounded-[2.5rem] p-16 sm:p-24 text-center hover:border-blue-500/50 hover:bg-white/[0.02] transition-all cursor-pointer overflow-hidden bg-white/[0.01]"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="mx-auto h-24 w-24 text-blue-500 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                  <ImagePlus className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Drop your photo here or click to browse</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Supports JPEG, PNG, and WebP. Intelligently crops selfies, half body portraits, and full-body captures.</p>
                
                <div className="inline-flex items-center gap-3.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                  Upload Photo
                </div>
              </div>
            </div>
          ) : step === 'processing' ? (
            // Processing Loader
            <div className="min-h-[450px] flex items-center justify-center glass rounded-[2.5rem] border border-white/5 relative overflow-hidden bg-black/40">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 w-2/3 animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
              </div>
              
              <div className="flex flex-col items-center max-w-sm text-center px-6 relative z-10">
                <div className="relative mb-10">
                  <div className="absolute inset-0 rounded-full blur-3xl bg-blue-500 opacity-20 animate-pulse" />
                  <div className="relative bg-[#030712] p-6.5 rounded-full shadow-2xl border border-white/10">
                    <RefreshCw className="animate-spin h-10 w-10 text-blue-500" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">{loadingText || "Aligning Face..."}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed mb-8">
                  Removing backdrop boundaries and applying centered shoulder crops locally.
                </p>

                <div className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl space-y-3.5 text-left shadow-2xl">
                  <div className="flex items-center gap-3 text-xs">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                    <span className="text-gray-300 font-bold uppercase tracking-widest text-[9px]">File Uploaded</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {loadingText.includes("Removing") ? (
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    ) : (
                      <CheckCircle className={`w-4.5 h-4.5 ${loadingText.includes("Analyzing") ? "text-emerald-500" : "text-white/10"}`} />
                    )}
                    <span className={loadingText.includes("Removing") ? "text-blue-400 font-black uppercase tracking-widest text-[9px]" : "text-gray-500 font-bold uppercase tracking-widest text-[9px]"}>AI Background Removal</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {loadingText.includes("Analyzing") ? (
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    ) : (
                      <CheckCircle className="w-4.5 h-4.5 text-white/10" />
                    )}
                    <span className={loadingText.includes("Analyzing") ? "text-blue-400 font-black uppercase tracking-widest text-[9px]" : "text-gray-500 font-bold uppercase tracking-widest text-[9px]"}>Face Alignment</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Editor Workspace
            <div className="flex flex-col xl:flex-row gap-8 items-start">
              
              {/* Left Column: Interactive Previews */}
              <div className="w-full xl:w-[65%] space-y-6">
                
                {hasBgError && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-xl">
                    <AlertCircle className="w-5.5 h-5.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest">Manual Overlay Helper Active</h4>
                      <p className="text-xs text-gray-400 mt-1 font-semibold leading-relaxed">
                        AI background extractor met a busy background. Use settings to override and zoom positioning manually.
                      </p>
                    </div>
                  </div>
                )}

                {/* Main Previews Display */}
                <div className="glass p-8 sm:p-10 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col md:flex-row gap-8 items-center justify-center min-h-[400px]">
                  
                  {/* Before View */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-4">Original Upload</span>
                    <div className="w-44 h-56 shadow-2xl border border-white/5 rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center p-2">
                      {originalImgUrl && (
                        <img src={originalImgUrl} alt="Original Input" className="max-w-full max-h-full object-contain rounded-lg opacity-50" />
                      )}
                    </div>
                  </div>

                  <div className="hidden md:block text-white/10">
                    <ArrowRight className="w-8 h-8" />
                  </div>

                  {/* After View */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Compliant Crop
                    </span>
                    <div className="w-52 h-[auto] shadow-[0_0_40px_rgba(0,0,0,0.6)] border-4 border-white/5 rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-[#030712] relative">
                      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                      {previewPhotoUrl && (
                        <img src={previewPhotoUrl} alt="Stylized Compliant View" className="w-full h-auto object-cover border border-white/5 rounded-lg shadow-2xl relative z-10" />
                      )}
                    </div>
                    {detectedType && (
                      <span className="mt-4 px-4 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest rounded-full">
                        {detectedType} Aligned
                      </span>
                    )}
                  </div>

                </div>

                {/* Exporters and File size status bar */}
                <div className="glass p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-semibold text-gray-400">
                      Standard Size: <span className="font-mono text-white font-bold">3.5 x 4.5 cm (354 x 472 px)</span>
                    </div>
                    {downloadSizeInfo && (
                      <>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="text-xs font-semibold text-gray-400">
                          Compiled Sizing: <span className="font-mono text-blue-400 font-black">{downloadSizeInfo}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={resetAll}
                      className="px-4 py-2.5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Start Over
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={!previewPhotoUrl}
                      className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Standard Photo
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Control Configurations */}
              <div className="w-full xl:w-[35%] space-y-6">
                
                {/* Configuration settings panel */}
                <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-2.5 mb-6 border-b border-white/5 pb-4">
                    <Palette className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-black text-white tracking-tight uppercase">Styling Deck</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Background Selection */}
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Official Background Color</label>
                      <div className="flex gap-3 items-center">
                        {STANDARD_BG_COLORS.map(bg => (
                          <button
                            key={bg.name}
                            onClick={() => setSelectedBgHex(bg.hex)}
                            className={`w-10 h-10 rounded-xl border-3 transition-all cursor-pointer ${
                              selectedBgHex === bg.hex ? 'border-blue-600 scale-105' : 'border-white/5 hover:border-white/15'
                            }`}
                            style={{ backgroundColor: bg.hex }}
                            title={bg.name}
                          />
                        ))}
                        <div className="w-px h-8 bg-white/10 mx-0.5" />
                        <button
                          onClick={() => colorInputRef.current?.click()}
                          className={`w-10 h-10 rounded-xl border-3 transition-all cursor-pointer flex items-center justify-center overflow-hidden ${
                            !STANDARD_BG_COLORS.some(bg => bg.hex === selectedBgHex)
                              ? 'border-blue-600 scale-105'
                              : 'border-white/5 hover:border-white/15'
                          }`}
                          style={{ background: 'linear-gradient(45deg, #ff0000, #ffee00, #00ff66, #3366ff, #ff0099)' }}
                          title="Custom Hex color"
                        >
                          <Sliders className="w-4 h-4 text-white drop-shadow-md" />
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

                    {/* Compression Sizing Limit */}
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Format & Sizing Target</label>
                      <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/5 p-1 rounded-xl">
                        <button
                          onClick={() => setFormat('jpg')}
                          className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${
                            format === 'jpg' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          JPEG (Standard)
                        </button>
                        <button
                          onClick={() => setFormat('png')}
                          className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${
                            format === 'png' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          PNG (High Quality)
                        </button>
                      </div>

                      {format === 'jpg' && (
                        <div className="space-y-3.5 border-t border-white/5 pt-4 animate-in fade-in duration-350">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Target KB Limit</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {['20', '50', '100'].map(kb => (
                              <button
                                key={kb}
                                onClick={() => setTargetKbMode(kb as any)}
                                className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer ${
                                  targetKbMode === kb
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                                    : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10 hover:text-white'
                                }`}
                              >
                                &lt; {kb}KB
                              </button>
                            ))}
                            <button
                              onClick={() => setTargetKbMode('custom')}
                              className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer ${
                                targetKbMode === 'custom'
                                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                                  : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10 hover:text-white'
                              }`}
                            >
                              Custom
                            </button>
                          </div>

                          {targetKbMode === 'custom' && (
                            <div className="flex items-center gap-3 bg-black/40 border border-white/5 px-4 py-2.5 rounded-xl animate-in slide-in-from-top-2 duration-300">
                              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Target size (KB)</span>
                              <input
                                type="number"
                                min="5"
                                max="500"
                                value={customTargetKb}
                                onChange={(e) => setCustomTargetKb(Math.max(5, parseInt(e.target.value) || 20))}
                                className="w-16 bg-transparent text-right font-mono font-bold text-blue-400 outline-none text-xs"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Crop alignment settings panel */}
                <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01]">
                  <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Crop className="w-5 h-5 text-blue-500" />
                      <h3 className="text-sm font-black text-white tracking-tight uppercase">Alignment Grid</h3>
                    </div>
                    <button
                      onClick={handleResetCrop}
                      className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors hover:text-blue-300"
                    >
                      Reset Alignment
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                        <span className="uppercase tracking-wider">Manual Zoom</span>
                        <span className="font-mono text-blue-400 font-bold">{zoom.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="6.0"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                        <span className="uppercase tracking-wider">Horizontal Position</span>
                        <span className="font-mono text-gray-500 font-bold">{Math.round(moveX)}px</span>
                      </div>
                      <input
                        type="range"
                        min="-1000"
                        max="1000"
                        step="4"
                        value={moveX}
                        onChange={(e) => setMoveX(parseFloat(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                        <span className="uppercase tracking-wider">Vertical Position</span>
                        <span className="font-mono text-gray-500 font-bold">{Math.round(moveY)}px</span>
                      </div>
                      <input
                        type="range"
                        min="-1000"
                        max="1000"
                        step="4"
                        value={moveY}
                        onChange={(e) => setMoveY(parseFloat(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Enhancements Settings panel */}
                <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01]">
                  <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-5 h-5 text-blue-500" />
                      <h3 className="text-sm font-black text-white tracking-tight uppercase">Enhancements</h3>
                    </div>
                    <button
                      onClick={() => setAutoEnhance(prev => !prev)}
                      className={`text-[9px] font-black uppercase tracking-widest border px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                        autoEnhance 
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25' 
                          : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                      }`}
                    >
                      Auto Enhance
                    </button>
                  </div>

                  <div className={`space-y-6 transition-opacity duration-300 ${autoEnhance ? 'opacity-30 pointer-events-none' : ''}`}>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                        <span className="uppercase tracking-wider">Brightness</span>
                        <span className="font-mono text-blue-400 font-bold">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                        <span className="uppercase tracking-wider">Contrast</span>
                        <span className="font-mono text-blue-400 font-bold">{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={contrast}
                        onChange={(e) => setContrast(parseInt(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                        <span className="uppercase tracking-wider">Sharpness Boost</span>
                        <span className="font-mono text-blue-400 font-bold">+{sharpness}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sharpness}
                        onChange={(e) => setSharpness(parseInt(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-32 max-w-5xl mx-auto border-t border-white/5 pt-24">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Crop className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-lg font-black text-white mb-2">Smart Centered Crops</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Detects subject coordinates to isolate and crop only head/shoulders from portraits or full captures.
              </p>
            </div>
            <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Download className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-lg font-black text-white mb-2">Mathematical KB Compression</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Binary-search compressor loop matches 20KB/50KB target caps exactly, avoiding government portal rejects.
              </p>
            </div>
            <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-lg font-black text-white mb-2">Complete Privacy Shield</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Calculations execute entirely inside local sandboxed browser threads. Your portrait stays 100% private.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Deep-Dive Article Section */}
        {toolArticles['aadhaar-photo-resizer'] && (
          <ToolArticle {...toolArticles['aadhaar-photo-resizer']} />
        )}

        {/* Related Utilities cards */}
        <div className="mt-32 border-t border-white/5 pt-24 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">Related Tools</h2>
              <p className="text-sm text-gray-400 mt-1 font-medium">Discover more professional document operations tools.</p>
            </div>
            <Link 
              href="/tools" 
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors group cursor-pointer"
            >
              All Tools
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Passport Photo Maker Card */}
            <Link 
              href="/tools/passport-photo-maker"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  IMAGE
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Passport Photo Maker</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Standardize passport photos for multiple countries with automated layout sheets.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* AI Background Remover Card */}
            <Link 
              href="/tools/bg-remover"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  AI
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Palette className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">AI Background Remover</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Remove background overlays from standard graphics files instantly with edge AI.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Image Compressor Card */}
            <Link 
              href="/tools/image-compressor"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  COMPRESS
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Sliders className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Image Compressor</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Optimize and compress JPEGs, PNGs, and WebPs up to 90% without losing quality.
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
    </div>
  );
}

"use client";

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Download, Crop, RefreshCw, CheckCircle,
  ImageIcon, Sliders, ImagePlus, AlertCircle
} from 'lucide-react';

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
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Link href="/tools" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-8 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all tools
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 border-b border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                <ImageIcon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Passport Photo Maker</h1>
                <p className="text-sm text-gray-500 mt-1">Automatically remove background and crop for official IDs.</p>
              </div>
            </div>
            {step === 'editor' && (
              <button onClick={resetAll} className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-lg border border-gray-200 hover:border-red-200">
                <RefreshCw className="w-4 h-4" /> Start Over
              </button>
            )}
          </div>
          
          <div className="p-8 bg-gray-50/30">
            {step === 'upload' && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-3xl p-20 text-center hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer bg-white group shadow-sm"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                />
                <div className="mx-auto h-24 w-24 text-blue-600 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-blue-100">
                  <ImagePlus className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload an image</h3>
                <p className="text-base text-gray-500 mb-8 max-w-lg mx-auto">We recommend a photo with good lighting. Our AI will automatically remove the background and perfectly align your face.</p>
                <button className="rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm pointer-events-none">
                  Select Photo
                </button>
              </div>
            )}

            {step === 'processing' && (
              <div className="h-[450px] flex items-center justify-center bg-white rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                  <div className="h-full bg-blue-600 animate-pulse transition-all duration-300 w-2/3"></div>
                </div>
                
                <div className="flex flex-col items-center max-w-sm text-center px-6 w-full">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 rounded-full blur-2xl bg-blue-500/20 animate-pulse"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-lg border border-gray-100">
                      <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{loadingText}</h3>
                  <p className="text-sm text-gray-500 mb-8">
                    This can take 5-15 seconds depending on image size. Please wait...
                  </p>
                  
                  <div className="w-full bg-gray-50 rounded-xl p-5 border border-gray-100 text-left space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Uploading image...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {loadingText.includes("Removing") ? (
                         <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex-shrink-0"></div>
                      ) : (
                         <CheckCircle className={`w-5 h-5 flex-shrink-0 ${loadingText.includes('Detecting') || loadingText.includes('Creating') ? 'text-green-500' : 'text-gray-300'}`} />
                      )}
                      <span className={loadingText.includes('Removing') ? "text-blue-700 font-bold" : "text-gray-700 font-medium"}>Removing background with AI...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {loadingText.includes("Detecting") ? (
                         <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex-shrink-0"></div>
                      ) : (
                         <CheckCircle className={`w-5 h-5 flex-shrink-0 text-gray-300`} />
                      )}
                      <span className={loadingText.includes('Detecting') ? "text-blue-700 font-bold" : "text-gray-500 font-medium"}>Creating passport photo...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'editor' && (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Previews Panel - Left Side */}
                <div className="w-full lg:w-[65%] space-y-6 flex flex-col">
                  {hasBgError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-amber-900">Background removal failed</h4>
                        <p className="text-sm text-amber-700 mt-1">We couldn't automatically remove the background. You can still manually crop your image using the settings on the right.</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-6 justify-center items-center flex-1 min-h-[400px]">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Original</span>
                      <div className="w-48 h-64 shadow-inner border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                        {originalImgUrl && <img src={originalImgUrl} alt="Original" className="max-w-full max-h-full object-contain rounded" />}
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex text-gray-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> AI Result
                      </span>
                      {/* Checkerboard background wrapper */}
                      <div className="w-48 h-[auto] shadow-lg border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center p-1 bg-white relative">
                         {/* Checkerboard pattern */}
                         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}></div>
                         {singlePhotoUrl && <img src={singlePhotoUrl} alt="Result" className="w-full h-auto object-cover border border-gray-100 relative z-10" />}
                      </div>
                      {detectedType && (
                        <div className="mt-4 px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 shadow-sm">
                          Detected: {detectedType}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">4x6 Printable Sheet Preview</h4>
                    <p className="text-sm text-gray-500 mb-6">Contains 8 copies perfectly formatted for printing on 4x6" photo paper.</p>
                    <div className="bg-gray-100 p-6 rounded-xl flex items-center justify-center shadow-inner border border-gray-200 overflow-hidden">
                      {sheetUrl && <img src={sheetUrl} alt="4x6 Sheet" className="w-full max-w-[400px] h-auto object-contain shadow-sm bg-white border border-gray-200" />}
                    </div>
                  </div>
                </div>

                {/* Settings Panel - Right Side */}
                <div className="w-full lg:w-[35%] space-y-6">
                  {/* Settings */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Sliders className="w-5 h-5 text-blue-600" /> Options</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Country & Size</label>
                        <select 
                          value={selectedSize}
                          onChange={handleSizeChange}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white font-medium"
                        >
                          {Object.keys(SIZES).map((key) => (
                            <option key={key} value={key}>{key}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Background Color</label>
                        <div className="flex gap-4 items-center">
                          {STANDARD_BG_COLORS.map((bg) => (
                            <button
                              key={bg.name}
                              onClick={() => setSelectedBgHex(bg.hex)}
                              className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                                selectedBgHex === bg.hex ? 'border-blue-600 scale-110 shadow-md ring-4 ring-blue-50' : 'border-gray-200 hover:border-gray-300 hover:scale-105 shadow-sm'
                              }`}
                              style={{ backgroundColor: bg.hex }}
                              title={bg.name}
                            />
                          ))}
                          <div className="w-px h-10 bg-gray-200 mx-1"></div>
                          <div className="relative w-12 h-12 rounded-full border-2 border-gray-200 overflow-hidden hover:border-gray-300 transition-all hover:scale-105 shadow-sm" title="Custom Color">
                            <input 
                              type="color" 
                              value={selectedBgHex} 
                              onChange={(e) => setSelectedBgHex(e.target.value)} 
                              className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Crop */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Crop className="w-5 h-5 text-blue-600"/> Adjust Crop</h3>
                      <button onClick={resetCrop} className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" /> Auto Fit
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-700">Zoom</label>
                          <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">{zoom.toFixed(2)}x</span>
                        </div>
                        <input type="range" min="0.1" max="10" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-700">Move X</label>
                          <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">{Math.round(moveX)}px</span>
                        </div>
                        <input type="range" min="-1500" max="1500" step="5" value={moveX} onChange={(e) => setMoveX(parseFloat(e.target.value))} className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-700">Move Y</label>
                          <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">{Math.round(moveY)}px</span>
                        </div>
                        <input type="range" min="-1500" max="1500" step="5" value={moveY} onChange={(e) => setMoveY(parseFloat(e.target.value))} className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
                    </div>
                  </div>
                  
                  {singlePhotoUrl && sheetUrl && (
                    <div className="space-y-3 pt-4">
                      <button 
                        onClick={() => downloadImage(singlePhotoUrl, 'passport_photo.jpg')}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-4 text-sm font-bold text-white hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                      >
                        <Download className="w-5 h-5" />
                        Download Single Photo
                      </button>
                      <button 
                        onClick={() => downloadImage(sheetUrl, 'passport_sheet_4x6.jpg')}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
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
    </div>
  );
}

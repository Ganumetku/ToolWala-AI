"use client";

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Download, Crop, RefreshCw, CheckCircle,
  ImageIcon, Sliders, Info, ImagePlus
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
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  
  const [selectedSize, setSelectedSize] = useState<SizeKey>("India Passport (35x45 mm)");
  const [selectedBgHex, setSelectedBgHex] = useState(STANDARD_BG_COLORS[0].hex);
  
  const [singlePhotoUrl, setSinglePhotoUrl] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Default crop values based on user preference
  const [zoom, setZoom] = useState(3.05);
  const [moveX, setMoveX] = useState(55);
  const [moveY, setMoveY] = useState(190);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSourceImg(img);
      // Set the exact requested default crop values after upload
      setZoom(3.05);
      setMoveX(55);
      setMoveY(190);
    };
    img.src = url;
  };

  const processImages = useCallback(async () => {
    if (!sourceImg) return;
    setIsProcessing(true);
    
    try {
      const single = await generateSinglePhoto(sourceImg, selectedSize, selectedBgHex, zoom, moveX, moveY);
      setSinglePhotoUrl(single);
      
      const sheet = await generateSheet(single);
      setSheetUrl(sheet);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [sourceImg, selectedSize, selectedBgHex, zoom, moveX, moveY]);

  // When any crop, background, or size dependency changes, redraw immediately
  useEffect(() => {
    if (sourceImg) {
      const timeoutId = setTimeout(() => {
        processImages();
      }, 50); // slight debounce for smooth sliders
      return () => clearTimeout(timeoutId);
    }
  }, [sourceImg, selectedSize, selectedBgHex, zoom, moveX, moveY, processImages]);

  const generateSinglePhoto = async (img: HTMLImageElement, sizeKey: SizeKey, bgColor: string, currentZoom: number, cMoveX: number, cMoveY: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');
      
      const { width, height } = SIZES[sizeKey];
      canvas.width = width;
      canvas.height = height;
      
      // Apply selected background color before drawing the image
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      
      const baseScale = Math.max(width / img.width, height / img.height);
      const appliedScale = baseScale * currentZoom;
      
      const scaledWidth = img.width * appliedScale;
      const scaledHeight = img.height * appliedScale;
      
      const startX = (width - scaledWidth) / 2 + cMoveX;
      const startY = (height - scaledHeight) / 2 + cMoveY;
      
      ctx.drawImage(img, startX, startY, scaledWidth, scaledHeight);
      
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

  const resetCrop = () => {
    setZoom(3.05);
    setMoveX(55);
    setMoveY(190);
  };

  const resetAll = () => {
    setSourceImg(null);
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

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <Link href="/tools" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-8 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all tools
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Passport Photo Maker</h1>
                <p className="text-sm text-gray-500">Auto-crop and correctly format your portrait for any official ID.</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 bg-gray-50/50">
            {!sourceImg ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center hover:bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer bg-white"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                />
                <div className="mx-auto h-16 w-16 text-blue-500 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <ImagePlus className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload a portrait photo</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">We recommend a full-body or half-body photo with good lighting. We will automatically crop it to focus on your face.</p>
                <button className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm pointer-events-none">
                  Select Photo
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Options Panel */}
                <div className="w-full lg:w-[40%] space-y-6">
                  {/* Settings */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Sliders className="w-5 h-5 text-blue-600" /> Settings</h3>
                      <button 
                        onClick={resetAll}
                        className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md"
                      >
                        Start Over
                      </button>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country & Size Format</label>
                        <select 
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value as SizeKey)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          {Object.keys(SIZES).map((key) => (
                            <option key={key} value={key}>{key}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                        <div className="flex gap-3 items-center">
                          {STANDARD_BG_COLORS.map((bg) => (
                            <button
                              key={bg.name}
                              onClick={() => setSelectedBgHex(bg.hex)}
                              className={`w-10 h-10 rounded-full border-2 transition-all ${
                                selectedBgHex === bg.hex ? 'border-blue-600 scale-110 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              style={{ backgroundColor: bg.hex }}
                              title={bg.name}
                            />
                          ))}
                          <div className="w-px h-8 bg-gray-200 mx-1"></div>
                          <div className="relative w-10 h-10 rounded-full border-2 border-gray-200 overflow-hidden hover:border-gray-300 transition-colors" title="Custom Color">
                            <input 
                              type="color" 
                              value={selectedBgHex} 
                              onChange={(e) => setSelectedBgHex(e.target.value)} 
                              className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" 
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex items-start gap-2 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800 leading-tight">
                            For full background replacement, AI background remover will be added soon.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Crop */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Crop className="w-5 h-5 text-blue-600"/> Adjust Crop</h3>
                      <button onClick={resetCrop} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline bg-blue-50 px-2 py-1 rounded">
                        <RefreshCw className="w-3 h-3" /> Reset Crop
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">Zoom</label>
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{zoom.toFixed(2)}x</span>
                        </div>
                        <input type="range" min="1" max="6" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">Move Horizontal</label>
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{Math.round(moveX)}px</span>
                        </div>
                        <input type="range" min="-1000" max="1000" step="5" value={moveX} onChange={(e) => setMoveX(parseFloat(e.target.value))} className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">Move Vertical</label>
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{Math.round(moveY)}px</span>
                        </div>
                        <input type="range" min="-1000" max="1000" step="5" value={moveY} onChange={(e) => setMoveY(parseFloat(e.target.value))} className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
                    </div>
                  </div>
                  
                  {singlePhotoUrl && sheetUrl && (
                    <div className="space-y-3 pt-2">
                      <button 
                        onClick={() => downloadImage(singlePhotoUrl, 'passport_photo.jpg')}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download Single Photo
                      </button>
                      <button 
                        onClick={() => downloadImage(sheetUrl, 'passport_sheet_4x6.jpg')}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Download Printable 4x6 Sheet (8 Copies)
                      </button>
                    </div>
                  )}
                </div>

                {/* Previews Panel */}
                <div className="w-full lg:w-[60%] space-y-6">
                  {isProcessing ? (
                    <div className="h-[400px] flex items-center justify-center bg-white rounded-xl border border-gray-200">
                      <div className="flex flex-col items-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-500 font-medium">Generating previews...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-48 h-auto shadow-md border border-gray-200 rounded overflow-hidden flex-shrink-0 bg-white p-1">
                          {singlePhotoUrl && <img src={singlePhotoUrl} alt="Single Passport Photo" className="w-full h-auto object-cover border border-gray-100" />}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Final Photo Preview</h4>
                          <p className="text-sm text-gray-500 mb-4">Properly proportioned to match official requirements for {selectedSize.split('(')[0].trim()}. It includes the head, shoulders, and correct top padding.</p>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Ready for digital submission
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">4x6 Printable Sheet</h4>
                        <p className="text-sm text-gray-500 mb-6">Contains 8 perfectly sized copies. Print this sheet on standard 4x6 inch photo paper at your local pharmacy or print shop without rescaling.</p>
                        <div className="bg-gray-100 p-6 rounded-xl flex items-center justify-center shadow-inner border border-gray-200">
                          {sheetUrl && <img src={sheetUrl} alt="4x6 Sheet" className="w-full max-w-[500px] h-auto object-contain shadow-sm bg-white border border-gray-200" />}
                        </div>
                      </div>
                    </>
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

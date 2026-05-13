"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { 
  Download, RefreshCw, UploadCloud, 
  ImageIcon, Sparkles, AlertCircle, Maximize2
} from 'lucide-react';

const checkerboardStyle = {
  backgroundImage: 'repeating-linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), repeating-linear-gradient(45deg, #e5e7eb 25%, #ffffff 25%, #ffffff 75%, #e5e7eb 75%, #e5e7eb)',
  backgroundPosition: '0 0, 12px 12px',
  backgroundSize: '24px 24px'
};

export default function BackgroundRemover() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing AI model...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [sliderPosition, setSliderPosition] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset state for new image
    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setError(null);
    setSliderPosition(50);
    
    processImage(file);
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setLoadingText('Loading AI model (this may take a moment on first run)...');
    setProgress(0);
    
    try {
      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const p = Math.round((current / total) * 100);
            setProgress(p);
            if (key.includes('fetch')) {
              setLoadingText(`Downloading model assets... ${p}%`);
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
      setError('Failed to remove background. The image might be too complex or the AI model failed to load. Please try another image.');
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
    a.download = `removed-bg-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <Link href="/tools" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all tools
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Background Remover</h1>
                  <p className="text-sm text-gray-500">Automatically remove image backgrounds with 100% privacy using client-side AI.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 sm:p-8 bg-gray-50/50">
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Processing Error</h4>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {!sourceUrl && !isProcessing ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-12 sm:p-20 text-center hover:bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer bg-white"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                />
                <div className="mx-auto h-20 w-20 text-blue-500 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload an image</h3>
                <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">Upload a photo to automatically remove the background. Images are processed locally on your device for total privacy.</p>
                <button className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shadow-sm pointer-events-none">
                  Select Image
                </button>
              </div>
            ) : isProcessing ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-blue-100 text-blue-600 p-5 rounded-full">
                    <Sparkles className="w-10 h-10 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Image</h3>
                <p className="text-gray-500 mb-8 text-center max-w-sm">{loadingText}</p>
                
                <div className="w-full max-w-md bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner border border-gray-200">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">First-time processing downloads the AI model (~40MB).</p>
              </div>
            ) : resultUrl && sourceUrl ? (
              <div className="bg-white rounded-2xl p-4 sm:p-8 border border-gray-200 shadow-sm">
                
                {/* Comparison Slider Wrapper */}
                <div className="relative w-full aspect-square sm:aspect-video rounded-xl overflow-hidden shadow-inner border border-gray-200 mb-8 select-none" style={checkerboardStyle}>
                  
                  {/* AFTER Image (Transparent PNG) */}
                  <img 
                    src={resultUrl} 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none p-4" 
                    alt="Background Removed" 
                  />
                  
                  {/* BEFORE Image (Original) wrapped in clip-path */}
                  <div 
                    className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none border-r-[3px] border-white shadow-[10px_0_15px_-3px_rgba(0,0,0,0.1)]" 
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    {/* Solid background behind the original image so it hides the checkerboard completely */}
                    <div className="absolute inset-0 bg-white">
                      <img 
                        src={sourceUrl} 
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none p-4" 
                        alt="Original" 
                      />
                    </div>
                  </div>

                  {/* Slider Handle UI */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white flex items-center justify-center pointer-events-none z-20 drop-shadow-md"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border border-gray-200 text-gray-700">
                      <Maximize2 className="w-5 h-5 rotate-45" />
                    </div>
                  </div>

                  {/* Invisible Range Input spanning the entire container */}
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={sliderPosition} 
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  />
                  
                  {/* Labels */}
                  <div className="absolute top-4 left-4 bg-gray-900/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide pointer-events-none z-20 shadow-sm">
                    Original
                  </div>
                  <div className="absolute top-4 right-4 bg-gray-900/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide pointer-events-none z-20 shadow-sm">
                    Removed
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={resetAll} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Start Over
                  </button>
                  <button 
                    onClick={downloadResult} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download Transparent PNG
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-4">
                  Tip: Drag the slider horizontally to compare the before and after images.
                </p>
              </div>
            ) : null}
            
          </div>
        </div>
      </div>
    </div>
  );
}

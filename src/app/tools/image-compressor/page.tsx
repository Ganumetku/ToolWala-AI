"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';

export default function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateReduction = () => {
    if (!originalFile || !compressedFile) return 0;
    return ((originalFile.size - compressedFile.size) / originalFile.size) * 100;
  };

  const getMaxSizeForQuality = (quality: number) => {
    if (quality <= 10) return 0.08;
    if (quality <= 20) return 0.15;
    if (quality <= 40) return 0.3;
    if (quality <= 60) return 0.6;
    if (quality <= 80) return 1;
    return 2;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset previous states
    setCompressedFile(null);
    setWarningMessage(null);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedUrl(null);
    
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
  };

  const compressImage = async () => {
    if (!originalFile) return;
    
    setIsCompressing(true);
    setWarningMessage(null);
    
    try {
      const initialMaxSizeMB = getMaxSizeForQuality(compressionQuality);
      const initialQuality = compressionQuality / 100;

      let options = {
        maxSizeMB: initialMaxSizeMB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: initialQuality,
      };
      
      let compressedBlob = await imageCompression(originalFile, options);
      
      // Retry with stricter options if compressed file is still bigger or almost same size
      const firstReduction = ((originalFile.size - compressedBlob.size) / originalFile.size) * 100;
      
      if (firstReduction < 5) {
        options = {
          maxSizeMB: Math.max(0.03, initialMaxSizeMB / 2),
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: Math.max(0.05, compressionQuality / 200),
        };
        
        const stricterBlob = await imageCompression(originalFile, options);
        if (stricterBlob.size < compressedBlob.size) {
          compressedBlob = stricterBlob;
        }
      }

      const finalReduction = ((originalFile.size - compressedBlob.size) / originalFile.size) * 100;
      if (finalReduction <= 0) {
        setWarningMessage("Image is already highly optimized. Further compression wasn't effective.");
      }
      
      const compressedImageFile = new File([compressedBlob], `compressed_${originalFile.name}`, {
        type: compressedBlob.type,
      });
      
      setCompressedFile(compressedImageFile);
      setCompressedUrl(URL.createObjectURL(compressedBlob));
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Error compressing image. Please try another file.');
    } finally {
      setIsCompressing(false);
    }
  };

  const resetAll = () => {
    setOriginalFile(null);
    setCompressedFile(null);
    setWarningMessage(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setOriginalUrl(null);
    setCompressedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadImage = () => {
    if (!compressedUrl || !compressedFile) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    a.download = compressedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reductionValue = calculateReduction();

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <Link href="/tools" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-8 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all tools
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                📉
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Image Compressor</h1>
                <p className="text-sm text-gray-500">Compress images up to 90% without losing visible quality.</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 bg-gray-50/50">
            {!originalFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                />
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Upload image to compress</h3>
                <p className="text-xs text-gray-500">JPG, PNG or WebP up to 20MB</p>
                
                <button className="mt-6 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors pointer-events-none">
                  Select Image
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900">Compression Settings</h4>
                    <button 
                      onClick={resetAll}
                      className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Clear & Upload New
                    </button>
                  </div>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">Target Quality</label>
                        <span className="text-sm font-semibold text-blue-600">{compressionQuality}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={compressionQuality}
                        onChange={(e) => setCompressionQuality(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                      />
                      <p className="text-xs text-gray-500 mt-2">Lower quality = smaller file size but more visual degradation</p>
                    </div>
                    <button 
                      onClick={compressImage}
                      disabled={isCompressing}
                      className="w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
                    >
                      {isCompressing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Compressing...
                        </>
                      ) : (
                        'Compress Image'
                      )}
                    </button>
                  </div>
                </div>

                {warningMessage && (
                  <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-xl border border-yellow-200 flex items-start">
                    <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{warningMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original Image */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Original</span>
                      <span className="text-xs font-mono bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {formatSize(originalFile.size)}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex items-center justify-center bg-gray-50">
                      {originalUrl && (
                        <img src={originalUrl} alt="Original" className="max-h-[300px] object-contain shadow-sm rounded border border-gray-200" />
                      )}
                    </div>
                  </div>

                  {/* Compressed Image */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative">
                    <div className="bg-blue-50 p-3 border-b border-blue-100 flex justify-between items-center">
                      <span className="text-sm font-semibold text-blue-800">Compressed</span>
                      {compressedFile && (
                        <div className="flex items-center gap-2">
                          {reductionValue > 0 ? (
                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                              -{reductionValue.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              No reduction
                            </span>
                          )}
                          <span className="text-xs font-mono bg-blue-200 text-blue-800 px-2 py-1 rounded">
                            {formatSize(compressedFile.size)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex items-center justify-center bg-gray-50 relative">
                      {compressedUrl ? (
                        <img src={compressedUrl} alt="Compressed" className="max-h-[300px] object-contain shadow-sm rounded border border-gray-200" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">Click compress to see preview</span>
                        </div>
                      )}
                    </div>
                    {compressedUrl && (
                      <div className="p-4 border-t border-gray-200 bg-white">
                        <button 
                          onClick={downloadImage}
                          className="w-full flex items-center justify-center rounded-full bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Compressed Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

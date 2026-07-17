"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { formatBytes } from '@/lib/utils/format';

const SIZE_GUIDES = [
  { label: '20KB', slug: 'compress-image-to-20kb', desc: 'SSC / UPSC / NDA' },
  { label: '50KB', slug: 'compress-image-to-50kb', desc: 'IBPS / SBI / Bank PO' },
  { label: '100KB', slug: 'compress-image-to-100kb', desc: 'NEET / JEE / CUET' },
  { label: '200KB', slug: 'compress-image-to-200kb', desc: 'IGNOU / University' },
  { label: '300KB', slug: 'compress-image-to-300kb', desc: 'EPFO / PAN Card' },
  { label: '500KB', slug: 'compress-image-to-500kb', desc: 'Visa / Embassy' },
  { label: '1MB', slug: 'compress-image-to-1mb', desc: 'Social Media / General' },
];

export default function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          <div className="p-8 sm:p-10 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Image Compressor</h1>
                <p className="text-gray-400 font-medium mt-1">Compress images up to 90% without losing visible quality.</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 sm:p-10">
            {!originalFile ? (
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
                  <div className="mx-auto h-20 w-20 text-blue-500 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Drop image here or click to upload</h3>
                  <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">Supports JPG, PNG, and WebP up to 20MB. All processing happens safely in your browser.</p>
                  
                  <button className="rounded-2xl bg-blue-600 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] pointer-events-none">
                    Select Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="glass p-8 rounded-[2rem] border border-white/5">
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                    <h4 className="text-xl font-black text-white tracking-tight">Compression Settings</h4>
                    <button 
                      onClick={resetAll}
                      className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors"
                    >
                      Reset & Upload New
                    </button>
                  </div>
                  <div className="space-y-8 max-w-xl">
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Quality</label>
                        <span className="text-xl font-black text-blue-500">{compressionQuality}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={compressionQuality}
                        onChange={(e) => setCompressionQuality(Number(e.target.value))}
                        className="w-full h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600" 
                      />
                      <p className="text-xs text-gray-500 font-medium italic">Hint: 70-80% usually offers the best balance of size and visual clarity.</p>
                    </div>
                    <button 
                      onClick={compressImage}
                      disabled={isCompressing}
                      className="w-full sm:w-auto rounded-2xl bg-blue-600 px-12 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98]"
                    >
                      {isCompressing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                          </svg>
                          Compress Image Now
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {warningMessage && (
                  <div className="p-6 bg-amber-500/10 text-amber-500 text-sm font-bold rounded-[1.5rem] border border-amber-500/20 flex items-start gap-4">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{warningMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Original Image */}
                  <div className="glass rounded-[2rem] border border-white/5 overflow-hidden flex flex-col shadow-2xl relative group">
                    <div className="absolute top-4 right-4 z-20">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/50 bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                        {formatBytes(originalFile.size)}
                      </span>
                    </div>
                    <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Original Source</span>
                    </div>
                    <div className="p-6 flex-1 flex items-center justify-center bg-[#030712]/50 min-h-[350px]">
                      {originalUrl && (
                        <img src={originalUrl} alt="Original" className="max-h-[300px] w-full object-contain shadow-2xl rounded-2xl transition-transform group-hover:scale-105" />
                      )}
                    </div>
                  </div>

                  {/* Compressed Image */}
                  <div className="glass rounded-[2rem] border border-white/5 overflow-hidden flex flex-col shadow-2xl relative group">
                    <div className="absolute top-4 right-4 z-20 flex gap-3">
                      {compressedFile && reductionValue > 0 && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-4 py-2 rounded-xl backdrop-blur-md border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                          -{reductionValue.toFixed(1)}% Smaller
                        </span>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/20 px-4 py-2 rounded-xl backdrop-blur-md border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                        {compressedFile ? formatBytes(compressedFile.size) : 'Ready'}
                      </span>
                    </div>
                    <div className="bg-blue-600/5 p-4 border-b border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">AI Result</span>
                    </div>
                    <div className="p-6 flex-1 flex items-center justify-center bg-[#030712]/50 min-h-[350px] relative">
                      {compressedUrl ? (
                        <img src={compressedUrl} alt="Compressed" className="max-h-[300px] w-full object-contain shadow-2xl rounded-2xl animate-fade-in" />
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <svg className="h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Preview will appear here</span>
                        </div>
                      )}
                    </div>
                    {compressedUrl && (
                      <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                        <button 
                          onClick={downloadImage}
                          className="w-full flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-[0.98]"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Optimized Image
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

      {/* Internal: Size-Specific Compression Guides */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mt-16">
        <div className="glass rounded-[2rem] border border-white/5 p-8 sm:p-10">
          <div className="mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Compress to Exact Size</span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">Size-Specific Compression Guides</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Find the right guide for your exam or portal requirement.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SIZE_GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/landing/${guide.slug}`}
                className="group flex flex-col gap-1 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-blue-500/30 hover:bg-blue-500/[0.04] p-5 transition-all"
              >
                <span className="text-2xl font-black text-blue-400 group-hover:text-blue-300 transition-colors">
                  {guide.label}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors line-clamp-1">
                  {guide.desc}
                </span>
                <span className="text-[10px] text-gray-600 group-hover:text-blue-400 transition-colors mt-1 font-semibold">
                  View Guide →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['image-compressor']} />
    </div>
  );

}

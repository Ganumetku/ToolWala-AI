"use client";

import { useState, useRef } from 'react';
import {
  Upload, Download, CheckCircle, RefreshCw,
  ShieldCheck, ArrowRight, Sparkles, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface LandingPresetCompressorProps {
  targetKB: number;
  mode: 'photo' | 'signature';
  title?: string;
  description?: string;
  fullToolHref: string;
  fullToolLabel: string;
}

export default function LandingPresetCompressor({
  targetKB,
  mode,
  title,
  description,
  fullToolHref,
  fullToolLabel
}: LandingPresetCompressorProps) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const compressToTarget = async (file: File, maxKB: number): Promise<File | null> => {
    return new Promise((resolve) => {
      const maxBytes = maxKB * 1024;

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        if (width <= 0 || height <= 0) {
          setErrorMessage('Invalid image dimensions detected.');
          resolve(null);
          return;
        }

        // Maintain strict aspect ratio while establishing sensible initial bounds
        const maxDimension = mode === 'signature' ? 800 : 1200;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Fill background white to handle PNG transparency cleanly without black box artifacts
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }

        let minQuality = 0.1;
        let maxQuality = 0.95;
        let bestBlob: Blob | null = null;
        let attempts = 0;

        const tryEncode = (q: number) => {
          canvas.toBlob((blob) => {
            attempts++;
            if (!blob) {
              resolve(file);
              return;
            }

            if (blob.size <= maxBytes) {
              bestBlob = blob;
              minQuality = q;
            } else {
              maxQuality = q;
            }

            // Binary search iterations
            if (attempts < 6 && (maxQuality - minQuality) > 0.08) {
              tryEncode((minQuality + maxQuality) / 2);
            } else if (bestBlob) {
              const ext = file.name.replace(/\.[^/.]+$/, "");
              const resultFile = new File([bestBlob], `${ext}_under_${maxKB}kb.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(resultFile);
            } else {
              // If still over target at lowest quality, scale dimensions down proportionally (strictly preserving aspect ratio)
              const scaleDownFactor = 0.75;
              const newW = Math.max(60, Math.round(canvas.width * scaleDownFactor));
              const newH = Math.max(30, Math.round((canvas.height * newW) / canvas.width));
              canvas.width = newW;
              canvas.height = newH;

              if (ctx) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              }

              canvas.toBlob((scaledBlob) => {
                if (scaledBlob) {
                  const ext = file.name.replace(/\.[^/.]+$/, "");
                  resolve(new File([scaledBlob], `${ext}_under_${maxKB}kb.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  }));
                } else {
                  resolve(file);
                }
              }, 'image/jpeg', 0.55);
            }
          }, 'image/jpeg', q);
        };

        // If input is already under target, try a high-quality encode first
        tryEncode(file.size <= maxBytes ? 0.92 : 0.85);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setErrorMessage('Unable to process image. File may be corrupted or in an unsupported format.');
        resolve(null);
      };

      img.src = objectUrl;
    });
  };

  const handleFile = async (file: File) => {
    setErrorMessage(null);

    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/i) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setErrorMessage('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    if (originalUrl) URL.revokeObjectURL(originalUrl);

    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setIsProcessing(true);

    try {
      const result = await compressToTarget(file, targetKB);
      if (result) {
        setCompressedFile(result);
        setCompressedUrl(URL.createObjectURL(result));
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Error occurred during client-side compression.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalFile(null);
    setOriginalUrl(null);
    setCompressedFile(null);
    setCompressedUrl(null);
    setErrorMessage(null);
    setIsProcessing(false);
  };

  const isTargetAchieved = Boolean(compressedFile && compressedFile.size <= targetKB * 1024);

  return (
    <div className="w-full bg-[#FBFCFE] dark:bg-[#070b14] border border-[#E6ECF5] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl mb-10 transition-all">
      {/* Title & Target Spec */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6ECF5] dark:border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Interactive Tool Workspace
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {title || (mode === 'photo' ? `Compress Photo to Under ${targetKB}KB` : `Resize Signature to Under ${targetKB}KB`)}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium mt-0.5">
            {description || `Upload your file. Client-side compression targets under ${targetKB}KB without uploading to any server.`}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-black shrink-0">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Target Limit: ≤ {targetKB} KB
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-3 text-red-700 dark:text-red-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div className="pt-6">
        {!originalFile ? (
          /* Dropzone */
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl py-12 px-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 scale-[1.01]'
                : 'border-slate-300 dark:border-white/10 hover:border-blue-400 bg-white dark:bg-white/[0.02]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 dark:bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Drop {mode === 'photo' ? 'your photo' : 'your signature'} here, or <span className="text-blue-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
              JPG, PNG, or WebP. Processed directly in your browser.
            </p>
          </div>
        ) : isProcessing ? (
          /* Processing State */
          <div className="py-12 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Optimizing image to fit under {targetKB}KB...
            </p>
            <p className="text-xs text-slate-500 mt-1">Balancing visual clarity and byte compression</p>
          </div>
        ) : compressedFile && compressedUrl ? (
          /* Result & Download State */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original Preview */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Original File</span>
                <div className="mt-2 h-44 rounded-xl bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/5 flex items-center justify-center overflow-hidden p-2">
                  <img src={originalUrl || ''} alt="Original" className="max-h-full max-w-full object-contain rounded-lg" />
                </div>
                <div className="mt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium truncate max-w-[150px]">{originalFile.name}</span>
                  <span className="font-bold text-slate-700 dark:text-gray-300">{formatSize(originalFile.size)}</span>
                </div>
              </div>

              {/* Compressed Preview */}
              <div className={`p-4 rounded-2xl border relative ${
                isTargetAchieved
                  ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5'
                  : 'border-amber-200 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-500/5'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    isTargetAchieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {isTargetAchieved ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> Target achieved
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" /> Output exceeds target
                      </>
                    )}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isTargetAchieved
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  }`}>
                    {isTargetAchieved ? `≤ ${targetKB}KB` : `> ${targetKB}KB`}
                  </span>
                </div>

                <div className="mt-2 h-44 rounded-xl bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden p-2">
                  <img src={compressedUrl} alt="Compressed" className="max-h-full max-w-full object-contain rounded-lg" />
                </div>

                <div className="mt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-gray-400 font-medium">Output Size:</span>
                  <span className={`font-black text-sm ${
                    isTargetAchieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {formatSize(compressedFile.size)}
                  </span>
                </div>
              </div>
            </div>

            {/* Accurate Output-Size Statement & Download Action */}
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border ${
              isTargetAchieved
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
            }`}>
              <div className="flex items-center gap-3">
                {isTargetAchieved ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <div className="text-xs">
                  <p className={`font-bold ${isTargetAchieved ? 'text-emerald-900 dark:text-emerald-300' : 'text-amber-900 dark:text-amber-300'}`}>
                    {isTargetAchieved
                      ? `Target achieved – Image is under ${targetKB}KB (${formatSize(compressedFile.size)})`
                      : `Output file is ${formatSize(compressedFile.size)} (Target: < ${targetKB}KB)`}
                  </p>
                  <p className={`${isTargetAchieved ? 'text-emerald-700 dark:text-emerald-400/80' : 'text-amber-700 dark:text-amber-400/80'} font-medium`}>
                    {isTargetAchieved
                      ? `File size reduced to meet the under ${targetKB}KB requirement.`
                      : `Try reducing original dimensions or cropping the image before compressing.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={compressedUrl}
                  download={compressedFile.name}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download File
                </a>
                <button
                  onClick={reset}
                  className="px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                  title="Process another image"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer info & Link to full cropping tool */}
        <div className="mt-6 pt-4 border-t border-[#E6ECF5] dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Client-Side: File is processed in device RAM and never uploaded.
          </span>
          <Link
            href={fullToolHref}
            className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {fullToolLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

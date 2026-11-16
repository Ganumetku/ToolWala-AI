"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop, RotateCw, RotateCcw, Check, X, Maximize2,
  Sparkles, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';

interface CardCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  cardLabel: 'Front' | 'Back';
  onClose: () => void;
  onApplyCrop: (croppedDataUrl: string) => void;
  onSkipCrop: () => void;
}

type HandleType = 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r';

export default function CardCropModal({
  isOpen,
  imageSrc,
  cardLabel,
  onClose,
  onApplyCrop,
  onSkipCrop
}: CardCropModalProps) {
  const [rotation, setRotation] = useState<number>(0);
  const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 5,
    y: 8,
    w: 90,
    h: 84
  });
  const [aspectLock, setAspectLock] = useState<'free' | 'cr80'>('free');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeHandleRef = useRef<HandleType | null>(null);
  const startPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startCropRef = useRef<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });

  // Reset crop when modal opens with new image
  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setCrop({ x: 5, y: 8, w: 90, h: 84 });
      setAspectLock('free');
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  // Rotate handlers
  const handleRotate = (delta: number) => {
    setRotation((prev) => (prev + delta + 360) % 360);
  };

  // Reset to full view
  const handleResetCrop = () => {
    setCrop({ x: 0, y: 0, w: 100, h: 100 });
  };

  // Pointer drag start
  const handlePointerDown = (e: React.PointerEvent, handle: HandleType) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    activeHandleRef.current = handle;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    startCropRef.current = { ...crop };
  };

  // Pointer drag move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeHandleRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dxPct = ((e.clientX - startPointerRef.current.x) / rect.width) * 100;
    const dyPct = ((e.clientY - startPointerRef.current.y) / rect.height) * 100;

    const s = startCropRef.current;
    let newX = s.x;
    let newY = s.y;
    let newW = s.w;
    let newH = s.h;

    const handle = activeHandleRef.current;

    if (handle === 'move') {
      newX = Math.max(0, Math.min(100 - s.w, s.x + dxPct));
      newY = Math.max(0, Math.min(100 - s.h, s.y + dyPct));
    } else {
      if (handle.includes('l')) {
        const maxX = s.x + s.w - 8;
        newX = Math.max(0, Math.min(maxX, s.x + dxPct));
        newW = s.w - (newX - s.x);
      }
      if (handle.includes('r')) {
        const maxW = 100 - s.x;
        newW = Math.max(8, Math.min(maxW, s.w + dxPct));
      }
      if (handle.includes('t')) {
        const maxY = s.y + s.h - 8;
        newY = Math.max(0, Math.min(maxY, s.y + dyPct));
        newH = s.h - (newY - s.y);
      }
      if (handle.includes('b')) {
        const maxH = 100 - s.y;
        newH = Math.max(8, Math.min(maxH, s.h + dyPct));
      }

      // If CR80 aspect locked (85.6 : 54)
      if (aspectLock === 'cr80') {
        const containerAspect = rect.width / rect.height;
        const targetAspect = 85.6 / 54; // ~1.585
        // Adjust height in percentage based on width percentage
        newH = Math.max(8, Math.min(100 - newY, (newW * containerAspect) / targetAspect));
      }
    }

    setCrop({
      x: Math.round(newX * 10) / 10,
      y: Math.round(newY * 10) / 10,
      w: Math.round(newW * 10) / 10,
      h: Math.round(newH * 10) / 10
    });
  };

  // Pointer drag end
  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeHandleRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      activeHandleRef.current = null;
    }
  };

  // Finalize & export crop at 100% original full pixel resolution
  const handleConfirm = () => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const rot = (rotation % 360 + 360) % 360;
      const isSideways = rot === 90 || rot === 270;

      // 1. Orient raw canvas with rotation
      const rotCanvas = document.createElement('canvas');
      rotCanvas.width = isSideways ? img.naturalHeight : img.naturalWidth;
      rotCanvas.height = isSideways ? img.naturalWidth : img.naturalHeight;
      const rotCtx = rotCanvas.getContext('2d');
      if (!rotCtx) return;

      rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
      rotCtx.rotate((rot * Math.PI) / 180);
      rotCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      // 2. Crop target pixel region
      const fullW = rotCanvas.width;
      const fullH = rotCanvas.height;

      const pxX = Math.max(0, Math.round((crop.x / 100) * fullW));
      const pxY = Math.max(0, Math.round((crop.y / 100) * fullH));
      const pxW = Math.min(fullW - pxX, Math.round((crop.w / 100) * fullW));
      const pxH = Math.min(fullH - pxY, Math.round((crop.h / 100) * fullH));

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = Math.max(1, pxW);
      finalCanvas.height = Math.max(1, pxH);
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) return;

      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';
      finalCtx.drawImage(rotCanvas, pxX, pxY, pxW, pxH, 0, 0, pxW, pxH);

      const croppedUrl = finalCanvas.toDataURL('image/png', 1.0);
      onApplyCrop(croppedUrl);
    };
    img.src = imageSrc;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Crop {cardLabel} Side Card
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                Drag corners to remove table background and extra borders.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 text-xs">
          
          {/* Crop Ratio Mode */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 mr-1">Crop Shape:</span>
            <button
              type="button"
              onClick={() => setAspectLock('free')}
              className={`px-3 py-1.5 font-bold rounded-lg border transition-all cursor-pointer ${
                aspectLock === 'free'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-blue-400'
              }`}
            >
              Free Drag (Custom)
            </button>
            <button
              type="button"
              onClick={() => {
                setAspectLock('cr80');
                setCrop({ x: 10, y: 15, w: 80, h: 50 });
              }}
              className={`px-3 py-1.5 font-bold rounded-lg border transition-all cursor-pointer ${
                aspectLock === 'cr80'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-blue-400'
              }`}
            >
              ID Card (85.6 x 54)
            </button>
          </div>

          {/* Rotate & Reset Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleRotate(-90)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1 font-semibold text-[11px]"
              title="Rotate Left 90°"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Left 90°</span>
            </button>
            <button
              type="button"
              onClick={() => handleRotate(90)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1 font-semibold text-[11px]"
              title="Rotate Right 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Right 90°</span>
            </button>
            <button
              type="button"
              onClick={handleResetCrop}
              className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/10 transition-colors font-semibold text-[11px]"
              title="Select Full Image"
            >
              Full Image
            </button>
          </div>
        </div>

        {/* Cropper Viewport Area */}
        <div className="relative flex-1 min-h-[320px] max-h-[55vh] p-4 sm:p-6 bg-slate-900/95 flex items-center justify-center overflow-hidden select-none">
          
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative max-w-full max-h-[48vh] flex items-center justify-center touch-none"
          >
            {/* The Image being cropped */}
            <img
              src={imageSrc}
              alt="Crop target"
              className="max-w-full max-h-[48vh] object-contain pointer-events-none transition-transform duration-200"
              style={{
                transform: `rotate(${rotation}deg)`
              }}
            />

            {/* Dark mask overlay outside the crop box */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `0 0 0 9999px rgba(15, 23, 42, 0.65)`
              }}
            />

            {/* Interactive Crop Box */}
            <div
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.w}%`,
                height: `${crop.h}%`,
              }}
              className="absolute border-2 border-blue-400 bg-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.7)] cursor-move touch-none z-10"
              onPointerDown={(e) => handlePointerDown(e, 'move')}
            >
              {/* 3x3 Rule of Thirds Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div className="border-r border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div className="border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div className="border-b border-white/60"></div>
                <div className="border-r border-white/60"></div>
                <div className="border-r border-white/60"></div>
                <div></div>
              </div>

              {/* Corner Handles */}
              {/* Top-Left */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'tl')}
                className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-blue-600 rounded-md shadow-md cursor-nwse-resize z-20 hover:scale-125 transition-transform"
              />
              {/* Top-Right */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'tr')}
                className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-blue-600 rounded-md shadow-md cursor-nesw-resize z-20 hover:scale-125 transition-transform"
              />
              {/* Bottom-Left */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'bl')}
                className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-blue-600 rounded-md shadow-md cursor-nesw-resize z-20 hover:scale-125 transition-transform"
              />
              {/* Bottom-Right */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'br')}
                className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-blue-600 rounded-md shadow-md cursor-nwse-resize z-20 hover:scale-125 transition-transform"
              />

              {/* Edge Handles */}
              {/* Top Center */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 't')}
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white border border-blue-600 rounded-full shadow-sm cursor-ns-resize z-20 hover:scale-110 transition-transform"
              />
              {/* Bottom Center */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'b')}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white border border-blue-600 rounded-full shadow-sm cursor-ns-resize z-20 hover:scale-110 transition-transform"
              />
              {/* Left Center */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'l')}
                className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-8 bg-white border border-blue-600 rounded-full shadow-sm cursor-ew-resize z-20 hover:scale-110 transition-transform"
              />
              {/* Right Center */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'r')}
                className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-8 bg-white border border-blue-600 rounded-full shadow-sm cursor-ew-resize z-20 hover:scale-110 transition-transform"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="text-[11px] text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>High-precision lossless crop. Processed entirely inside your browser.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onSkipCrop}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-white/15 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              Skip (Use Full Image)
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply Crop</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

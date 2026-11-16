"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  IdCard, Upload, RotateCw, RotateCcw, Trash2, Download, Printer,
  Layers, CheckCircle2, Shield, Sparkles, FileText, Settings2,
  RefreshCw, Scissors, Eye, Image as ImageIcon, ZoomIn, ZoomOut,
  Maximize2, MoveVertical, Sparkle
} from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';
import ToolArticle from '@/components/ToolArticle';
import WorkflowRecommendations from '@/components/tools/WorkflowRecommendations';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolArticles } from '@/data/toolArticles';

type LayoutMode = 'a4-stacked' | 'side-by-side' | '4x6-pvc';
type CardSizing = 'cr80' | 'proportional';
type PagePlacement = 'center' | 'top';

// Standard CR80 Dimensions in mm (Credit / ID card standard)
const CR80_WIDTH_MM = 85.60;
const CR80_HEIGHT_MM = 53.98;

export default function MergeIdFrontAndBackPage() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [frontRotation, setFrontRotation] = useState<number>(0);
  const [backRotation, setBackRotation] = useState<number>(0);
  const [frontZoom, setFrontZoom] = useState<number>(1.0); // 1.0 to 2.0
  const [backZoom, setBackZoom] = useState<number>(1.0); // 1.0 to 2.0

  // Layout & Sizing Settings
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('a4-stacked');
  const [cardWidthMm, setCardWidthMm] = useState<number>(CR80_WIDTH_MM); // Adjustable card width
  const [cardSizing, setCardSizing] = useState<CardSizing>('cr80');
  const [pagePlacement, setPagePlacement] = useState<PagePlacement>('center');
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [showCornerGuides, setShowCornerGuides] = useState<boolean>(true);
  const [spacingMm, setSpacingMm] = useState<number>(10);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);

  // PDF.js for PDF uploads
  const [pdfjs, setPdfjs] = useState<any>(null);

  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        const lib = await import('pdfjs-dist');
        lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        setPdfjs(lib);
      } catch (e) {
        // Fallback or ignore if not uploading PDF
      }
    };
    loadPdfjs();
  }, []);

  // Helper to read file as image data URL
  const processUpload = async (file: File, target: 'front' | 'back') => {
    if (file.type === 'application/pdf') {
      if (!pdfjs) {
        toast.error("PDF engine initializing, please wait a moment.");
        return;
      }
      try {
        const buffer = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        
        // Render Page 1 to target
        const page1 = await doc.getPage(1);
        const viewport1 = page1.getViewport({ scale: 2.0 });
        const canvas1 = document.createElement('canvas');
        canvas1.width = viewport1.width;
        canvas1.height = viewport1.height;
        const ctx1 = canvas1.getContext('2d');
        await page1.render({ canvasContext: ctx1!, viewport: viewport1 }).promise;
        const url1 = canvas1.toDataURL('image/png');

        if (target === 'front') {
          setFrontImage(url1);
          setFrontRotation(0);
          setFrontZoom(1.0);
          toast.success("Front side extracted from Page 1.");
          
          // If PDF has 2 pages and back is empty, auto-fill back side!
          if (doc.numPages >= 2 && !backImage) {
            const page2 = await doc.getPage(2);
            const viewport2 = page2.getViewport({ scale: 2.0 });
            const canvas2 = document.createElement('canvas');
            canvas2.width = viewport2.width;
            canvas2.height = viewport2.height;
            const ctx2 = canvas2.getContext('2d');
            await page2.render({ canvasContext: ctx2!, viewport: viewport2 }).promise;
            setBackImage(canvas2.toDataURL('image/png'));
            setBackRotation(0);
            setBackZoom(1.0);
            toast.success("Back side auto-extracted from Page 2!");
          }
        } else {
          setBackImage(url1);
          setBackRotation(0);
          setBackZoom(1.0);
          toast.success("Back side extracted from PDF.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not parse PDF. Please upload as JPG or PNG.");
      }
      return;
    }

    // Normal Image Upload
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (target === 'front') {
        setFrontImage(result);
        setFrontRotation(0);
        setFrontZoom(1.0);
        toast.success("Front side uploaded.");
      } else {
        setBackImage(result);
        setBackRotation(0);
        setBackZoom(1.0);
        toast.success("Back side uploaded.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to load an HTMLImageElement
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Draw card to offscreen rotated canvas
  const getOrientedCardCanvas = (img: HTMLImageElement, rotation: number): HTMLCanvasElement => {
    const c = document.createElement('canvas');
    const rads = (rotation * Math.PI) / 180;
    const isSideways = rotation === 90 || rotation === 270;
    
    c.width = isSideways ? img.naturalHeight : img.naturalWidth;
    c.height = isSideways ? img.naturalWidth : img.naturalHeight;

    const ctx = c.getContext('2d');
    if (!ctx) return c;

    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate(rads);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    return c;
  };

  // Render composite document onto canvas
  const renderComposite = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // High Resolution 300 DPI Scale: 1 mm ≈ 11.811 pixels
    const DPI_SCALE = 11.811;

    let sheetWidthMm = 210;
    let sheetHeightMm = 297;

    if (layoutMode === '4x6-pvc') {
      sheetWidthMm = 152.4; // 6 inches
      sheetHeightMm = 101.6; // 4 inches
    }

    const canvasWidth = Math.round(sheetWidthMm * DPI_SCALE);
    const canvasHeight = Math.round(sheetHeightMm * DPI_SCALE);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Fill clean white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // If neither image is uploaded, render clean blank placeholder
    if (!frontImage && !backImage) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("Upload Front & Back ID Card photos to generate layout", canvasWidth / 2, canvasHeight / 2);
      return canvas;
    }

    // Load available images
    const frontImgEl = frontImage ? await loadImage(frontImage) : null;
    const backImgEl = backImage ? await loadImage(backImage) : null;

    const frontCanvas = frontImgEl ? getOrientedCardCanvas(frontImgEl, frontRotation) : null;
    const backCanvas = backImgEl ? getOrientedCardCanvas(backImgEl, backRotation) : null;

    // Calculate Target Card Dimensions in mm
    let targetCardWidthMm = cardWidthMm;
    let targetCardHeightMm = cardWidthMm * (CR80_HEIGHT_MM / CR80_WIDTH_MM);

    if (cardSizing === 'proportional') {
      const sample = frontCanvas || backCanvas;
      if (sample) {
        const ratio = sample.width / sample.height;
        targetCardHeightMm = targetCardWidthMm / ratio;
      }
    }

    const cardWPx = Math.round(targetCardWidthMm * DPI_SCALE);
    const cardHPx = Math.round(targetCardHeightMm * DPI_SCALE);
    const spacingPx = Math.round(spacingMm * DPI_SCALE);

    let frontX = 0;
    let frontY = 0;
    let backX = 0;
    let backY = 0;

    if (layoutMode === 'a4-stacked') {
      // Centered horizontally, stacked vertically
      frontX = (canvasWidth - cardWPx) / 2;
      backX = frontX;

      const totalH = cardHPx * 2 + spacingPx;
      const startY = pagePlacement === 'top'
        ? Math.round(25 * DPI_SCALE) // 25mm margin from top
        : (canvasHeight - totalH) / 2;

      frontY = startY;
      backY = startY + cardHPx + spacingPx;
    } else {
      // Horizontal side-by-side (A4 horizontal or 4x6 photo sheet)
      const totalW = cardWPx * 2 + spacingPx;
      const startX = (canvasWidth - totalW) / 2;
      const startY = pagePlacement === 'top'
        ? Math.round(25 * DPI_SCALE)
        : (canvasHeight - cardHPx) / 2;

      frontX = startX;
      frontY = startY;
      backX = startX + cardWPx + spacingPx;
      backY = startY;
    }

    // Helper to draw single card with clipping, zoom, border & corner guides
    const drawCard = (cardC: HTMLCanvasElement | null, x: number, y: number, zoom: number, label: string) => {
      ctx.save();
      // Clip to card boundary so zoomed content stays strictly inside the frame
      ctx.beginPath();
      ctx.rect(x, y, cardWPx, cardHPx);
      ctx.clip();

      if (cardC) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Compute zoomed dimensions and center offset
        const drawW = cardWPx * zoom;
        const drawH = cardHPx * zoom;
        const offsetX = x - (drawW - cardWPx) / 2;
        const offsetY = y - (drawH - cardHPx) / 2;

        ctx.drawImage(cardC, offsetX, offsetY, drawW, drawH);
      } else {
        // Empty slot placeholder
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(x, y, cardWPx, cardHPx);

        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 4;
        ctx.setLineDash([12, 12]);
        ctx.strokeRect(x, y, cardWPx, cardHPx);
        ctx.setLineDash([]);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '600 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Drop ${label} Card Here`, x + cardWPx / 2, y + cardHPx / 2);
      }
      ctx.restore();

      // 1px Cutting Border Guide
      if (showBorder) {
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2; // ~0.17 mm at 300 DPI
        ctx.setLineDash([]);
        ctx.strokeRect(x, y, cardWPx, cardHPx);
      }

      // Corner Guide Crosshairs for Scissors / Cutter
      if (showCornerGuides) {
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1.5;
        const markLen = 22;

        // Top Left
        ctx.beginPath();
        ctx.moveTo(x - markLen, y); ctx.lineTo(x - 5, y);
        ctx.moveTo(x, y - markLen); ctx.lineTo(x, y - 5);
        ctx.stroke();

        // Top Right
        ctx.beginPath();
        ctx.moveTo(x + cardWPx + 5, y); ctx.lineTo(x + cardWPx + markLen, y);
        ctx.moveTo(x + cardWPx, y - markLen); ctx.lineTo(x + cardWPx, y - 5);
        ctx.stroke();

        // Bottom Left
        ctx.beginPath();
        ctx.moveTo(x - markLen, y + cardHPx); ctx.lineTo(x - 5, y + cardHPx);
        ctx.moveTo(x, y + cardHPx + 5); ctx.lineTo(x, y + cardHPx + markLen);
        ctx.stroke();

        // Bottom Right
        ctx.beginPath();
        ctx.moveTo(x + cardWPx + 5, y + cardHPx); ctx.lineTo(x + cardWPx + markLen, y + cardHPx);
        ctx.moveTo(x + cardWPx, y + cardHPx + 5); ctx.lineTo(x + cardWPx, y + cardHPx + markLen);
        ctx.stroke();
      }
    };

    drawCard(frontCanvas, frontX, frontY, frontZoom, "Front");
    drawCard(backCanvas, backX, backY, backZoom, "Back");

    // Add subtle footer metadata for print verification
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ToolWala ID Merge • Card Size: ${Math.round(targetCardWidthMm)} x ${Math.round(targetCardHeightMm)} mm (Print at 100% scale)`, canvasWidth / 2, canvasHeight - 40);

    return canvas;
  }, [
    frontImage, backImage, frontRotation, backRotation, frontZoom, backZoom,
    layoutMode, cardWidthMm, cardSizing, pagePlacement, showBorder, showCornerGuides, spacingMm
  ]);

  // Re-render whenever settings or images update
  useEffect(() => {
    renderComposite();
  }, [renderComposite]);

  // Rotate handler
  const handleRotate = (target: 'front' | 'back', delta: number) => {
    if (target === 'front') {
      setFrontRotation((prev) => (prev + delta + 360) % 360);
    } else {
      setBackRotation((prev) => (prev + delta + 360) % 360);
    }
  };

  // Card size quick preset handler
  const applySizePreset = (widthMm: number) => {
    setCardWidthMm(widthMm);
    toast.info(`Card size set to ${widthMm} mm width`);
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!frontImage && !backImage) {
      toast.error("Please upload at least one side of your card first.");
      return;
    }
    setIsExporting(true);
    try {
      const canvas = await renderComposite();
      if (!canvas) throw new Error("Canvas render failed");

      const isA4 = layoutMode === 'a4-stacked' || layoutMode === 'side-by-side';
      const orientation = layoutMode === '4x6-pvc' ? 'l' : 'p';
      const format = isA4 ? 'a4' : [101.6, 152.4];

      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      pdf.save('merged-id-card-print.pdf');
      toast.success("Print-Ready PDF downloaded! Make sure to select '100% Scale' when printing.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to compile PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // Download High-Res Image
  const handleDownloadImage = async (format: 'png' | 'jpg') => {
    if (!frontImage && !backImage) {
      toast.error("Please upload at least one side of your card first.");
      return;
    }
    setIsExporting(true);
    try {
      const canvas = await renderComposite();
      if (!canvas) throw new Error("Canvas render failed");

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const link = document.createElement('a');
      link.download = `merged-id-card-print.${format}`;
      link.href = canvas.toDataURL(mimeType, 0.98);
      link.click();
      toast.success(`High-Resolution ${format.toUpperCase()} downloaded!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate image.");
    } finally {
      setIsExporting(false);
    }
  };

  // Direct Print
  const handleDirectPrint = async () => {
    if (!frontImage && !backImage) {
      toast.error("Please upload your card photos before printing.");
      return;
    }
    try {
      const canvas = await renderComposite();
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Popup blocked. Please allow popups to open print dialog.");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Merged ID Card - ToolWala</title>
            <style>
              @page { size: auto; margin: 0mm; }
              body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; }
              img { width: 100vw; height: auto; max-height: 100vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e) {
      toast.error("Could not trigger browser print dialog.");
    }
  };

  // Reset Everything
  const handleReset = () => {
    setFrontImage(null);
    setBackImage(null);
    setFrontRotation(0);
    setBackRotation(0);
    setFrontZoom(1.0);
    setBackZoom(1.0);
    setCardWidthMm(CR80_WIDTH_MM);
    toast.info("Cleared workspace.");
  };

  return (
    <ToolVisibilityGuard slug="merge-id-front-and-back">
      <ToolLayout>
        {/* Main Workspace Card */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <ToolHero
            title="Merge ID Card Front & Back"
            description="Combine both sides of any Aadhaar, Voter Card, Driving License, or PAN card onto a single page for official printouts."
            icon={<IdCard className="w-6 h-6 sm:w-7 sm:h-7" />}
          />

          <div className="p-4 sm:p-8 lg:p-10 space-y-8 font-sans">
            
            {/* Top Privacy Banner */}
            <div className="flex items-center gap-3 p-4 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium">
              <Shield className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong>100% In-Browser Privacy:</strong> Your sensitive ID documents are merged locally in your web browser. Files never touch our servers.
              </span>
            </div>

            {/* Dual Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Front Side Card */}
              <div className="flex flex-col bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black">1</span>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Front Side</h3>
                  </div>
                  {frontImage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRotate('front', -90)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-700 dark:text-gray-300 transition-colors cursor-pointer"
                        title="Rotate Left 90°"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRotate('front', 90)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-700 dark:text-gray-300 transition-colors cursor-pointer"
                        title="Rotate Right 90°"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setFrontImage(null)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Remove Front"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {frontImage ? (
                  <>
                    <div className="relative aspect-[85/54] w-full rounded-xl overflow-hidden bg-slate-900/5 dark:bg-black/30 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2">
                      <img
                        src={frontImage}
                        alt="Front preview"
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                        style={{
                          transform: `rotate(${frontRotation}deg) scale(${frontZoom})`
                        }}
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-600/90 text-white text-[10px] font-bold rounded-md shadow-sm">
                        Ready
                      </span>
                    </div>

                    {/* Front Photo Zoom Slider */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-gray-400 flex items-center gap-1">
                        <ZoomIn className="w-3.5 h-3.5 text-blue-500" />
                        Crop / Zoom:
                      </span>
                      <input
                        type="range"
                        min="1.0"
                        max="2.0"
                        step="0.05"
                        value={frontZoom}
                        onChange={(e) => setFrontZoom(Number(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="text-[11px] font-mono font-bold text-blue-600 min-w-[42px] text-right">
                        {Math.round(frontZoom * 100)}%
                      </span>
                      {frontZoom > 1.0 && (
                        <button
                          onClick={() => setFrontZoom(1.0)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => frontInputRef.current?.click()}
                    className="aspect-[85/54] w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-black/20 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <Upload className="w-8 h-8 text-blue-500 mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Upload Front Side</p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">Drop image (JPG, PNG) or official PDF</p>
                  </div>
                )}
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) processUpload(f, 'front');
                  }}
                />
              </div>

              {/* Back Side Card */}
              <div className="flex flex-col bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black">2</span>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Back Side</h3>
                  </div>
                  {backImage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRotate('back', -90)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-700 dark:text-gray-300 transition-colors cursor-pointer"
                        title="Rotate Left 90°"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRotate('back', 90)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-700 dark:text-gray-300 transition-colors cursor-pointer"
                        title="Rotate Right 90°"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setBackImage(null)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Remove Back"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {backImage ? (
                  <>
                    <div className="relative aspect-[85/54] w-full rounded-xl overflow-hidden bg-slate-900/5 dark:bg-black/30 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2">
                      <img
                        src={backImage}
                        alt="Back preview"
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                        style={{
                          transform: `rotate(${backRotation}deg) scale(${backZoom})`
                        }}
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-600/90 text-white text-[10px] font-bold rounded-md shadow-sm">
                        Ready
                      </span>
                    </div>

                    {/* Back Photo Zoom Slider */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-gray-400 flex items-center gap-1">
                        <ZoomIn className="w-3.5 h-3.5 text-blue-500" />
                        Crop / Zoom:
                      </span>
                      <input
                        type="range"
                        min="1.0"
                        max="2.0"
                        step="0.05"
                        value={backZoom}
                        onChange={(e) => setBackZoom(Number(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="text-[11px] font-mono font-bold text-blue-600 min-w-[42px] text-right">
                        {Math.round(backZoom * 100)}%
                      </span>
                      {backZoom > 1.0 && (
                        <button
                          onClick={() => setBackZoom(1.0)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => backInputRef.current?.click()}
                    className="aspect-[85/54] w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-black/20 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <Upload className="w-8 h-8 text-blue-500 mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Upload Back Side</p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">Drop image (JPG, PNG) or official PDF</p>
                  </div>
                )}
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) processUpload(f, 'back');
                  }}
                />
              </div>

            </div>

            {/* Adjustable Card Size & Print Layout Controls */}
            <div className="p-6 bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Adjustable Card Size & Print Settings</h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                  Current Card Dimensions: <strong className="text-blue-600 font-mono">{Math.round(cardWidthMm)} x {Math.round(cardWidthMm * (54/85.6))} mm</strong>
                </span>
              </div>

              {/* Card Size Quick Presets & Slider */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Card Size on Page:</span>
                  </label>
                  
                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applySizePreset(85.6)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        Math.round(cardWidthMm) === 86
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-blue-400'
                      }`}
                    >
                      PVC Standard (85.6 mm)
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset(115)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        Math.round(cardWidthMm) === 115
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-blue-400'
                      }`}
                    >
                      Medium (115 mm)
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset(145)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        Math.round(cardWidthMm) === 145
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-blue-400'
                      }`}
                    >
                      Large A4 (145 mm)
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset(175)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        Math.round(cardWidthMm) === 175
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-blue-400'
                      }`}
                    >
                      Full Width (175 mm)
                    </button>
                  </div>
                </div>

                {/* Free Size Slider */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                  <span className="text-[11px] font-bold text-slate-500">60 mm (Small)</span>
                  <input
                    type="range"
                    min="60"
                    max="180"
                    step="2"
                    value={cardWidthMm}
                    onChange={(e) => setCardWidthMm(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-[11px] font-bold text-slate-500">180 mm (Max)</span>
                  <span className="text-xs font-mono font-black text-blue-600 min-w-[55px] text-right">
                    {Math.round(cardWidthMm)} mm
                  </span>
                </div>
              </div>

              {/* Secondary Layout Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                
                {/* Layout Mode */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1.5">Page Layout</label>
                  <select
                    value={layoutMode}
                    onChange={(e) => setLayoutMode(e.target.value as LayoutMode)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="a4-stacked">A4 Stacked (Top & Bottom)</option>
                    <option value="side-by-side">A4 Side-by-Side (Horizontal)</option>
                    <option value="4x6-pvc">4x6 Photo Sheet (PVC Card)</option>
                  </select>
                </div>

                {/* Page Placement */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1.5 flex items-center gap-1">
                    <MoveVertical className="w-3.5 h-3.5 text-blue-500" />
                    <span>Page Placement</span>
                  </label>
                  <select
                    value={pagePlacement}
                    onChange={(e) => setPagePlacement(e.target.value as PagePlacement)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="center">Center of Page</option>
                    <option value="top">Top of Page (Save Paper)</option>
                  </select>
                </div>

                {/* Spacing Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Card Gap</label>
                    <span className="text-xs font-mono font-bold text-blue-600">{spacingMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="35"
                    step="2"
                    value={spacingMm}
                    onChange={(e) => setSpacingMm(Number(e.target.value))}
                    className="w-full h-2 bg-slate-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                  />
                </div>

                {/* Toggles */}
                <div className="flex flex-col justify-center gap-2 pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBorder}
                      onChange={(e) => setShowBorder(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>1px Cutting Border</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCornerGuides}
                      onChange={(e) => setShowCornerGuides(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Corner Scissors Marks</span>
                  </label>
                </div>

              </div>
            </div>

            {/* Live Interactive Print Preview */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full max-w-4xl mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Live Print Canvas (300 DPI Scale)
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-400">
                  {layoutMode === '4x6-pvc' ? '152 x 102 mm (4x6 Photo)' : '210 x 297 mm (A4 Standard)'}
                </span>
              </div>

              <div className="w-full max-w-4xl bg-slate-200 dark:bg-black/50 p-4 sm:p-8 rounded-3xl border border-slate-300 dark:border-white/10 shadow-inner flex items-center justify-center overflow-auto max-h-[600px]">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto shadow-2xl bg-white rounded-sm"
                  style={{ maxHeight: '520px' }}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
              
              <button
                onClick={handleDownloadPdf}
                disabled={isExporting || (!frontImage && !backImage)}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Print PDF (300 DPI)</span>
              </button>

              <button
                onClick={handleDirectPrint}
                disabled={!frontImage && !backImage}
                className="flex items-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print Directly (Ctrl + P)</span>
              </button>

              <button
                onClick={() => handleDownloadImage('jpg')}
                disabled={!frontImage && !backImage}
                className="flex items-center gap-2 px-4 py-3.5 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 disabled:opacity-50 text-slate-800 dark:text-gray-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Save JPG</span>
              </button>

              {(frontImage || backImage) && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-3.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}

            </div>

            {/* Quick Tips Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                <span className="text-xl">🖨️</span>
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mt-2">Adjustable Print Scale</h5>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">Keep it at <strong>PVC Standard (85.6 mm)</strong> for wallet cards, or scale up to <strong>Large/Full A4</strong> for elder-friendly big prints.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                <span className="text-xl">🔍</span>
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mt-2">Individual Crop & Zoom</h5>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">Use the <strong>Crop / Zoom</strong> sliders under the front and back photos to zoom in and remove unwanted table or bedsheet margins.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                <span className="text-xl">✂️</span>
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mt-2">Built-in Cutting Borders</h5>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">The subtle 1px border gives you a crisp guide for scissors, paper trimmers, or corner-rounding punches.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Humanized Deep-Dive Article */}
        {toolArticles['merge-id-front-and-back'] && (
          <ToolArticle {...toolArticles['merge-id-front-and-back']} />
        )}

        {/* Workflow Cross-Links */}
        <WorkflowRecommendations slug="merge-id-front-and-back" />

      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, UploadCloud, Trash2,
  Shield, RefreshCw, AlertCircle, CheckCircle,
  ChevronLeft, ArrowRight, Sparkles, Files, Grid,
  Layers, Type, Image as ImageIcon, Sliders,
  ChevronRight, AlignCenter, Lock, Unlock
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';

const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

type WatermarkType = 'text' | 'image';
type WatermarkPosition = 
  | 'center' | 'top-left' | 'top-right' | 'bottom-left' 
  | 'bottom-right' | 'top-center' | 'bottom-center' 
  | 'center-left' | 'center-right' | 'tiled';

export default function WatermarkPdf() {
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Watermark Configuration States
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
  
  // Text Watermark Options
  const [text, setText] = useState("CONFIDENTIAL");
  const [textColor, setTextColor] = useState("#ff0000");
  const [fontSize, setFontSize] = useState<number>(48);
  
  // Image Watermark Options
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBytes, setImageBytes] = useState<Uint8Array | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [imageScale, setImageScale] = useState<number>(100); // percentage

  // Shared Options
  const [opacity, setOpacity] = useState<number>(0.3);
  const [rotation, setRotation] = useState<number>(-45); // degrees
  const [position, setPosition] = useState<WatermarkPosition>('center');
  const [applyToAll, setApplyToAll] = useState<boolean>(true);
  const [customPagesInput, setCustomPagesInput] = useState<string>("");

  // Process states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [success, setSuccess] = useState(false);
  const [watermarkedBytes, setWatermarkedBytes] = useState<Uint8Array | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkImageInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Initialize and load PDF.js dynamically
  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        const lib = await import('pdfjs-dist');
        lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        setPdfjs(lib);
      } catch (err) {
        console.error("Failed to load pdfjs-dist", err);
        toast.error("Failed to initialize document preview engine.");
      }
    };
    loadPdfjs();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderTaskRef = useRef<any>(null);

  // Preview Page details
  const renderPreviewPage = async (pageNum: number) => {
    if (!pdfDocRef.current || !pdfjs) return;
    try {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (_) {}
        renderTaskRef.current = null;
      }

      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.75 });
      
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          const task = page.render({
            canvasContext: context,
            viewport: viewport,
          });
          renderTaskRef.current = task;
          await task.promise;
          renderTaskRef.current = null;
        }
      }
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error("Preview render failed:", err);
      }
    }
  };

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPreviewPage(currentPage);
    }
  }, [currentPage, pdfBytes]);

  // ------------------------------------
  // FILE LOADER
  // ------------------------------------
  const handlePdfUpload = (file: File) => {
    setIsProcessing(true);
    setSuccess(false);
    setWatermarkedBytes(null);
    setCurrentPage(1);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        
        if (!pdfjs) {
          toast.error("PDF engine is initializing, please drop the file again.");
          setIsProcessing(false);
          return;
        }

        const loadingTask = pdfjs.getDocument({ data: bytes.slice() });
        const doc = await loadingTask.promise;
        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        setPdfBytes(bytes);
        setPdfFile(file);
      } catch (err: any) {
        console.error(err);
        if (err?.name === 'PasswordException' || err?.message?.toLowerCase().includes('password')) {
          toast.error("This PDF file is password protected. Please unlock it first.");
        } else {
          toast.error(err?.message || "Failed to read PDF file. Make sure it is a valid PDF.");
        }
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handlePdfUpload(file);
      } else {
        toast.error("Please upload valid PDF files only.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ------------------------------------
  // WATERMARK IMAGE LOADER
  // ------------------------------------
  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        setImageFile(file);
        
        // Generate uploader image preview
        const url = URL.createObjectURL(file);
        setImagePreviewUrl(url);

        const reader = new FileReader();
        reader.onload = (event) => {
          const arrBuffer = event.target?.result as ArrayBuffer;
          setImageBytes(new Uint8Array(arrBuffer));
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast.error("Please upload valid PNG or JPEG images.");
      }
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfBytes(null);
    pdfDocRef.current = null;
    setTotalPages(0);
    setCurrentPage(1);
    setWatermarkedBytes(null);
    setIsProcessing(false);
    setSuccess(false);
    setImageFile(null);
    setImageBytes(null);
    setImagePreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ------------------------------------
  // APPLY WATERMARK IN PDF-LIB
  // ------------------------------------
  const applyWatermark = async () => {
    if (!pdfBytes) return;
    if (watermarkType === 'image' && !imageBytes) {
      toast.error("Please select a watermark image.");
      return;
    }

    setIsProcessing(true);
    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = await import('pdf-lib');
      
      // Hex color to rgb helper
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
      };

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const color = hexToRgb(textColor);
      
      let embeddedImage: any = null;
      if (watermarkType === 'image' && imageBytes && imageFile) {
        if (imageFile.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        }
      }

      const pages = pdfDoc.getPages();
      
      // Compute target page numbers (1-based indexes)
      let pagesToWatermark: number[] = [];
      if (applyToAll) {
        pagesToWatermark = Array.from({ length: pages.length }, (_, i) => i + 1);
      } else {
        // Parse custom ranges: "1, 2, 5" or "1-3" etc.
        const list: number[] = [];
        const parts = customPagesInput.split(',');
        for (const p of parts) {
          const trim = p.trim();
          if (trim.includes('-')) {
            const range = trim.split('-');
            const start = parseInt(range[0]);
            const end = parseInt(range[1]);
            if (!isNaN(start) && !isNaN(end)) {
              for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                list.push(i);
              }
            }
          } else {
            const pageNum = parseInt(trim);
            if (!isNaN(pageNum)) {
              list.push(pageNum);
            }
          }
        }
        
        // Filter valid page numbers
        pagesToWatermark = Array.from(new Set(list))
          .filter(n => n >= 1 && n <= pages.length)
          .sort((a, b) => a - b);
          
        if (pagesToWatermark.length === 0) {
          toast.error("Please enter valid page numbers (e.g. 1-3 or 1, 3).");
          setIsProcessing(false);
          return;
        }
      }

      // Draw watermark sequentially
      for (const pageNum of pagesToWatermark) {
        const page = pages[pageNum - 1];
        const { width, height } = page.getSize();

        // TEXT WATERMARK DRAW routine
        if (watermarkType === 'text') {
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          const textHeight = font.heightAtSize(fontSize);
          
          const drawConfig = (xPos: number, yPos: number) => {
            page.drawText(text, {
              x: xPos,
              y: yPos,
              size: fontSize,
              font: font,
              color: color,
              opacity: opacity,
              rotate: degrees(rotation),
            });
          };

          if (position === 'tiled') {
            // Draw in a 3x3 grid across the page
            const cols = [width * 0.2, width * 0.5, width * 0.8];
            const rows = [height * 0.2, height * 0.5, height * 0.8];
            for (const cx of cols) {
              for (const ry of rows) {
                // Adjust position for centers of cells
                drawConfig(cx - textWidth / 2, ry - textHeight / 2);
              }
            }
          } else {
            let x = (width - textWidth) / 2;
            let y = (height - textHeight) / 2;
            
            if (position === 'top-left') { x = 30; y = height - textHeight - 30; }
            else if (position === 'top-center') { x = (width - textWidth) / 2; y = height - textHeight - 30; }
            else if (position === 'top-right') { x = width - textWidth - 30; y = height - textHeight - 30; }
            else if (position === 'center-left') { x = 30; y = (height - textHeight) / 2; }
            else if (position === 'center-right') { x = width - textWidth - 30; y = (height - textHeight) / 2; }
            else if (position === 'bottom-left') { x = 30; y = 30; }
            else if (position === 'bottom-center') { x = (width - textWidth) / 2; y = 30; }
            else if (position === 'bottom-right') { x = width - textWidth - 30; y = 30; }
            
            drawConfig(x, y);
          }
        } 
        
        // IMAGE WATERMARK DRAW routine
        else if (watermarkType === 'image' && embeddedImage) {
          // Base scale dimensions: 20% of page width
          const baseScale = width * 0.22;
          const imgWidth = baseScale * (imageScale / 100);
          const imgHeight = (embeddedImage.height / embeddedImage.width) * imgWidth;
          
          const drawConfig = (xPos: number, yPos: number) => {
            page.drawImage(embeddedImage, {
              x: xPos,
              y: yPos,
              width: imgWidth,
              height: imgHeight,
              opacity: opacity,
              rotate: degrees(rotation),
            });
          };

          if (position === 'tiled') {
            const cols = [width * 0.2, width * 0.5, width * 0.8];
            const rows = [height * 0.2, height * 0.5, height * 0.8];
            for (const cx of cols) {
              for (const ry of rows) {
                drawConfig(cx - imgWidth / 2, ry - imgHeight / 2);
              }
            }
          } else {
            let x = (width - imgWidth) / 2;
            let y = (height - imgHeight) / 2;
            
            if (position === 'top-left') { x = 30; y = height - imgHeight - 30; }
            else if (position === 'top-center') { x = (width - imgWidth) / 2; y = height - imgHeight - 30; }
            else if (position === 'top-right') { x = width - imgWidth - 30; y = height - imgHeight - 30; }
            else if (position === 'center-left') { x = 30; y = (height - imgHeight) / 2; }
            else if (position === 'center-right') { x = width - imgWidth - 30; y = (height - imgHeight) / 2; }
            else if (position === 'bottom-left') { x = 30; y = 30; }
            else if (position === 'bottom-center') { x = (width - imgWidth) / 2; y = 30; }
            else if (position === 'bottom-right') { x = width - imgWidth - 30; y = 30; }
            
            drawConfig(x, y);
          }
        }
      }

      const compiledBytes = await pdfDoc.save();
      setWatermarkedBytes(compiledBytes);
      setSuccess(true);
      toast.success("Watermark applied successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to compile watermarked document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadWatermarked = () => {
    if (!watermarkedBytes || !pdfFile) return;
    const blob = new Blob([uint8ArrayToArrayBuffer(watermarkedBytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    
    const dl = document.createElement('a');
    dl.href = url;
    dl.download = pdfFile.name.replace(/\.pdf$/i, '_watermarked.pdf');
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
    URL.revokeObjectURL(url);
  };

  // Drag-and-drop workspace triggers
  const handleDragOverUpload = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingOverUpload) setIsDraggingOverUpload(true);
  };

  const handleDragLeaveUpload = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOverUpload(false);
    }
  };

  const handleDropUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverUpload(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handlePdfUpload(file);
      } else {
        toast.error("Drop PDF files only.");
      }
    }
  };

  // Preview overlay CSS mapping
  const getPositionClasses = () => {
    if (position === 'tiled') return 'inset-0 grid grid-cols-3 grid-rows-3 p-4';
    let align = 'items-center justify-center';
    if (position === 'top-left') align = 'items-start justify-start p-6';
    else if (position === 'top-center') align = 'items-start justify-center p-6';
    else if (position === 'top-right') align = 'items-start justify-end p-6';
    else if (position === 'center-left') align = 'items-center justify-start p-6';
    else if (position === 'center-right') align = 'items-center justify-end p-6';
    else if (position === 'bottom-left') align = 'items-end justify-start p-6';
    else if (position === 'bottom-center') align = 'items-end justify-center p-6';
    else if (position === 'bottom-right') align = 'items-end justify-end p-6';
    return `inset-0 flex ${align}`;
  };

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden transition-colors duration-250 font-sans">
      <MeshGradient />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Navigation Link */}
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* Main Workspace Card */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          
          {/* Header Banner */}
          <div className="p-8 sm:p-10 border-b border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)]">
                  <Type className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Add Watermark to PDF</h1>
                  <p className="text-slate-600 dark:text-gray-400 font-medium mt-1">Design and embed secure text or image watermarks client-side with visual preview.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 h-fit shadow-sm">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Secure Client Processing</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            
            {/* Success state display */}
            {success && watermarkedBytes && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-10 p-8 border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl text-center shadow-sm"
              >
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Watermark Applied!</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Your PDF was successfully stamped with the custom watermark. Download the file now.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button 
                    onClick={downloadWatermarked} 
                    className="flex items-center gap-2 px-7 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Stamped PDF
                  </button>
                  <button 
                    onClick={resetAll} 
                    className="px-7 py-4 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Watermark Another PDF
                  </button>
                </div>
              </motion.div>
            )}

            {/* Layout Panels */}
            {!pdfFile ? (
              
              /* 1. Upload Deck */
              <div
                onDragOver={handleDragOverUpload}
                onDragLeave={handleDragLeaveUpload}
                onDrop={handleDropUpload}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl py-12 sm:py-20 px-6 sm:px-10 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-sm
                  ${isDraggingOverUpload 
                    ? 'border-blue-500 bg-blue-500/5 scale-[1.01]' 
                    : 'border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] hover:border-blue-500/50 hover:bg-blue-500/[0.02]'
                  }
                `}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="hidden"
                />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 group-hover:border-blue-500/50 transition-all duration-300 shadow-sm">
                    <UploadCloud className="w-8 h-8 text-blue-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">Upload PDF</h3>
                  <p className="text-slate-500 dark:text-gray-400 font-medium max-w-sm mx-auto mb-5 text-sm">
                    Drag and drop your PDF here, or click to search files.
                  </p>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5 uppercase tracking-wider">
                    🔒 Client-side security. Files never leave your browser.
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
              </div>

            ) : (

              /* 2. Workspace View */
              <div className="space-y-10">
                
                {/* File overview card */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-2xl gap-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">{pdfFile.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-500 font-semibold mt-0.5">
                        {formatBytes(pdfFile.size)} • {totalPages} Pages
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={resetAll}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2.5 border border-red-200 dark:border-red-500/20 hover:border-red-300 bg-red-50 dark:bg-red-500/5 text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove File
                  </button>
                </div>

                {/* Configuration Panel & Dynamic Preview Board */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* Left Column: Watermark Designers */}
                  <div className="space-y-8 lg:col-span-5">
                    <div className="bg-[#FBFCFE] dark:bg-white/[0.02] p-6 sm:p-8 rounded-3xl border border-[#E6ECF5] dark:border-white/5 space-y-6 shadow-sm">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-[#E6ECF5] dark:border-white/5 pb-4 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-500" /> Customize Design
                      </h3>

                      {/* Watermark Type Selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">Watermark Format</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setWatermarkType('text')}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                              watermarkType === 'text'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                                : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-gray-500 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <Type className="w-3.5 h-3.5" /> Text Watermark
                          </button>
                          <button
                            onClick={() => setWatermarkType('image')}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                              watermarkType === 'image'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                                : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-gray-500 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> Image Logo
                          </button>
                        </div>
                      </div>

                      {/* Type-Specific controls */}
                      {watermarkType === 'text' ? (
                        <>
                          {/* Text input */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">Watermark Text</label>
                            <input
                              type="text"
                              value={text}
                              onChange={(e) => setText(e.target.value)}
                              className="w-full bg-white dark:bg-[#030712]/50 border border-slate-200 dark:border-white/5 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-semibold outline-none transition-all shadow-sm"
                              placeholder="CONFIDENTIAL"
                            />
                          </div>

                          {/* Color and Font size picker row */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">Font Color</label>
                              <div className="flex items-center gap-3 bg-white dark:bg-[#030712]/50 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 shadow-sm">
                                <input
                                  type="color"
                                  value={textColor}
                                  onChange={(e) => setTextColor(e.target.value)}
                                  className="h-8 w-10 border-none bg-transparent rounded-lg cursor-pointer flex-shrink-0"
                                />
                                <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-gray-400 uppercase">{textColor}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">Font Size ({fontSize}px)</label>
                              <input
                                type="range"
                                min="12"
                                max="120"
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-4"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Image Selector */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">Watermark Image</label>
                            <div 
                              onClick={() => watermarkImageInputRef.current?.click()}
                              className="border border-slate-200 dark:border-white/5 border-dashed rounded-xl bg-white dark:bg-[#030712]/50 p-4 text-center hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer relative shadow-sm"
                            >
                              <input
                                type="file"
                                ref={watermarkImageInputRef}
                                onChange={handleWatermarkImageUpload}
                                accept="image/png, image/jpeg, image/jpg"
                                className="hidden"
                              />
                              {imageFile ? (
                                <div className="flex items-center justify-between gap-4 px-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/5 overflow-hidden">
                                      {imagePreviewUrl ? (
                                        <img src={imagePreviewUrl} alt="Logo" className="w-full h-full object-contain" />
                                      ) : (
                                        <ImageIcon className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                                      )}
                                    </div>
                                    <div className="text-left">
                                      <p className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">{imageFile.name}</p>
                                      <p className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider">{formatBytes(imageFile.size)}</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setImageFile(null);
                                      setImageBytes(null);
                                      setImagePreviewUrl("");
                                    }}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-lg text-slate-400 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-1 py-2 text-slate-500 hover:text-slate-700 dark:text-gray-500 dark:hover:text-gray-400">
                                  <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-400 dark:text-gray-500" />
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">Select PNG/JPEG Logo</p>
                                  <p className="text-[8px] font-bold text-slate-500 dark:text-gray-600">Supports transparency (PNG recommended)</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Image Scale Slider */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">
                              <span>Image Width Scale</span>
                              <span>{imageScale}%</span>
                            </div>
                            <input
                              type="range"
                              min="20"
                              max="300"
                              value={imageScale}
                              onChange={(e) => setImageScale(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                            />
                          </div>
                        </>
                      )}

                      {/* Position Select presets grid */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">Alignment Position</label>
                        <div className="grid grid-cols-5 gap-2 border border-slate-200 dark:border-white/5 rounded-2xl p-3 bg-slate-50 dark:bg-[#030712]/50 shadow-inner">
                          {([
                            'top-left', 'top-center', 'top-right', 'center-left', 'center',
                            'center-right', 'bottom-left', 'bottom-center', 'bottom-right', 'tiled'
                          ] as WatermarkPosition[]).map((pos) => {
                            const labels: Record<string, string> = {
                              'top-left': '↖', 'top-center': '↑', 'top-right': '↗',
                              'center-left': '←', 'center': '•', 'center-right': '→',
                              'bottom-left': '↙', 'bottom-center': '↓', 'bottom-right': '↘',
                              'tiled': '▤'
                            };
                            return (
                              <button
                                key={pos}
                                onClick={() => setPosition(pos)}
                                title={pos.replace('-', ' ')}
                                className={`h-11 rounded-lg flex items-center justify-center font-bold text-sm transition-all border cursor-pointer ${
                                  position === pos
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-gray-500 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-900 dark:hover:text-white shadow-sm'
                                }`}
                              >
                                {labels[pos]}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[9px] text-slate-500 dark:text-gray-600 font-bold uppercase tracking-wider text-center">
                          Select ▤ for Tiled (repeats diagonally across the page)
                        </p>
                      </div>

                      {/* Rotation Angle and Opacity Sliders */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">
                            <span>Opacity</span>
                            <span>{Math.round(opacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={opacity * 100}
                            onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
                            className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">
                            <span>Rotation</span>
                            <span>{rotation}°</span>
                          </div>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                          />
                        </div>
                      </div>

                      {/* Target Pages Toggle */}
                      <div className="space-y-3 border-t border-[#E6ECF5] dark:border-white/5 pt-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1">Page Ranges</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setApplyToAll(true)}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer ${
                              applyToAll
                                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                                : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-gray-500 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            All Pages
                          </button>
                          <button
                            onClick={() => setApplyToAll(false)}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer ${
                              !applyToAll
                                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                                : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-gray-500 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Custom Pages
                          </button>
                        </div>

                        {!applyToAll && (
                          <motion.input
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            type="text"
                            value={customPagesInput}
                            onChange={(e) => setCustomPagesInput(e.target.value)}
                            className="w-full bg-white dark:bg-[#030712]/50 border border-slate-200 dark:border-white/5 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-semibold outline-none transition-all shadow-sm"
                            placeholder="e.g. 1, 3, 5-8"
                          />
                        )}
                      </div>

                      {/* Action Trigger */}
                      <button
                        onClick={applyWatermark}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2.5 px-6 py-4.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Compiling Document...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> Apply Watermark to PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Visual Live Previewer */}
                  <div className="space-y-6 lg:col-span-7 flex flex-col justify-between">
                    <div className="bg-[#FBFCFE] dark:bg-white/[0.02] p-6 sm:p-8 rounded-3xl border border-[#E6ECF5] dark:border-white/5 flex flex-col justify-between h-full min-h-[500px] shadow-sm">
                      
                      {/* Preview Header */}
                      <div className="flex justify-between items-center border-b border-[#E6ECF5] dark:border-white/5 pb-4 mb-6">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Interactive Workspace Preview</h3>
                          <p className="text-[9px] text-slate-500 dark:text-gray-500 font-semibold mt-0.5">Showing Page {currentPage} of {totalPages}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isProcessing}
                            className="p-2 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-slate-100 dark:bg-white/[0.02] hover:bg-slate-200 dark:hover:bg-white/[0.05] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-lg disabled:opacity-30 cursor-pointer transition-all shadow-sm"
                          >
                            <ChevronLeft className="w-4.5 h-4.5" />
                          </button>
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-gray-400">{currentPage} / {totalPages}</span>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || isProcessing}
                            className="p-2 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-slate-100 dark:bg-white/[0.02] hover:bg-slate-200 dark:hover:bg-white/[0.05] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-lg disabled:opacity-30 cursor-pointer transition-all shadow-sm"
                          >
                            <ChevronRight className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>

                      {/* Preview Drawing Area */}
                      <div className="relative flex items-center justify-center p-2 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-100/90 dark:bg-black/40 overflow-hidden flex-grow group aspect-[3/4] max-w-md mx-auto w-full shadow-inner">
                        {/* Core PDF Canvas */}
                        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white" />

                        {/* Text Watermark Overlay */}
                        {watermarkType === 'text' && text && (
                          <div className={`absolute pointer-events-none select-none overflow-hidden ${getPositionClasses()}`}>
                            {position === 'tiled' ? (
                              Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-center">
                                  <span 
                                    style={{
                                      color: textColor,
                                      fontSize: `${fontSize * 0.7}px`,
                                      opacity: opacity,
                                      transform: `rotate(${rotation}deg)`,
                                      fontFamily: 'sans-serif',
                                      fontWeight: 'bold',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {text}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span 
                                style={{
                                  color: textColor,
                                  fontSize: `${fontSize * 0.7}px`, // slightly scaled down for preview screen fit
                                  opacity: opacity,
                                  transform: `rotate(${rotation}deg)`,
                                  fontFamily: 'sans-serif',
                                  fontWeight: 'bold',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {text}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Image Watermark Overlay */}
                        {watermarkType === 'image' && imagePreviewUrl && (
                          <div className={`absolute pointer-events-none select-none overflow-hidden ${getPositionClasses()}`}>
                            {position === 'tiled' ? (
                              Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-center">
                                  <img 
                                    src={imagePreviewUrl} 
                                    alt="watermark tile" 
                                    style={{
                                      width: `${imageScale * 0.35}%`, // scaled down for preview screen fit
                                      opacity: opacity,
                                      transform: `rotate(${rotation}deg)`,
                                    }}
                                  />
                                </div>
                              ))
                            ) : (
                              <img 
                                src={imagePreviewUrl} 
                                alt="watermark stamp" 
                                style={{
                                  width: `${imageScale * 0.4}%`, // scaled down for preview screen fit
                                  opacity: opacity,
                                  transform: `rotate(${rotation}deg)`,
                                }}
                              />
                            )}
                          </div>
                        )}

                      </div>

                      <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500 mt-6 border-t border-white/5 pt-4">
                        <AlignCenter className="w-3.5 h-3.5" /> preview changes live before applying
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>

        {/* RELATED TOOLS LIST */}
        <div className="mb-12 animate-fade-in">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 ml-1">Explore PDF Workspace</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Protect PDF Card */}
            <Link 
              href="/tools/protect-pdf"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Lock className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors tracking-tight">Protect PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Add secure user passwords and protect your PDF documents with client-side encryption.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Unlock PDF Card */}
            <Link 
              href="/tools/unlock-pdf"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Unlock className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors tracking-tight">Unlock PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Remove password restrictions and decode your protected PDF documents instantly.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Merge PDF Card */}
            <Link 
              href="/tools/merge-pdf"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Files className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors tracking-tight">Merge PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Combine multiple distinct PDF documents into a single professional-grade file quickly and securely.
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

      {/* SEO Deep-Dive Article Section */}
      {toolArticles['watermark-pdf'] && (
        <ToolArticle {...toolArticles['watermark-pdf']} />
      )}
    </div>
  );
}

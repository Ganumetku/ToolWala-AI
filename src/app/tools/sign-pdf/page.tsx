"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, UploadCloud, Trash2,
  Shield, RefreshCw, AlertCircle, CheckCircle,
  ChevronLeft, ArrowRight, Sparkles, Sliders,
  HelpCircle, ChevronDown, PenTool, Type, Image as ImageIcon,
  Check, X, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';
import ToolLayout from '@/components/tools/ToolLayout';

const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

type SignatureMethod = 'draw' | 'type' | 'upload';
type PageScope = 'current' | 'all' | 'first' | 'last' | 'custom';

export default function SignPdf() {
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Signature States
  const [method, setMethod] = useState<SignatureMethod>('draw');
  const [typedName, setTypedName] = useState<string>("");
  const [fontFamily, setFontFamily] = useState<string>('Brush Script MT');
  const [uploadedSigUrl, setUploadedSigUrl] = useState<string>("");
  const [uploadedSigBytes, setUploadedSigBytes] = useState<Uint8Array | null>(null);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [drawPadVersion, setDrawPadVersion] = useState<number>(0);
  
  // Page Scope Settings
  const [pageScope, setPageScope] = useState<PageScope>('current');
  const [customPages, setCustomPages] = useState<string>("");
  
  // Coordinates mapping
  const [stampCoords, setStampCoords] = useState<{ x: number; y: number } | null>(null);
  const [stampWidth, setStampWidth] = useState<number>(160);
  const [isDraggingStamp, setIsDraggingStamp] = useState(false);
  
  // Drawing pad state
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [success, setSuccess] = useState(false);
  const [signedBytes, setSignedBytes] = useState<Uint8Array | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigImageInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const uploadedSigImgRef = useRef<HTMLImageElement | null>(null);
  const pdfDocRef = useRef<any>(null);

  // Helper to parse target page indices based on user scope
  const getTargetPageIndices = (
    scope: PageScope,
    current: number,
    total: number,
    customStr: string
  ): number[] => {
    if (total <= 0) return [];
    if (scope === 'current') return [current - 1];
    if (scope === 'all') return Array.from({ length: total }, (_, i) => i);
    if (scope === 'first') return [0];
    if (scope === 'last') return [total - 1];
    if (scope === 'custom') {
      const indices = new Set<number>();
      const parts = customStr.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = parseInt(startStr);
          const end = parseInt(endStr);
          if (!isNaN(start) && !isNaN(end)) {
            const min = Math.max(1, Math.min(start, end));
            const max = Math.min(total, Math.max(start, end));
            for (let p = min; p <= max; p++) {
              indices.add(p - 1);
            }
          }
        } else {
          const p = parseInt(trimmed);
          if (!isNaN(p) && p >= 1 && p <= total) {
            indices.add(p - 1);
          }
        }
      }
      return Array.from(indices).sort((a, b) => a - b);
    }
    return [current - 1];
  };

  // Load PDF.js dynamically
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

  // Synchronously draw signature stamp overlay on top of the cached base PDF canvas
  const drawCanvasWithOverlay = () => {
    const baseCanvas = baseCanvasRef.current;
    const canvas = previewCanvasRef.current;
    if (!canvas || !baseCanvas) return;

    if (canvas.width !== baseCanvas.width || canvas.height !== baseCanvas.height) {
      canvas.width = baseCanvas.width;
      canvas.height = baseCanvas.height;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    // Draw base PDF image
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(baseCanvas, 0, 0);

    const targetIndices = getTargetPageIndices(pageScope, currentPage, totalPages, customPages);
    const isSignatureOnCurrentPage = targetIndices.includes(currentPage - 1);

    if (!isSignatureOnCurrentPage) {
      // Signature is disabled on this page
      context.save();
      context.fillStyle = 'rgba(15, 23, 42, 0.7)';
      context.font = 'bold 11px sans-serif';
      context.fillText(`ℹ Signature is disabled on Page ${currentPage}`, 16, 24);
      context.restore();
      return;
    }

    // Default position if user has not chosen one
    const activeX = stampCoords ? stampCoords.x : canvas.width / 2;
    const activeY = stampCoords ? stampCoords.y : Math.max(60, canvas.height * 0.82);

    const stampH = stampWidth * 0.38;
    const stampX = activeX - stampWidth / 2;
    const stampY = activeY - stampH / 2;

    // 1. Draw signature visual content
    context.save();
    if (method === 'draw' && drawCanvasRef.current && hasDrawn) {
      context.drawImage(drawCanvasRef.current, stampX, stampY, stampWidth, stampH);
    } else if (method === 'type' && typedName.trim()) {
      context.font = `italic 600 ${Math.max(14, Math.round(stampWidth * 0.14))}px "${fontFamily}", cursive, sans-serif`;
      context.fillStyle = '#0f172a';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(typedName, activeX, activeY);
    } else if (method === 'upload' && uploadedSigImgRef.current) {
      try {
        context.drawImage(uploadedSigImgRef.current, stampX, stampY, stampWidth, stampH);
      } catch (e) {
        console.warn("Could not draw uploaded sig preview", e);
      }
    } else {
      // Placeholder text inside signature boundary
      context.font = '500 11px sans-serif';
      context.fillStyle = '#64748b';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText("✎ Signature will appear here", activeX, activeY);
    }
    context.restore();

    // 2. Draw signature stamp outline box
    context.save();
    context.strokeStyle = '#2563eb';
    context.lineWidth = 1.5;
    context.setLineDash([5, 4]);
    context.strokeRect(stampX, stampY, stampWidth, stampH);
    context.fillStyle = 'rgba(37,99,235,0.05)';
    context.fillRect(stampX, stampY, stampWidth, stampH);

    // Top badge
    context.setLineDash([]);
    context.fillStyle = '#2563eb';
    context.font = 'bold 9px sans-serif';
    context.fillText("✎ SIGNATURE (Click or Drag to Move)", stampX + 4, Math.max(12, stampY - 5));
    context.restore();
  };

  // Render PDF Page to Base Canvas (only when page/document changes)
  const renderPdfBasePage = async (pageNum: number) => {
    if (!pdfDocRef.current || !pdfjs) return;
    try {
      // Cancel previous in-flight render task if any
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (_) {}
        renderTaskRef.current = null;
      }

      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.75 });

      // Offscreen/base canvas
      if (!baseCanvasRef.current) {
        baseCanvasRef.current = document.createElement('canvas');
      }
      const baseCanvas = baseCanvasRef.current;
      baseCanvas.width = viewport.width;
      baseCanvas.height = viewport.height;
      const baseCtx = baseCanvas.getContext('2d');
      if (!baseCtx) return;

      baseCtx.fillStyle = '#ffffff';
      baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);

      const renderTask = page.render({
        canvasContext: baseCtx,
        viewport: viewport,
      });
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      renderTaskRef.current = null;

      // Draw overlay on visible canvas
      drawCanvasWithOverlay();
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error("PDF Base render failed:", err);
      }
    }
  };

  // When PDF doc or currentPage changes, render base page
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPdfBasePage(currentPage);
    }
  }, [currentPage, pdfBytes]);

  // When signature params or page scope change, instantly redraw overlay without PDF.js re-render
  useEffect(() => {
    if (baseCanvasRef.current) {
      drawCanvasWithOverlay();
    }
  }, [stampCoords, stampWidth, method, typedName, fontFamily, uploadedSigUrl, hasDrawn, drawPadVersion, pageScope, customPages, currentPage, totalPages]);

  const handlePdfUpload = (file: File) => {
    setIsProcessing(true);
    setSuccess(false);
    setSignedBytes(null);
    setStampCoords(null);
    setCurrentPage(1);
    setPageScope('current');
    setCustomPages("");
    
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

  // Drawing Pad Canvas Handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setDrawPadVersion(v => v + 1);
  };

  const clearDrawPad = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    setDrawPadVersion(v => v + 1);
  };

  // Upload Signature Image handler
  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        const url = URL.createObjectURL(file);
        setUploadedSigUrl(url);
        
        const img = new Image();
        img.onload = () => {
          uploadedSigImgRef.current = img;
          setDrawPadVersion(v => v + 1);
        };
        img.src = url;

        const reader = new FileReader();
        reader.onload = (event) => {
          const arrBuffer = event.target?.result as ArrayBuffer;
          setUploadedSigBytes(new Uint8Array(arrBuffer));
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast.error("Please upload valid PNG or JPEG images.");
      }
    }
  };

  // Interactive PDF Canvas click / drag position handlers
  const calculateCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePreviewPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = calculateCanvasCoords(e);
    if (!coords) return;
    setIsDraggingStamp(true);
    setStampCoords(coords);
  };

  const handlePreviewPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingStamp) return;
    const coords = calculateCanvasCoords(e);
    if (coords) {
      setStampCoords(coords);
    }
  };

  const handlePreviewPointerUp = () => {
    setIsDraggingStamp(false);
  };

  // Execute Signature Merging
  const applySignature = async () => {
    if (!pdfBytes) {
      toast.error("Please upload a PDF file first.");
      return;
    }

    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const activeCoords = stampCoords || {
      x: canvasWidth / 2,
      y: Math.max(60, canvasHeight * 0.82),
    };

    const targetIndices = getTargetPageIndices(pageScope, currentPage, totalPages, customPages);
    if (targetIndices.length === 0) {
      toast.error("Please specify at least one valid page to apply your signature.");
      return;
    }
    
    setIsProcessing(true);
    try {
      let signatureImgBytes: Uint8Array | null = null;

      // Extract signature image based on method
      if (method === 'draw') {
        const drawCanvas = drawCanvasRef.current;
        if (!drawCanvas || !hasDrawn) {
          toast.error("Please draw your signature on the pad first.");
          setIsProcessing(false);
          return;
        }
        
        // Export drawing pad canvas to PNG data URL
        const dataUrl = drawCanvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        const raw = window.atob(base64);
        signatureImgBytes = new Uint8Array(new ArrayBuffer(raw.length));
        for (let i = 0; i < raw.length; i++) {
          signatureImgBytes[i] = raw.charCodeAt(i);
        }
      } else if (method === 'type') {
        if (!typedName.trim()) {
          toast.error("Please type your name first.");
          setIsProcessing(false);
          return;
        }

        const textCanvas = document.createElement('canvas');
        textCanvas.width = 600;
        textCanvas.height = 220;
        const ctx = textCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 600, 220);
          
          let selectedFont = '48px "Brush Script MT", cursive';
          if (fontFamily === 'Lucida Handwriting') selectedFont = '36px "Lucida Handwriting", cursive';
          else if (fontFamily === 'Apple Chancery') selectedFont = '42px "Apple Chancery", cursive';
          
          ctx.font = selectedFont;
          ctx.fillStyle = '#0f172a'; // ink dark blue
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(typedName, 300, 110);
        }
        const dataUrl = textCanvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        const raw = window.atob(base64);
        signatureImgBytes = new Uint8Array(new ArrayBuffer(raw.length));
        for (let i = 0; i < raw.length; i++) {
          signatureImgBytes[i] = raw.charCodeAt(i);
        }
      } else if (method === 'upload') {
        if (!uploadedSigBytes) {
          toast.error("Please upload a signature image first.");
          setIsProcessing(false);
          return;
        }
        signatureImgBytes = uploadedSigBytes;
      }

      if (!signatureImgBytes) {
        toast.error("Invalid signature input.");
        setIsProcessing(false);
        return;
      }

      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      // Embed signature image once (support PNG or JPG)
      let embeddedImg;
      try {
        embeddedImg = await pdfDoc.embedPng(signatureImgBytes);
      } catch {
        embeddedImg = await pdfDoc.embedJpg(signatureImgBytes);
      }

      // Draw signature onto all targeted pages
      for (const pageIdx of targetIndices) {
        if (pageIdx < 0 || pageIdx >= pages.length) continue;
        const page = pages[pageIdx];
        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Map canvas coordinates back to PDF coordinates
        const pdfX = (activeCoords.x / canvasWidth) * pageWidth;
        const pdfY = ((canvasHeight - activeCoords.y) / canvasHeight) * pageHeight;
        const pdfWidth = (stampWidth / canvasWidth) * pageWidth;
        const pdfHeight = ((stampWidth * 0.38) / canvasHeight) * pageHeight;

        page.drawImage(embeddedImg, {
          x: pdfX - pdfWidth / 2,
          y: pdfY - pdfHeight / 2,
          width: pdfWidth,
          height: pdfHeight,
        });
      }

      const compiledBytes = await pdfDoc.save();
      setSignedBytes(compiledBytes);
      setSuccess(true);
      toast.success(`Signature stamped on ${targetIndices.length} ${targetIndices.length === 1 ? 'page' : 'pages'} successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign PDF document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSigned = () => {
    if (!signedBytes || !pdfFile) return;
    const blob = new Blob([uint8ArrayToArrayBuffer(signedBytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    
    const dl = document.createElement('a');
    dl.href = url;
    dl.download = pdfFile.name.replace(/\.pdf$/i, '_signed.pdf');
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (_) {}
      renderTaskRef.current = null;
    }
    baseCanvasRef.current = null;
    setPdfFile(null);
    setPdfBytes(null);
    pdfDocRef.current = null;
    setTotalPages(0);
    setCurrentPage(1);
    setSignedBytes(null);
    setStampCoords(null);
    setUploadedSigBytes(null);
    setUploadedSigUrl("");
    setTypedName("");
    setHasDrawn(false);
    setPageScope('current');
    setCustomPages("");
    setIsProcessing(false);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag-and-drop triggers
  const handleDragOverUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverUpload(true);
  };

  const handleDragLeaveUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverUpload(false);
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

  const currentTargetIndices = getTargetPageIndices(pageScope, currentPage, totalPages, customPages);
  const isSignatureOnCurrentPage = currentTargetIndices.includes(currentPage - 1);

  return (
    <ToolLayout>
      <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250 font-sans">
        <MeshGradient />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Navigation Link */}
          <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group cursor-pointer">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </Link>

          {/* Main Workspace Card */}
          <div className="glass rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl mb-16 bg-white dark:bg-black/[0.15]">
            
            {/* Header Banner */}
            <div className="p-8 sm:p-10 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                    <PenTool className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Sign PDF</h1>
                    <p className="text-slate-600 dark:text-gray-400 font-medium mt-1">Create electronic signatures and place them on document contract pages locally.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 h-fit">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">100% Client-Side</span>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 bg-white dark:bg-black/[0.15]">
              {success && signedBytes && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-10 p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-[2rem] text-center"
                >
                  <div className="w-16 h-16 bg-emerald-500/25 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">PDF Signed Successfully!</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Your digital signature has been stamped onto the PDF page locally.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button 
                      onClick={downloadSigned} 
                      className="flex items-center gap-2 px-7 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Signed PDF
                    </button>
                    <button 
                      onClick={resetAll} 
                      className="px-7 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Start New File
                    </button>
                  </div>
                </motion.div>
              )}

              {!pdfFile ? (
                <div
                  onDragOver={handleDragOverUpload}
                  onDragLeave={handleDragLeaveUpload}
                  onDrop={handleDropUpload}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[1.5rem] py-8 sm:py-12 px-6 sm:px-10 text-center transition-all cursor-pointer group relative overflow-hidden
                    ${isDraggingOverUpload 
                      ? 'border-blue-500 bg-blue-500/10 scale-[1.01] shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:border-blue-400 dark:hover:border-white/20'
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
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 group-hover:border-blue-500/50 shadow-sm transition-all duration-300">
                      <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">Upload PDF to Sign</h3>
                    <p className="text-slate-500 dark:text-gray-400 font-medium max-w-sm mx-auto mb-5 text-xs sm:text-sm">
                      Drag and drop your PDF file here, or click to browse files.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5 uppercase tracking-wider">
                      🔒 Browser local. Files never leave your browser context.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-500">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white line-clamp-1 text-left">{pdfFile.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 font-semibold mt-0.5 text-left">
                          {formatBytes(pdfFile.size)} • {totalPages} Pages
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={resetAll}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2.5 border border-red-500/20 hover:border-red-500/50 bg-red-500/5 text-[10px] font-black text-red-600 dark:text-red-500 hover:text-white hover:bg-red-500 uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove File
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="space-y-8 lg:col-span-5 text-left">
                      <div className="glass p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/5 pb-4 flex items-center gap-2">
                          <PenTool className="w-4 h-4 text-blue-600 dark:text-blue-500" /> Create Signature
                        </h3>

                        {/* Method Selector */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setMethod('draw')}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                              method === 'draw'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white shadow-xs'
                            }`}
                          >
                            <PenTool className="w-3.5 h-3.5" /> Draw
                          </button>
                          <button
                            onClick={() => setMethod('type')}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                              method === 'type'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white shadow-xs'
                            }`}
                          >
                            <Type className="w-3.5 h-3.5" /> Type
                          </button>
                          <button
                            onClick={() => setMethod('upload')}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                              method === 'upload'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white shadow-xs'
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> Upload
                          </button>
                        </div>

                        {/* Signature Creation Workspace */}
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 min-h-[170px] flex items-center justify-center relative overflow-hidden shadow-xs dark:shadow-none">
                          
                          {method === 'draw' && (
                            <div className="w-full h-full flex flex-col items-center gap-3">
                              <canvas
                                ref={drawCanvasRef}
                                width={400}
                                height={150}
                                onPointerDown={startDrawing}
                                onPointerMove={draw}
                                onPointerUp={stopDrawing}
                                onPointerLeave={stopDrawing}
                                className="bg-white rounded-xl border border-slate-300 dark:border-white/10 touch-none cursor-crosshair max-w-full shadow-inner"
                              />
                              <button 
                                onClick={clearDrawPad}
                                className="px-4 py-2 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                              >
                                Clear Pad
                              </button>
                            </div>
                          )}

                          {method === 'type' && (
                            <div className="w-full space-y-4">
                              <input
                                type="text"
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                                placeholder="Type your signature..."
                                className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />

                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { name: 'Classic Script', font: 'Brush Script MT' },
                                  { name: 'Handwritten', font: 'Lucida Handwriting' },
                                  { name: 'Formal Cursive', font: 'Apple Chancery' }
                                ].map((f) => (
                                  <button
                                    key={f.font}
                                    onClick={() => setFontFamily(f.font)}
                                    style={{ fontFamily: f.font }}
                                    className={`py-2 px-1 text-xs border rounded-lg transition-all cursor-pointer ${
                                      fontFamily === f.font 
                                        ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                  >
                                    {f.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {method === 'upload' && (
                            <div className="w-full">
                              <div 
                                onClick={() => sigImageInputRef.current?.click()}
                                className="border border-dashed border-slate-300 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[#030712]/50 p-4 text-center hover:bg-slate-100 dark:hover:bg-white/[0.02] cursor-pointer"
                              >
                                <input
                                  type="file"
                                  ref={sigImageInputRef}
                                  onChange={handleSignatureImageUpload}
                                  accept="image/png, image/jpeg, image/jpg"
                                  className="hidden"
                                />
                                {uploadedSigUrl ? (
                                  <div className="flex items-center gap-3">
                                    <img src={uploadedSigUrl} alt="Signature Upload" className="max-h-16 max-w-[120px] object-contain rounded border border-slate-200 dark:border-white/5 bg-white" />
                                    <div className="text-left overflow-hidden">
                                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">Loaded Signature</p>
                                      <p className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase">Click to replace</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1 py-2 text-slate-600 dark:text-gray-500">
                                    <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-400 dark:text-gray-600" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-400">Select Image File</p>
                                    <p className="text-[8px] font-bold text-slate-500 dark:text-gray-600">Supports PNG (recommended), JPG, JPEG</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Stamp Size config */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400">
                            <span>Stamp Scale Width</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{stampWidth}px</span>
                          </div>
                          <input
                            type="range"
                            min="60"
                            max="300"
                            value={stampWidth}
                            onChange={(e) => setStampWidth(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                          />
                        </div>

                        {/* Target Pages Section */}
                        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/5">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-400">
                            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" /> Apply Signature To</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                              {currentTargetIndices.length} {currentTargetIndices.length === 1 ? 'Page' : 'Pages'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'current', label: `Page ${currentPage}` },
                              { id: 'all', label: `All (${totalPages})` },
                              { id: 'last', label: 'Last Page' },
                              { id: 'first', label: 'First Page' },
                              { id: 'custom', label: 'Custom' },
                            ].map((scope) => (
                              <button
                                key={scope.id}
                                onClick={() => setPageScope(scope.id as PageScope)}
                                className={`py-2.5 px-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                                  pageScope === scope.id
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 shadow-xs'
                                }`}
                              >
                                {scope.label}
                              </button>
                            ))}
                          </div>

                          {pageScope === 'custom' && (
                            <div className="space-y-1.5 pt-1">
                              <input
                                type="text"
                                value={customPages}
                                onChange={(e) => setCustomPages(e.target.value)}
                                placeholder={`e.g. 1, 3, 5-${totalPages}`}
                                className="w-full bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-blue-500"
                              />
                              <p className="text-[9px] text-slate-500 dark:text-gray-500 font-medium">
                                Enter comma-separated page numbers or ranges (e.g. 1, 2, 4-6).
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-600/5 border border-blue-100 dark:border-blue-600/10 rounded-2xl">
                          <p className="text-[11px] text-slate-700 dark:text-gray-300 font-medium leading-relaxed font-sans">
                            💡 <strong className="text-slate-900 dark:text-white">Interactive Placement:</strong> Signature is previewed in real-time. <strong>Click or drag on the preview page</strong> to reposition it anywhere on the document.
                          </p>
                        </div>

                        <button
                          onClick={applySignature}
                          disabled={isProcessing || !pdfFile}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          {isProcessing ? 'Applying...' : 'Apply Signature'}
                        </button>
                      </div>
                    </div>

                    {/* Previews panel */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center border border-slate-200 dark:border-white/5 rounded-[2rem] bg-slate-50/50 dark:bg-white/[0.01] p-6 relative min-h-[400px]">
                      {/* Top Bar for page status and navigation */}
                      <div className="flex flex-wrap items-center justify-between gap-3 w-full mb-4 px-2">
                        <div className="flex items-center gap-2">
                          {isSignatureOnCurrentPage ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                              <CheckCircle className="w-3.5 h-3.5" /> Signature Active on Page {currentPage}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 dark:bg-gray-500/10 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                              Signature Disabled on Page {currentPage}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            disabled={currentPage <= 1}
                            onClick={() => { setCurrentPage(c => Math.max(1, c - 1)); }}
                            className="px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-lg text-xs font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer shadow-xs"
                          >
                            Prev
                          </button>
                          <span className="px-3 py-1.5 text-xs text-slate-600 dark:text-gray-400 font-bold uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button 
                            disabled={currentPage >= totalPages}
                            onClick={() => { setCurrentPage(c => Math.min(totalPages, c + 1)); }}
                            className="px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-lg text-xs font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer shadow-xs"
                          >
                            Next
                          </button>
                        </div>
                      </div>

                      <div className="max-w-full overflow-hidden flex items-center justify-center border border-slate-200 dark:border-white/5 rounded-xl bg-white shadow-xl">
                        <canvas 
                          ref={previewCanvasRef} 
                          onPointerDown={handlePreviewPointerDown}
                          onPointerMove={handlePreviewPointerMove}
                          onPointerUp={handlePreviewPointerUp}
                          onPointerLeave={handlePreviewPointerUp}
                          className="max-w-full max-h-[500px] cursor-crosshair touch-none select-none" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO content */}
        {toolArticles['sign-pdf'] && (
          <ToolArticle {...toolArticles['sign-pdf']} />
        )}
      </div>
    </ToolLayout>
  );
}

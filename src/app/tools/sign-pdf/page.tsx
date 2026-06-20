"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, UploadCloud, Trash2,
  Shield, RefreshCw, AlertCircle, CheckCircle,
  ChevronLeft, ArrowRight, Sparkles, Sliders,
  HelpCircle, ChevronDown, PenTool, Type, Image as ImageIcon,
  Check, X
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';
import RelatedTools from '@/components/tools/RelatedTools';
import ToolLayout from '@/components/tools/ToolLayout';

const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

type SignatureMethod = 'draw' | 'type' | 'upload';

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
  
  // Coordinates mapping
  const [stampCoords, setStampCoords] = useState<{ x: number; y: number } | null>(null);
  const [stampWidth, setStampWidth] = useState<number>(150);
  
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
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Load PDF.js dynamically
  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        const lib = await import('pdfjs-dist');
        lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
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

  // Preview Page details
  const renderPreviewPage = async (pageNum: number) => {
    if (!pdfDocRef.current || !pdfjs) return;
    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.75 });
      
      const canvas = previewCanvasRef.current;
      if (canvas) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          // Draw the stamp marker visually on canvas preview
          if (stampCoords) {
            context.strokeStyle = '#2563eb'; // blue primary
            context.lineWidth = 2;
            context.strokeRect(
              stampCoords.x - stampWidth / 2, 
              stampCoords.y - (stampWidth * 0.4) / 2, 
              stampWidth, 
              stampWidth * 0.4
            );
            context.fillStyle = 'rgba(37,99,235,0.1)';
            context.fillRect(
              stampCoords.x - stampWidth / 2, 
              stampCoords.y - (stampWidth * 0.4) / 2, 
              stampWidth, 
              stampWidth * 0.4
            );
            context.fillStyle = '#2563eb';
            context.font = 'bold 9px sans-serif';
            context.fillText("SIGNATURE STAMP", stampCoords.x - stampWidth / 2 + 5, stampCoords.y - (stampWidth * 0.4) / 2 - 5);
          }
        }
      }
    } catch (err) {
      console.error("Preview render failed:", err);
    }
  };

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPreviewPage(currentPage);
    }
  }, [currentPage, pdfBytes, stampCoords, stampWidth]);

  const handlePdfUpload = (file: File) => {
    setIsProcessing(true);
    setSuccess(false);
    setSignedBytes(null);
    setStampCoords(null);
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
      } catch (err) {
        console.error(err);
        toast.error("Failed to read PDF file. Make sure it is not password protected.");
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
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawPad = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Upload Signature Image handler
  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        const url = URL.createObjectURL(file);
        setUploadedSigUrl(url);
        
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

  // Canvas Click event to record stamp coords
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStampCoords({ x, y });
  };

  // Execute Signature Merging
  const applySignature = async () => {
    if (!pdfBytes || !stampCoords) {
      toast.error("Please click on the PDF page preview to place your signature.");
      return;
    }
    
    setIsProcessing(true);
    try {
      let signatureImgBytes: Uint8Array | null = null;
      let isPng = true;

      // Extract signature image based on method
      if (method === 'draw') {
        const canvas = drawCanvasRef.current;
        if (!canvas) return;
        
        // Export drawing pad canvas to PNG data URL
        const dataUrl = canvas.toDataURL('image/png');
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
        textCanvas.width = 400;
        textCanvas.height = 150;
        const ctx = textCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'rgba(0,0,0,0)'; // transparent bg
          ctx.fillRect(0, 0, 400, 150);
          
          let selectedFont = 'cursive';
          if (fontFamily === 'Brush Script MT') selectedFont = '36px "Brush Script MT", cursive';
          else if (fontFamily === 'Lucida Handwriting') selectedFont = '24px "Lucida Handwriting", cursive';
          else selectedFont = '30px "Apple Chancery", cursive';
          
          ctx.font = selectedFont;
          ctx.fillStyle = '#0f172a'; // ink blue
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(typedName, 200, 75);
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
          toast.error("Please upload a signature image.");
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
      const page = pages[currentPage - 1];
      const { width: pageWidth, height: pageHeight } = page.getSize();

      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Map canvas click coordinates back to PDF coordinates
      const pdfX = (stampCoords.x / canvasWidth) * pageWidth;
      const pdfY = ((canvasHeight - stampCoords.y) / canvasHeight) * pageHeight;
      const pdfWidth = (stampWidth / canvasWidth) * pageWidth;
      const pdfHeight = ((stampWidth * 0.4) / canvasHeight) * pageHeight;

      // Embed signature image
      let embeddedImg;
      if (isPng) {
        embeddedImg = await pdfDoc.embedPng(signatureImgBytes);
      } else {
        embeddedImg = await pdfDoc.embedJpg(signatureImgBytes);
      }

      // Draw image onto PDF page
      page.drawImage(embeddedImg, {
        x: pdfX - pdfWidth / 2,
        y: pdfY - pdfHeight / 2,
        width: pdfWidth,
        height: pdfHeight,
      });

      const compiledBytes = await pdfDoc.save();
      setSignedBytes(compiledBytes);
      setSuccess(true);
      toast.success("Signature stamped successfully!");
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

  return (
    <ToolLayout>
      <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans">
        <MeshGradient />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Navigation Link */}
          <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group cursor-pointer">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </Link>

          {/* Main Workspace Card */}
          <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-16">
            
            {/* Header Banner */}
            <div className="p-8 sm:p-10 border-b border-white/5 bg-white/[0.02]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                    <PenTool className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Sign PDF</h1>
                    <p className="text-gray-400 font-medium mt-1">Create electronic signatures and place them on document contract pages locally.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 h-fit">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">100% Client-Side</span>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 bg-black/[0.15]">
              {success && signedBytes && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-10 p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-[2rem] text-center"
                >
                  <div className="w-16 h-16 bg-emerald-500/25 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">PDF Signed Successfully!</h3>
                  <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
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
                      className="px-7 py-4 bg-white/5 border border-white/10 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all cursor-pointer"
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
                  className={`border-2 border-dashed rounded-[3rem] p-12 sm:p-24 text-center transition-all cursor-pointer group relative overflow-hidden
                    ${isDraggingOverUpload 
                      ? 'border-blue-500 bg-blue-500/10 scale-[1.01] shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
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
                    <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-500">
                      <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-3">Upload PDF to Sign</h3>
                    <p className="text-gray-400 font-medium max-w-sm mx-auto mb-8 text-sm">
                      Drag and drop your PDF file here, or click to browse files.
                    </p>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 text-[10px] font-bold text-gray-500 border border-white/5 uppercase tracking-widest">
                      🔒 Browser local. Files never leave your browser context.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white line-clamp-1 text-left">{pdfFile.name}</h4>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5 text-left">
                          {formatBytes(pdfFile.size)} • {totalPages} Pages
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={resetAll}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2.5 border border-red-500/20 hover:border-red-500/50 bg-red-500/5 text-[10px] font-black text-red-500 hover:text-white uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove File
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="space-y-8 lg:col-span-5 text-left">
                      <div className="glass p-6 sm:p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-4 flex items-center gap-2">
                          <PenTool className="w-4 h-4 text-blue-500" /> Create Signature
                        </h3>

                        {/* Method Selector */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setMethod('draw')}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                              method === 'draw'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10 hover:text-white'
                            }`}
                          >
                            <PenTool className="w-3.5 h-3.5" /> Draw
                          </button>
                          <button
                            onClick={() => setMethod('type')}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                              method === 'type'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10 hover:text-white'
                            }`}
                          >
                            <Type className="w-3.5 h-3.5" /> Type
                          </button>
                          <button
                            onClick={() => setMethod('upload')}
                            className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                              method === 'upload'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10 hover:text-white'
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> Upload
                          </button>
                        </div>

                        {/* Signature Creation Workspace */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 min-h-[170px] flex items-center justify-center relative overflow-hidden">
                          
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
                                className="bg-white rounded-xl border border-white/10 touch-none cursor-crosshair max-w-full"
                              />
                              <button 
                                onClick={clearDrawPad}
                                className="px-4 py-2 border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
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
                                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold outline-none"
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
                                        : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
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
                                className="border border-dashed border-white/10 rounded-xl bg-[#030712]/50 p-4 text-center hover:bg-white/[0.02] cursor-pointer"
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
                                    <img src={uploadedSigUrl} alt="Signature Upload" className="max-h-16 max-w-[120px] object-contain rounded border border-white/5 bg-white/5" />
                                    <div className="text-left overflow-hidden">
                                      <p className="text-xs font-black text-white truncate">Loaded Signature</p>
                                      <p className="text-[9px] text-gray-500 font-bold uppercase">Click to replace</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1 py-2 text-gray-500">
                                    <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Select Image File</p>
                                    <p className="text-[8px] font-bold text-gray-600">Supports PNG (recommended), JPG, JPEG</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Stamp Size config */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <span>Stamp Scale Width</span>
                            <span>{stampWidth}px</span>
                          </div>
                          <input
                            type="range"
                            min="60"
                            max="300"
                            value={stampWidth}
                            onChange={(e) => setStampWidth(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>

                        <div className="p-4 bg-blue-600/5 border border-blue-600/10 rounded-2xl">
                          <p className="text-[10px] text-gray-400 font-medium leading-relaxed font-sans">
                            💡 <strong>Interactive Placement:</strong> Navigate to the target page, then **click directly on the preview page** to place the signature stamp marker. You can adjust size and click again to reposition.
                          </p>
                        </div>

                        <button
                          onClick={applySignature}
                          disabled={isProcessing || !stampCoords}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          {isProcessing ? 'Applying...' : 'Apply Signature'}
                        </button>
                      </div>
                    </div>

                    {/* Previews panel */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center border border-white/5 rounded-[2rem] bg-white/[0.01] p-6 relative min-h-[400px]">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                          disabled={currentPage <= 1}
                          onClick={() => { setCurrentPage(c => Math.max(1, c - 1)); setStampCoords(null); }}
                          className="px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs font-bold text-gray-300 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                        >
                          Prev
                        </button>
                        <span className="px-3 py-1.5 text-xs text-gray-400 font-bold uppercase tracking-widest">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button 
                          disabled={currentPage >= totalPages}
                          onClick={() => { setCurrentPage(c => Math.min(totalPages, c + 1)); setStampCoords(null); }}
                          className="px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs font-bold text-gray-300 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                        >
                          Next
                        </button>
                      </div>

                      <div className="max-w-full overflow-hidden flex items-center justify-center border border-white/5 rounded-xl bg-white shadow-xl mt-6">
                        <canvas 
                          ref={previewCanvasRef} 
                          onClick={handleCanvasClick}
                          className="max-w-full max-h-[500px] cursor-crosshair" 
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

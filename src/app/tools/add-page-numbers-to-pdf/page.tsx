"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, UploadCloud, Trash2,
  Shield, RefreshCw, AlertCircle, CheckCircle,
  ArrowRight, Sparkles, Sliders,
  HelpCircle, ChevronDown, ListOrdered
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import ToolLayout from '@/components/tools/ToolLayout';
import PdfToolIcon from '@/components/PdfToolIcon';

const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

type NumberingFormat = 'page-n' | 'page-n-m' | 'n' | 'n-m';
type NumberingPosition = 
  | 'bottom-center' | 'bottom-left' | 'bottom-right' 
  | 'top-center' | 'top-left' | 'top-right';

export default function AddPageNumbersPdf() {
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Configuration Options
  const [format, setFormat] = useState<NumberingFormat>('page-n-m');
  const [position, setPosition] = useState<NumberingPosition>('bottom-center');
  const [startPage, setStartPage] = useState<number>(1);
  const [skipFirst, setSkipFirst] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(10);
  const [textColor, setTextColor] = useState<string>('#6b7280'); // neutral gray
  const [margin, setMargin] = useState<number>(30); // offset margin in points

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [success, setSuccess] = useState(false);
  const [numberedBytes, setNumberedBytes] = useState<Uint8Array | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pdfDocRef = useRef<any>(null);

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

          // Draw a mock visual preview of the page number overlay
          const displayText = getFormattedText(pageNum, totalPages);
          context.font = `${fontSize}px Helvetica`;
          context.fillStyle = textColor;
          
          const textWidth = context.measureText(displayText).width;
          const textHeight = fontSize;
          let x = (viewport.width - textWidth) / 2;
          let y = viewport.height - margin;

          if (position === 'bottom-left') { x = margin; y = viewport.height - margin; }
          else if (position === 'bottom-right') { x = viewport.width - textWidth - margin; y = viewport.height - margin; }
          else if (position === 'top-center') { x = (viewport.width - textWidth) / 2; y = margin + textHeight; }
          else if (position === 'top-left') { x = margin; y = margin + textHeight; }
          else if (position === 'top-right') { x = viewport.width - textWidth - margin; y = margin + textHeight; }

          if (!skipFirst || pageNum > 1) {
            context.fillText(displayText, x, y);
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error("Preview render failed:", err);
      }
    }
  };

  // Render preview on config or page changes
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPreviewPage(currentPage);
    }
  }, [currentPage, pdfBytes, position, format, startPage, skipFirst, fontSize, textColor, margin]);

  const getFormattedText = (pageNum: number, total: number) => {
    const pageNumVal = pageNum - (skipFirst ? 1 : 0) + (startPage - 1);
    const totalVal = total - (skipFirst ? 1 : 0);

    if (format === 'page-n') return `Page ${pageNumVal}`;
    if (format === 'page-n-m') return `Page ${pageNumVal} of ${totalVal}`;
    if (format === 'n') return `${pageNumVal}`;
    return `${pageNumVal} of ${totalVal}`;
  };

  const handlePdfUpload = (file: File) => {
    setIsProcessing(true);
    setSuccess(false);
    setNumberedBytes(null);
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

  const resetAll = () => {
    setPdfFile(null);
    setPdfBytes(null);
    pdfDocRef.current = null;
    setTotalPages(0);
    setCurrentPage(1);
    setNumberedBytes(null);
    setIsProcessing(false);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add numbers execution logic
  const addPageNumbers = async () => {
    if (!pdfBytes) return;
    setIsProcessing(true);
    
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
      };

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const color = hexToRgb(textColor);

      const totalNumbered = pages.length;

      for (let i = 0; i < pages.length; i++) {
        const pageNum = i + 1;
        if (skipFirst && pageNum === 1) continue;

        const page = pages[i];
        const { width, height } = page.getSize();

        const displayText = getFormattedText(pageNum, totalNumbered);
        const textWidth = font.widthOfTextAtSize(displayText, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        let x = (width - textWidth) / 2;
        let y = margin;

        if (position === 'bottom-left') { x = margin; y = margin; }
        else if (position === 'bottom-right') { x = width - textWidth - margin; y = margin; }
        else if (position === 'top-center') { x = (width - textWidth) / 2; y = height - margin - textHeight; }
        else if (position === 'top-left') { x = margin; y = height - margin - textHeight; }
        else if (position === 'top-right') { x = width - textWidth - margin; y = height - margin - textHeight; }

        page.drawText(displayText, {
          x,
          y,
          size: fontSize,
          font,
          color,
          opacity: 1
        });
      }

      const compiledBytes = await pdfDoc.save();
      setNumberedBytes(compiledBytes);
      setSuccess(true);
      toast.success("Page numbers added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add page numbers to PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadNumbered = () => {
    if (!numberedBytes || !pdfFile) return;
    const blob = new Blob([uint8ArrayToArrayBuffer(numberedBytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    
    const dl = document.createElement('a');
    dl.href = url;
    dl.download = pdfFile.name.replace(/\.pdf$/i, '_numbered.pdf');
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
    URL.revokeObjectURL(url);
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
      {/* Main Workspace Card */}
      <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
            
            {/* Header Banner */}
            <div className="p-8 sm:p-10 border-b border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.02]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-center gap-6">
                  <PdfToolIcon toolId="add-page-numbers-to-pdf" size="xl" className="shrink-0" />
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Add Page Numbers to PDF</h1>
                    <p className="text-slate-600 dark:text-gray-400 font-medium mt-1">Configure layout, numbering sequence, and positions locally on your device.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 h-fit shadow-sm">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">100% Secure</span>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10">
              {success && numberedBytes && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-10 p-8 border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl text-center shadow-sm"
                >
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Page Numbers Added!</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    The PDF document has been successfully paginated locally.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button 
                      onClick={downloadNumbered} 
                      className="flex items-center gap-2 px-7 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Numbered PDF
                    </button>
                    <button 
                      onClick={resetAll} 
                      className="px-7 py-4 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
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
                  className={`border-2 border-dashed rounded-3xl py-12 sm:py-20 px-6 sm:px-10 text-center transition-all cursor-pointer group relative overflow-hidden shadow-sm
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
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">Upload PDF File</h3>
                    <p className="text-slate-500 dark:text-gray-400 font-medium max-w-sm mx-auto mb-5 text-sm">
                      Drag and drop your PDF here, or click to browse files.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5 uppercase tracking-wider">
                      🔒 No cloud uploads. Documents are processed locally.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-2xl gap-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white line-clamp-1 text-left">{pdfFile.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-500 font-semibold mt-0.5 text-left">
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

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="space-y-8 lg:col-span-5 text-left">
                      <div className="bg-[#FBFCFE] dark:bg-white/[0.02] p-6 sm:p-8 rounded-3xl border border-[#E6ECF5] dark:border-white/5 space-y-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-[#E6ECF5] dark:border-white/5 pb-4 flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-500" /> Numbering Settings
                        </h3>

                        {/* Format */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Number Format</label>
                          <select 
                            value={format}
                            onChange={(e) => setFormat(e.target.value as NumberingFormat)}
                            className="w-full bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-bold outline-none cursor-pointer shadow-sm"
                          >
                            <option value="page-n-m">Page X of Y</option>
                            <option value="page-n">Page X</option>
                            <option value="n-m">X of Y</option>
                            <option value="n">X</option>
                          </select>
                        </div>

                        {/* Position Grid */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Position Placement</label>
                          <div className="grid grid-cols-3 gap-2 border border-slate-200 dark:border-white/5 rounded-2xl p-3 bg-slate-50 dark:bg-[#030712]/50 shadow-inner">
                            {([
                              'top-left', 'top-center', 'top-right',
                              'bottom-left', 'bottom-center', 'bottom-right'
                            ] as NumberingPosition[]).map((pos) => {
                              const posLabels: Record<string, string> = {
                                'top-left': '↖ Top Left', 'top-center': '↑ Top Center', 'top-right': '↗ Top Right',
                                'bottom-left': '↙ Bottom Left', 'bottom-center': '↓ Bottom Center', 'bottom-right': '↘ Bottom Right'
                              };
                              return (
                                <button
                                  key={pos}
                                  onClick={() => setPosition(pos)}
                                  className={`py-2 px-1 text-[8px] rounded-lg font-black uppercase tracking-wider transition-all border cursor-pointer ${
                                    position === pos
                                      ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                      : 'bg-white dark:bg-white/5 text-slate-600 dark:text-gray-500 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-900 dark:hover:text-white shadow-sm'
                                  }`}
                                >
                                  {posLabels[pos]}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Pagination Offset and Skip Cover */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Start Page No.</label>
                            <input
                              type="number"
                              min="1"
                              value={startPage}
                              onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs font-bold outline-none shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Offset Margin (pt)</label>
                            <input
                              type="number"
                              min="10"
                              max="100"
                              value={margin}
                              onChange={(e) => setMargin(Math.max(10, Math.min(100, parseInt(e.target.value) || 30)))}
                              className="w-full bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs font-bold outline-none shadow-sm"
                            />
                          </div>
                        </div>

                        {/* Font size and Skip cover checklist */}
                        <div className="space-y-4 pt-2">
                          <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 dark:text-gray-300 font-semibold select-none">
                            <input 
                              type="checkbox"
                              checked={skipFirst}
                              onChange={(e) => setSkipFirst(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-white/10 bg-white dark:bg-[#030712] text-blue-600 focus:ring-0"
                            />
                            <span>Skip Cover Page (Number from page 2)</span>
                          </label>

                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">
                              <span>Font Size</span>
                              <span>{fontSize}px</span>
                            </div>
                            <input
                              type="range"
                              min="8"
                              max="24"
                              value={fontSize}
                              onChange={(e) => setFontSize(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>
                        </div>

                        <button
                          onClick={addPageNumbers}
                          disabled={isProcessing}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ListOrdered className="w-4 h-4" />}
                          {isProcessing ? 'Processing...' : 'Add Page Numbers'}
                        </button>
                      </div>
                    </div>

                    {/* Previews panel */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center border border-[#E6ECF5] dark:border-white/5 rounded-3xl bg-[#FBFCFE] dark:bg-white/[0.01] p-6 relative min-h-[400px] shadow-sm">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-lg text-xs font-bold text-slate-700 dark:text-gray-300 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer shadow-sm"
                        >
                          Prev
                        </button>
                        <span className="px-3 py-1.5 text-xs text-slate-600 dark:text-gray-400 font-bold uppercase tracking-widest">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button 
                          disabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-lg text-xs font-bold text-slate-700 dark:text-gray-300 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer shadow-sm"
                        >
                          Next
                        </button>
                      </div>

                      <div className="max-w-full overflow-hidden flex items-center justify-center border border-slate-200 dark:border-white/5 rounded-xl bg-white shadow-xl mt-6">
                        <canvas ref={canvasRef} className="max-w-full max-h-[500px]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* SEO content */}
        {toolArticles['add-page-numbers-to-pdf'] && (
          <ToolArticle {...toolArticles['add-page-numbers-to-pdf']} />
        )}
    </ToolLayout>
  );
}

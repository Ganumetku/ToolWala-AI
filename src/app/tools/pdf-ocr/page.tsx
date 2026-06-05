"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, UploadCloud, Trash2,
  Shield, RefreshCw, AlertCircle, CheckCircle,
  ChevronLeft, ArrowRight, Sparkles, Copy, Check,
  Sliders, Grid, Zap, ShieldCheck, Eye, FileDown,
  Share2, ChevronRight, Files
} from 'lucide-react';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';

// Helper to slice buffer to avoid Detached/Neutered ArrayBuffer error from PDF.js workers
const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

const LANGUAGES = [
  { name: 'English', code: 'eng' },
  { name: 'Spanish', code: 'spa' },
  { name: 'French', code: 'fra' },
  { name: 'German', code: 'deu' },
  { name: 'Hindi', code: 'hin' },
  { name: 'Japanese', code: 'jpn' }
];

export default function PdfOcrScanner() {
  const [mounted, setMounted] = useState(false);
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  
  // OCR Configuration & Results States
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [totalPages, setTotalPages] = useState(0);
  const [processingPage, setProcessingPage] = useState(0);
  const [pageProgress, setPageProgress] = useState(0);
  
  // Tab states: 'combined' | 'by-page'
  const [activeTab, setActiveTab] = useState<'combined' | 'by-page'>('combined');
  const [currentPageView, setCurrentPageView] = useState(1);
  
  // Extracted text content
  const [combinedText, setCombinedText] = useState("");
  const [pagesText, setPagesText] = useState<string[]>([]);
  
  // Status states
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing OCR Engine...");
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize PDF.js worker dynamically
  useEffect(() => {
    setMounted(true);
    const loadPdfjs = async () => {
      try {
        const lib = await import('pdfjs-dist');
        lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
        setPdfjs(lib);
      } catch (err) {
        console.error("Failed to load pdfjs-dist:", err);
        toast.error("Failed to initialize PDF renderer engine.");
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

  // ------------------------------------
  // UPLOAD HANDLER
  // ------------------------------------
  const handlePdfUpload = (file: File) => {
    setIsProcessing(true);
    setSuccess(false);
    setCombinedText("");
    setPagesText([]);
    setTotalPages(0);
    setProcessingPage(0);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        
        if (!pdfjs) {
          toast.error("PDF engine is starting up. Please try again in a moment.");
          setIsProcessing(false);
          return;
        }

        setLoadingText("Reading PDF pages...");
        // Pass a sliced clone to pdfjs to prevent neutering the original array buffer
        const loadingTask = pdfjs.getDocument({ data: bytes.slice() });
        const doc = await loadingTask.promise;
        
        setPdfBytes(bytes);
        setPdfFile(file);
        setTotalPages(doc.numPages);
        setCurrentPageView(1);
        toast.success(`Loaded PDF with ${doc.numPages} pages.`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse PDF document. Make sure it is not encrypted.");
        resetAll();
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
        toast.error("Please upload valid PDF documents only.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfBytes(null);
    setTotalPages(0);
    setProcessingPage(0);
    setCombinedText("");
    setPagesText([]);
    setSuccess(false);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Sync edits between Page-by-page text area and Combined text area
  const handlePageTextEdit = (newText: string, index: number) => {
    setPagesText(prev => {
      const updated = [...prev];
      updated[index] = newText;
      
      // Regenerate combined text automatically
      const compiled = updated.map((txt, i) => `--- Page Break (Page ${i + 1}) ---\n\n${txt}`).join('\n\n');
      setCombinedText(compiled);
      
      return updated;
    });
  };

  const handleCombinedTextEdit = (newText: string) => {
    setCombinedText(newText);
    
    // Parse combined text back into page segments if page breaks exist
    if (newText.includes('--- Page Break (Page ')) {
      const parts = newText.split(/--- Page Break \(Page \d+\) ---\n\n/);
      // Remove first empty split if present
      const cleanParts = parts[0] === "" ? parts.slice(1) : parts;
      
      const updatedPages = Array.from({ length: totalPages }, (_, i) => {
        return cleanParts[i] || "";
      });
      setPagesText(updatedPages);
    }
  };

  // ------------------------------------
  // SEQUENTIAL PAGE OCR RUNNER
  // ------------------------------------
  const runOcrScanner = async () => {
    if (!pdfBytes || !pdfjs || totalPages === 0) return;

    setIsProcessing(true);
    setLoadingText("Initializing OCR Engine...");
    setPageProgress(0);
    setProcessingPage(1);

    try {
      const { createWorker } = await import('tesseract.js');
      
      // Initialize Tesseract Worker once for all pages
      const worker = await createWorker(selectedLanguage, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setPageProgress(Math.round(m.progress * 100));
          }
        }
      });

      const docLoading = pdfjs.getDocument({ data: pdfBytes.slice() });
      const pdfjsDoc = await docLoading.promise;
      const extractedPages: string[] = [];

      // Process pages sequentially to manage memory
      for (let i = 1; i <= totalPages; i++) {
        setProcessingPage(i);
        setPageProgress(0);
        setLoadingText(`Rendering Page ${i} of ${totalPages}...`);

        const page = await pdfjsDoc.getPage(i);
        // Render at 2.0x scale to provide clear characters for OCR
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
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

          setLoadingText(`Digitizing Page ${i} of ${totalPages}...`);
          
          // Execute OCR directly on offscreen canvas element
          const result = await worker.recognize(canvas);
          extractedPages.push(result.data.text);
        } else {
          extractedPages.push(`[Error: Page ${i} render failed]`);
        }
      }

      await worker.terminate();

      // Compile final outputs
      setPagesText(extractedPages);
      const combined = extractedPages.map((txt, i) => `--- Page Break (Page ${i + 1}) ---\n\n${txt}`).join('\n\n');
      setCombinedText(combined);
      setSuccess(true);
      toast.success("OCR character extraction complete!");
    } catch (err) {
      console.error(err);
      toast.error("OCR Scanner failed to parse characters from PDF.");
    } finally {
      setIsProcessing(false);
      setProcessingPage(0);
    }
  };

  // ------------------------------------
  // EXPORT UTILITIES
  // ------------------------------------
  const copyToClipboard = () => {
    if (!combinedText) return;
    navigator.clipboard.writeText(combinedText);
    setIsCopied(true);
    toast.success("Extracted text copied to clipboard.");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const exportAsTxt = () => {
    if (!combinedText || !pdfFile) return;
    
    const blob = new Blob([combinedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    const filename = pdfFile.name.replace('.pdf', '_extracted.txt');
    
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    toast.success("Text file downloaded.");
  };

  const exportAsDoc = () => {
    if (!combinedText || !pdfFile) return;

    // Word DOC compatible HTML representation
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Extracted Text Document</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #000000;
          }
          .page-break-header {
            color: #555555;
            font-weight: bold;
            border-bottom: 1px solid #cccccc;
            padding-bottom: 4px;
            margin-top: 24px;
            margin-bottom: 12px;
          }
        </style>
      </head>
      <body>
        ${combinedText
          .replace(/--- Page Break \(Page (\d+)\) ---/g, '<div class="page-break-header">Page Break (Page $1)</div>')
          .replace(/\n/g, '<br/>')}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    const filename = pdfFile.name.replace('.pdf', '_extracted.doc');

    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    toast.success("Word DOC document downloaded.");
  };

  const shareTool = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied! Share ToolWala with a teammate ⚡');
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 relative overflow-hidden font-sans">
      <MeshGradient />

      {/* Decorative Glow Grid */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <Link 
          href="/tools" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white cursor-pointer transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Directory
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Sparkles className="w-3.5 h-3.5" />
            100% Secure Client Edge Processing
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 uppercase">
            PDF OCR Scanner <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Digitize scanned files
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium">
            Convert scanned documents, images, and flat PDFs into copyable, searchable text layouts instantly. Your private files never touch a remote server.
          </p>
        </div>

        {/* Workspace Console */}
        <div className="max-w-6xl mx-auto">
          {!pdfFile ? (
            // Upload Area
            <div
              className={`glass rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden ${
                isDraggingOverUpload 
                  ? 'border-blue-500 bg-blue-600/5 shadow-[0_0_40px_rgba(37,99,235,0.15)]' 
                  : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.03]'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOverUpload(true); }}
              onDragLeave={() => setIsDraggingOverUpload(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOverUpload(false);
                const file = e.dataTransfer.files?.[0];
                if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
                  handlePdfUpload(file);
                } else {
                  toast.error("Please drop a valid PDF file.");
                }
              }}
            >
              <div className="px-6 py-20 sm:p-24 flex flex-col items-center justify-center text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="application/pdf"
                  className="hidden"
                  id="pdf-ocr-upload-input"
                />
                <label 
                  htmlFor="pdf-ocr-upload-input"
                  className="group flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl relative">
                    <UploadCloud className="w-8 h-8 text-blue-500" />
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <h3 className="mb-3 text-2xl font-black tracking-tight text-white">
                    Drag & Drop scanned PDF here
                  </h3>
                  <p className="mb-8 text-sm text-gray-500 font-semibold tracking-wide uppercase">
                    or click to browse from files
                  </p>
                  
                  <div className="inline-flex items-center gap-3.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    Choose PDF File
                  </div>
                </label>
              </div>
            </div>
          ) : (
            // Active Visual Workspace
            <div className="space-y-6">
              
              {/* Document Overview Bar */}
              <div className="glass p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white line-clamp-1">{pdfFile.name}</h4>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                      Size: {formatBytes(pdfFile.size)} • Total: {totalPages} Pages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Language</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none cursor-pointer focus:border-blue-500/50"
                      disabled={isProcessing || success}
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code} className="bg-slate-900">{lang.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="h-5 w-px bg-white/10" />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetAll}
                      disabled={isProcessing}
                      className="px-4 py-2.5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all"
                    >
                      Remove PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Main OCR Grid Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Left Panel: OCR Control Deck */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Process Status Deck */}
                  <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col justify-between flex-1 min-h-[300px]">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 block mb-4">Scanner Status</span>
                      
                      {!isProcessing && !success ? (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                              Ready to scan. Press the action below to download dictionary tables and extract characters.
                            </p>
                          </div>
                        </div>
                      ) : isProcessing ? (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">Extracting Characters</h4>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                              <span className="font-bold">Progress (Page {processingPage} of {totalPages})</span>
                              <span className="font-mono font-bold text-blue-400">{pageProgress}%</span>
                            </div>
                            <div className="w-full bg-white/5 border border-white/5 h-2.5 rounded-full overflow-hidden relative">
                              <div 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                                style={{ width: `${pageProgress}%` }}
                              />
                            </div>
                          </div>

                          <p className="text-[10px] text-gray-500 font-semibold tracking-wide leading-relaxed">
                            Status: <span className="text-gray-300">{loadingText}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h5 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Extraction Complete</h5>
                              <p className="text-xs text-gray-400 leading-relaxed font-medium mt-1">
                                Extracted text is fully editable and ready for copy or document export.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-6">
                      {!success && !isProcessing && (
                        <button
                          onClick={runOcrScanner}
                          className="w-full flex items-center justify-center gap-2.5 px-6 py-4.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" /> Run OCR Scanner
                        </button>
                      )}

                      {success && (
                        <button
                          onClick={resetAll}
                          className="w-full flex items-center justify-center gap-2.5 px-6 py-4.5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 text-gray-400 hover:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" /> Scan Another PDF
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Engine Details Badge */}
                  <div className="glass p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <div className="text-[10px] text-gray-500 font-semibold tracking-wide">
                      <span className="text-white block font-bold uppercase mb-0.5">Browser Sandbox Secure</span>
                      Files are processed via local WebAssembly instance without server exposure.
                    </div>
                  </div>
                </div>

                {/* Right Panel: Output Extracted Content */}
                <div className="lg:col-span-8 flex flex-col">
                  <div className="glass p-6 sm:p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col flex-1 min-h-[450px]">
                    
                    {/* Panel Header & Exporters */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-4 mb-5 gap-4">
                      
                      {/* View Tabs Toggle */}
                      <div className="flex gap-1 bg-black/40 border border-white/5 p-1 rounded-xl">
                        <button
                          onClick={() => setActiveTab('combined')}
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-colors ${
                            activeTab === 'combined'
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          Combined Text
                        </button>
                        <button
                          disabled={pagesText.length === 0}
                          onClick={() => setActiveTab('by-page')}
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-colors disabled:opacity-30 ${
                            activeTab === 'by-page'
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          View by Page
                        </button>
                      </div>

                      {/* Export Toolbar */}
                      {combinedText && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={copyToClipboard}
                            className="p-2.5 bg-white/5 hover:bg-blue-600/10 border border-white/5 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {isCopied ? 'Copied' : 'Copy'}
                          </button>
                          
                          <div className="w-px h-5 bg-white/10" />

                          <button
                            onClick={exportAsTxt}
                            className="p-2.5 bg-white/5 hover:bg-blue-600/10 border border-white/5 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            TXT
                          </button>
                          <button
                            onClick={exportAsDoc}
                            className="p-2.5 bg-white/5 hover:bg-blue-600/10 border border-white/5 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Word DOC
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Extracted Text Layout Workspace */}
                    {combinedText ? (
                      <div className="flex-1 flex flex-col justify-between">
                        
                        {/* If View by Page is active, render Page Navigator */}
                        {activeTab === 'by-page' && pagesText.length > 0 && (
                          <div className="flex items-center justify-between bg-black/30 border border-white/5 px-4 py-2 rounded-xl mb-4 text-xs font-bold text-gray-400">
                            <button
                              disabled={currentPageView === 1}
                              onClick={() => setCurrentPageView(prev => Math.max(prev - 1, 1))}
                              className="p-1 border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.05] rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span>Page {currentPageView} of {totalPages}</span>
                            <button
                              disabled={currentPageView === totalPages}
                              onClick={() => setCurrentPageView(prev => Math.min(prev + 1, totalPages))}
                              className="p-1 border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.05] rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {activeTab === 'combined' ? (
                          <textarea
                            value={combinedText}
                            onChange={(e) => handleCombinedTextEdit(e.target.value)}
                            className="flex-grow w-full min-h-[300px] bg-black/40 border border-white/5 rounded-2xl p-5 text-gray-300 font-mono text-sm leading-relaxed outline-none resize-none focus:border-white/10"
                            placeholder="Editing combined extraction content..."
                          />
                        ) : (
                          <textarea
                            value={pagesText[currentPageView - 1] || ""}
                            onChange={(e) => handlePageTextEdit(e.target.value, currentPageView - 1)}
                            className="flex-grow w-full min-h-[300px] bg-black/40 border border-white/5 rounded-2xl p-5 text-gray-300 font-mono text-sm leading-relaxed outline-none resize-none focus:border-white/10"
                            placeholder={`Editing page ${currentPageView} content...`}
                          />
                        )}

                      </div>
                    ) : (
                      <div className="flex-1 border border-white/5 border-dashed rounded-2xl bg-black/20 flex flex-col items-center justify-center p-12 text-center text-gray-600">
                        <FileText className="w-12 h-12 mb-4 opacity-30" />
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Workspace Ready</p>
                        <p className="text-xs font-semibold max-w-xs mt-1 text-gray-600 leading-relaxed">
                          Configure selected document language options on the left and trigger OCR Scanner.
                        </p>
                      </div>
                    )}

                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-32 max-w-5xl mx-auto border-t border-white/5 pt-24">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Zap className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-lg font-black text-white mb-2">Multi-Page OCR Scanner</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Digitize multi-sheet PDF structures sequentially, optimizing browser processing loops and preventing leaks.
              </p>
            </div>
            <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <FileDown className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-lg font-black text-white mb-2">Word & TXT Compiles</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Download results as raw text (.txt) files or compile them directly into editable Microsoft Word (.doc) layouts.
              </p>
            </div>
            <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-lg font-black text-white mb-2">Zero Data Cloud Exposure</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Parsed, rendered, and extracted locally using secure local workers. Complete privacy for sensitive invoices.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Deep-Dive Article Section */}
        {toolArticles['pdf-ocr'] && (
          <ToolArticle {...toolArticles['pdf-ocr']} />
        )}

        {/* Related Utilities cards */}
        <div className="mt-32 border-t border-white/5 pt-24 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">Related Tools</h2>
              <p className="text-sm text-gray-400 mt-1 font-medium">Discover more professional document operations tools.</p>
            </div>
            <Link 
              href="/tools" 
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors group cursor-pointer"
            >
              All Tools
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Image OCR Card */}
            <Link 
              href="/tools/ocr-to-text"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  IMAGE
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">OCR Image to Text</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Extract text from images, screenshots, and scans instantly using client-side OCR.
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
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Merge PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Combine multiple distinct PDF documents into a single professional-grade file quickly and securely.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Split PDF Card */}
            <Link 
              href="/tools/split-pdf"
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
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Split PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Extract specific pages or ranges from your PDF files into individual documents instantly.
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
    </div>
  );
}

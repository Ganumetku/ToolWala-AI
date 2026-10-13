"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, UploadCloud,
  CheckCircle, RefreshCw, ChevronLeft, Shield, Sparkles,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';
import { convertDocxToPdf } from './utils/docxToPdf';
import PdfToolIcon from '@/components/PdfToolIcon';

export default function WordToPdf() {
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [docxBytes, setDocxBytes] = useState<ArrayBuffer | null>(null);
  
  // Required Workflow States
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convertedFile, setConvertedFile] = useState<Blob | null>(null);

  // Other UI States
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [outputName, setOutputName] = useState("converted_document");
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);

  const [pdfjs, setPdfjs] = useState<any>(null);
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const conversionPromiseRef = useRef<Promise<Blob> | null>(null);
  const conversionGenRef = useRef(0);
  const [progressLabel, setProgressLabel] = useState('');

  // Initialize and load PDF.js dynamically using unpkg worker source for stable Next.js/Turbopack compatibility
  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        const lib = await import('pdfjs-dist');
        lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        setPdfjs(lib);
      } catch (err) {
        console.error("Failed to load pdfjs-dist:", err);
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

  const startConversion = (arrayBuffer: ArrayBuffer) => {
    if (conversionPromiseRef.current) return conversionPromiseRef.current;

    const gen = conversionGenRef.current;
    conversionPromiseRef.current = convertDocxToPdf(arrayBuffer, {
      onProgress: ({ page, total, phase }) => {
        if (gen !== conversionGenRef.current) return;
        if (total > 0) setTotalPages(total);
        if (phase === 'render') {
          setProgress(8);
          setProgressLabel('Reading Word layout…');
          return;
        }
        const pct = Math.min(95, Math.round((page / total) * 95));
        setProgress(pct);
        setProgressLabel(total ? `Rendering page ${page} of ${total}` : 'Rendering pages…');
      },
    }).then((blob) => {
      if (gen !== conversionGenRef.current) {
        throw new Error('Conversion cancelled');
      }
      return blob;
    }).catch((err) => {
      if (conversionGenRef.current === gen) {
        conversionPromiseRef.current = null;
      }
      throw err;
    });

    return conversionPromiseRef.current;
  };

  // ------------------------------------
  // FILE LOADING & VALIDATIONS
  // ------------------------------------
  const handleDocxUpload = async (file: File) => {
    // 50MB Size Validation
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File is too large. Please select a DOCX file smaller than 50MB.");
      return;
    }

    setDocxFile(file);
    setIsUploading(true);
    setIsConverting(false);
    setIsCompleted(false);
    setConvertedFile(null);
    setThumbnailUrls([]);
    setTotalPages(0);
    setProgress(0);
    setError(null);
    setErrorMsg("");
    setOutputName(file.name.replace(/\.[^/.]+$/, "")); // Default output name without extension
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      setDocxBytes(arrayBuffer);
      setIsUploading(false);

      setIsGeneratingPreviews(true);
      try {
        const pdfBlob = await startConversion(arrayBuffer);
        setConvertedFile(pdfBlob);

        if (pdfjs) {
          const pdfData = new Uint8Array(await pdfBlob.arrayBuffer());
          const loadingTask = pdfjs.getDocument({ data: pdfData });
          const doc = await loadingTask.promise;
          setTotalPages(doc.numPages);

          const urls: string[] = [];
          const pagesToRender = Math.min(doc.numPages, 8);
          for (let i = 1; i <= pagesToRender; i++) {
            try {
              const page = await doc.getPage(i);
              const viewport = page.getViewport({ scale: 0.25 });
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
                urls.push(canvas.toDataURL('image/jpeg', 0.85));
              }
            } catch (err) {
              console.error(`Thumbnail failed for page ${i}`, err);
              urls.push('');
            }
          }
          setThumbnailUrls(urls);
        }
      } catch (previewErr) {
        console.error("Preview generation failed:", previewErr);
      } finally {
        setIsGeneratingPreviews(false);
      }
    } catch (err: any) {
      setIsUploading(false);
      setIsGeneratingPreviews(false);
      console.error("Failed to load Word file:", err);
      setError("Failed to parse Word document. It may be corrupted or unsupported.");
      toast.error("Failed to parse Word document.");
      setDocxFile(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.docx')) {
        handleDocxUpload(file);
      } else {
        toast.error("Please upload a valid .docx file only.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetAll = () => {
    conversionGenRef.current += 1;
    conversionPromiseRef.current = null;
    setDocxFile(null);
    setDocxBytes(null);
    setConvertedFile(null);
    setThumbnailUrls([]);
    setTotalPages(0);
    setOutputName("converted_document");
    setProgress(0);
    setProgressLabel('');
    setIsUploading(false);
    setIsConverting(false);
    setIsCompleted(false);
    setIsDownloading(false);
    setError(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ------------------------------------
  // CONVERSION ALGORITHM
  // ------------------------------------
  const processConversion = async () => {
    if (!docxFile || !docxBytes) {
      toast.error("No file uploaded.");
      return;
    }
    
    setIsConverting(true);
    setIsCompleted(false);
    setProgress(0);
    setError(null);
    setErrorMsg("");
    toast.info("Conversion Started", { description: "Keeping original Word layout. Large files take longer." });

    try {
      const pdfBlob = convertedFile || await startConversion(docxBytes);

      setProgress(100);
      setProgressLabel('Done');

      // Store in memory state
      setConvertedFile(pdfBlob);
      setIsConverting(false);
      setIsCompleted(true);
      toast.success("Conversion Complete", { description: "Your PDF is generated and ready to download." });
    } catch (err: any) {
      console.error("DOCX conversion failed:", err);
      const msg = err.message || "An unexpected error occurred during document conversion.";
      setErrorMsg(msg);
      setError(msg);
      setIsConverting(false);
      setIsCompleted(false);
      toast.error("Conversion Failed", { description: "Try converting again or upload a different DOCX." });
    }
  };

  const saveAs = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    if (!convertedFile) {
      toast.error("No converted file found in memory.");
      return;
    }
    
    setIsDownloading(true);
    toast.success("Download Started");
    
    setTimeout(() => {
      const filename = outputName.trim() ? `${outputName.trim()}.pdf` : "converted_document.pdf";
      saveAs(convertedFile, filename);
      setIsDownloading(false);
    }, 600);
  };

  const getAsciiProgressBar = (pct: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((pct / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return "[" + "█".repeat(filledBlocks) + "░".repeat(emptyBlocks) + "] " + pct + "%";
  };

  // Drag-and-drop triggers
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
      if (file.name.endsWith('.docx')) {
        handleDocxUpload(file);
      } else {
        toast.error("Drop .docx documents only.");
      }
    }
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

        {/* Main Tool Container */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          
          {/* Header Banner */}
          <div className="p-8 sm:p-10 border-b border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <PdfToolIcon toolId="word-to-pdf-converter" size="xl" className="shrink-0" />
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Word to PDF Converter</h1>
                  <p className="text-slate-600 dark:text-gray-400 font-medium mt-1">.docx only, up to 50 MB. Legacy .doc will not load. Password-protected Word files fail.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 h-fit shadow-sm">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Secure Processing</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            
            {/* WORKFLOW CONDITIONAL LAYOUTS */}
            <AnimatePresence mode="wait">
              
              {/* INITIAL STATE: Upload Word DOCX */}
              {!docxFile && !isUploading && !isConverting && !isCompleted && !error && (
                <motion.div
                  key="upload-step"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onDragOver={handleDragOverUpload}
                  onDragLeave={handleDragLeaveUpload}
                  onDrop={handleDropUpload}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl py-12 sm:py-20 px-6 sm:px-10 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-sm
                    ${isDraggingOverUpload 
                      ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' 
                      : 'border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] hover:border-blue-500/50 hover:bg-blue-500/[0.02]'
                    }
                  `}
                >
                  <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileUpload} 
                     accept=".docx" 
                     className="hidden" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-blue-600 dark:text-gray-400 border border-slate-200 dark:border-white/10 group-hover:text-blue-500 group-hover:scale-105 transition-all duration-300 shadow-sm">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase">Upload DOCX to Convert</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-5 max-w-sm mx-auto font-medium leading-relaxed font-sans">
                      Drag and drop your Word (.docx) file here, or click to choose from your device. Files remain strictly inside your browser. (Max 50MB)
                    </p>
                    <button className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer">
                      Browse File
                    </button>
                  </div>
                </motion.div>
              )}

              {/* UPLOADING STATE */}
              {isUploading && (
                <motion.div
                  key="uploading-step"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="py-16 text-center max-w-md mx-auto space-y-8"
                >
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-pulse" />
                    <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
                    <UploadCloud className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Reading Word Document...</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-500 font-medium font-sans">Analyzing page layouts and file structures.</p>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CONFIGURATION STATE */}
              {docxFile && !isUploading && !isConverting && !isCompleted && !error && (
                <motion.div
                  key="config-step"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* Left Side: Metadata Card & Notices */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-2xl gap-4 shadow-sm">
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <div className="bg-white dark:bg-[#030712] p-3 rounded-xl border border-slate-200 dark:border-white/5 flex-shrink-0 text-2xl shadow-inner">
                          📄
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">{docxFile.name}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5 font-medium font-sans">
                            {formatBytes(docxFile.size)}
                            {totalPages > 0 && ` • ${totalPages} pages`}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={resetAll} 
                        className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 px-4 py-2 border border-red-200 dark:border-red-500/20 rounded-xl transition-all self-end sm:self-auto cursor-pointer shadow-sm"
                      >
                        Clear File
                      </button>
                    </div>

                    {docxFile.size > 15 * 1024 * 1024 && (
                      <div className="p-4 border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 rounded-xl flex items-center gap-3.5 shadow-sm">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <p className="text-xs text-slate-600 dark:text-gray-400 font-sans leading-relaxed">
                          Note: Large DOCX files might take longer to convert on your device.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <TrustBadge icon="🔒" title="100% Secure" desc="No file upload" />
                      <TrustBadge icon="⚙️" title="Local Processing" desc="Executed on device" />
                      <TrustBadge icon="⏳" title="Fast Conversion" desc="Completed in seconds" />
                      <TrustBadge icon="💸" title="Free Forever" desc="No limits or caps" />
                    </div>

                    {/* PDF Page Previews Grid */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
                        Document Page Previews {totalPages > 8 && `(First 8 of ${totalPages} pages)`}
                      </h4>

                      {isGeneratingPreviews || (docxFile && thumbnailUrls.length === 0) ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-slate-50/70 dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 rounded-3xl gap-4 shadow-sm">
                          <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-500 animate-spin" />
                          <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider">
                            {progressLabel || 'Generating page previews...'}
                          </p>
                          {progress > 0 && (
                            <p className="text-[11px] text-slate-400 font-medium">{progress}%</p>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                          {thumbnailUrls.map((url, idx) => {
                            const pageNum = idx + 1;
                            return (
                              <div 
                                key={idx}
                                className="relative border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden aspect-[3/4] bg-slate-50/70 dark:bg-white/[0.02] flex flex-col justify-between transition-all group hover:border-slate-300 dark:hover:border-white/10 shadow-sm"
                              >
                                <div className="flex-1 flex items-center justify-center p-2 relative overflow-hidden bg-slate-100 dark:bg-white/5">
                                  {url ? (
                                    <img src={url} alt={`Page ${pageNum}`} className="max-h-full max-w-full object-contain rounded shadow-md transition-transform group-hover:scale-[1.02]" />
                                  ) : (
                                    <div className="text-center text-[10px] text-slate-400 dark:text-gray-600 font-bold uppercase">Page {pageNum}</div>
                                  )}
                                </div>
                                <div className="p-2 text-center text-[9px] font-black uppercase tracking-widest bg-white dark:bg-[#030712] border-t border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-500 font-sans">
                                  Page {pageNum}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Configurations Config Sidebar */}
                  <div>
                    <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 p-6 sm:p-8 space-y-8 shadow-sm">
                      
                      <div className="space-y-3 font-sans">
                        <label className="block text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">
                          PDF File Name
                        </label>
                        <input 
                          type="text" 
                          value={outputName}
                          onChange={(e) => setOutputName(e.target.value)}
                          placeholder="converted_document"
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3 text-sm font-bold bg-white dark:bg-[#030712] text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                        />
                      </div>

                      <div className="space-y-3 pt-4 border-t border-[#E6ECF5] dark:border-white/5">
                        <button
                          onClick={processConversion}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] active:scale-95 cursor-pointer font-sans"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Convert Word to PDF
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 & 4: CONVERTING STATE */}
              {isConverting && (
                <motion.div
                  key="converting-step"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="py-16 text-center max-w-md mx-auto space-y-8"
                >
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-pulse" />
                    <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
                    <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Converting your DOCX...</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-500 font-medium font-sans">
                      {progressLabel || 'Keeping original Word layout. This can take a minute on large files.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 px-1 font-mono">
                      <span>Conversion Progress</span>
                      <span>{progress}%</span>
                    </div>
                    
                    {/* ASCII Progress Bar */}
                    <div className="text-xs font-mono text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 py-2.5 px-4 rounded-xl select-none tracking-widest">
                      {getAsciiProgressBar(progress)}
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-full overflow-hidden p-0.5 font-sans">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5 & 6 & 7: SUCCESS STATE CARD */}
              {isCompleted && convertedFile && (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="py-12 text-center max-w-xl mx-auto space-y-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
                >
                  {/* Decorative background glow */}
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Success Checkmark */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
                    className="w-24 h-24 bg-emerald-500/15 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                  >
                    <CheckCircle className="w-12 h-12" />
                  </motion.div>

                  <div className="space-y-3 relative z-10 font-sans">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">✅ Conversion Complete</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">Your PDF document is ready.</p>
                  </div>

                  {/* Summary Block */}
                  <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-left space-y-4 max-w-md mx-auto shadow-sm relative overflow-hidden font-sans">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <h4 className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest pb-3 border-b border-slate-200 dark:border-white/5 font-sans">Conversion Summary</h4>
                    
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-500 dark:text-gray-500 font-medium">Output File:</span>
                        <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px]" title={`${outputName.trim() || 'document'}.pdf`}>
                          {outputName.trim() || 'document'}.pdf
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-gray-500 font-medium">File Size:</span>
                        <span className="text-slate-900 dark:text-white font-bold">{formatBytes(convertedFile.size)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Downloads & Restart Actions */}
                  <div className="flex flex-col items-center gap-4 max-w-sm mx-auto relative z-10 font-sans">
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none font-sans"
                    >
                      {isDownloading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download PDF File
                        </>
                      )}
                    </button>

                    <button
                      onClick={resetAll}
                      className="w-full px-6 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all active:scale-[0.98] cursor-pointer font-sans shadow-sm"
                    >
                      Convert Another File
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 7: ERROR STATE CARD */}
              {error && (
                <motion.div
                  key="error-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-12 text-center max-w-md mx-auto space-y-8"
                >
                  <div className="w-20 h-20 bg-red-500/15 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
                    <AlertCircle className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">❌ Conversion Failed</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium font-sans">{errorMsg || "An error occurred while compiling your PDF document."}</p>
                  </div>

                  <div className="flex flex-col gap-3 font-sans">
                    <button
                      onClick={processConversion}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                    <button
                      onClick={resetAll}
                      className="w-full px-6 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm"
                    >
                      Upload New File
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>

        {/* Dynamic Deep-Dive Article */}
        {toolArticles['word-to-pdf-converter'] && (
          <ToolArticle {...toolArticles['word-to-pdf-converter']} />
        )}

      </div>
    </div>
  );
}

// Sub components
function TrustBadge({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-center shadow-sm">
      <span className="text-xl mb-1.5">{icon}</span>
      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{title}</span>
      <span className="text-[9px] text-slate-500 dark:text-gray-500 font-bold mt-0.5">{desc}</span>
    </div>
  );
}

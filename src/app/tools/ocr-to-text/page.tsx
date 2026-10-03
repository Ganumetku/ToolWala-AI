"use client";

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, RefreshCw, UploadCloud, 
  FileText, Sparkles, AlertCircle, 
  ChevronLeft, Copy, Check, FileDown, Eye, ShieldCheck, Zap, Share2
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { useAnalytics } from '@/hooks/useAnalytics';
import PdfToolIcon from '@/components/PdfToolIcon';

const LANGUAGES = [
  { name: 'English', code: 'eng' },
  { name: 'Spanish', code: 'spa' },
  { name: 'French', code: 'fra' },
  { name: 'German', code: 'deu' },
  { name: 'Hindi', code: 'hin' },
  { name: 'Japanese', code: 'jpn' }
];

export default function OcrToText() {
  const { trackToolRun } = useAnalytics();
  const [mounted, setMounted] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing OCR Engine...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [isCopied, setIsCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    
    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
    setExtractedText("");
    setError(null);
    setProgress(0);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) handleFile(file);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFile]);

  const processOCR = async () => {
    if (!sourceFile) return;
    setIsProcessing(true);
    setLoadingText('Loading OCR engine...');
    setProgress(0);
    setError(null);
    
    try {
      const { createWorker } = await import('tesseract.js');
      
      const worker = await createWorker(selectedLanguage, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setLoadingText(`Extracting text... ${Math.round(m.progress * 100)}%`);
            setProgress(Math.round(m.progress * 100));
          } else {
            setLoadingText(`${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`);
            setProgress(30);
          }
        }
      });
      
      const ret = await worker.recognize(sourceFile);
      setExtractedText(ret.data.text);
      await worker.terminate();
      trackToolRun('ocr-to-text');
    } catch (err) {
      console.error(err);
      setError('Failed to extract text from the image. Please verify it contains readable text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadText = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareTool = () => {
    navigator.clipboard.writeText(window.location.href);
    import('sonner').then(({ toast }) => {
      toast.success('Link copied! Share ToolWala with a teammate ⚡');
    });
  };

  const resetAll = () => {
    setSourceFile(null);
    setSourceUrl(null);
    setExtractedText("");
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const ocrArticle = {
    title: "OCR Image to Text Converter",
    intro: "Unlock text trapped inside images, screenshots, and scans in seconds with browser-native OCR.",
    whatItDoes: "Our online OCR (Optical Character Recognition) reader extracts text from standard graphics formats (JPEG, PNG, WebP) directly on your device. Powered by WebAssembly, the translation model compiles locally in the browser, eliminating privacy concerns by ensuring your files are never uploaded to a cloud server.",
    howToUse: [
      "Upload or drop your image directly into the workspace. You can also paste screenshots directly using Ctrl+V or Cmd+V.",
      "Select the language corresponding to your document's text to ensure character accuracy.",
      "Click 'Run OCR Engine' to start local processing. The extracted text will render instantly inside the workspace text block.",
      "Tweak the resulting output, copy it to your clipboard, or export it as a clean text file."
    ],
    keyFeatures: [
      { title: "Browser-Local Processing", desc: "No file uploads. Text conversion models run inside your device sandboxed memory using WebAssembly." },
      { title: "Multi-Language Support", desc: "Supports key languages including English, Spanish, French, German, Japanese, and Hindi." },
      { title: "Screenshot Clipboard Support", desc: "Skip directory navigations. Simply copy any screenshot and paste it directly on the canvas." },
      { title: "Clean Text Exports", desc: "Quickly copy character extractions or download text formats in one click." }
    ],
    benefits: [
      "100% Privacy: Sensitive invoices, identity documents, and personal journals remain strictly local.",
      "Zero Queue Times: No server queues or scheduling. Run as many extractions as your GPU/CPU allows.",
      "Accurate Formatting: Captures lines, spacing, and characters with high precision."
    ],
    whyChoose: "ToolWala AI's OCR converter replaces heavy cloud-based scanning software with lightweight, browser-native AI. Enjoy premium processing speed, cross-platform adaptability, and absolute file safety for free.",
    useCases: [
      "Students translating physical textbook photos into study notes.",
      "Accountants extracting line-item details from invoice images.",
      "Developers converting UI code screenshots into text formatting.",
      "Professionals saving business card details to workspace directories."
    ],
    faqs: [
      { question: "Is my document secure?", answer: "Yes. Processing runs entirely client-side. We have no backend databases storing your images or parsed text outputs." },
      { question: "Does it support hand-written notes?", answer: "It supports clean, printed handwriting, but accuracy is optimized for digital text, print, and screenshots." },
      { question: "How large of a file can I upload?", answer: "Since operations use your local machine's memory, there are no hard limits. We recommend files below 10MB to maintain speed." }
    ],
    conclusion: "Convert any image format into searchable, copyable text instantly without installing complex scanning applications.",
    relatedTools: [
      { name: "Image Compressor", href: "/tools/image-compressor" },
      { name: "PDF Tools", href: "/tools/pdf-tools" }
    ]
  };

  if (!mounted) return <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712]" />;

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden transition-colors duration-250 font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>
        
        <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
          {/* Header */}
          <div className="p-8 sm:p-12 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <PdfToolIcon toolId="ocr-to-text" size="xl" className="shrink-0" />
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">OCR Image to Text</h1>
                  <p className="text-gray-400 font-medium mt-1 font-sans">Extract text from images, screenshots, and scans locally in the browser.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Secure Processing</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">100% Client-Side</span>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-500/50" />
              </div>
            </div>
          </div>
          
          <div className="p-8 sm:p-12">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8 bg-red-500/10 text-red-400 p-5 rounded-2xl flex items-start gap-4 border border-red-500/20"
                >
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-widest">OCR Extraction Failure</h4>
                    <p className="text-sm mt-1 font-medium opacity-80">{error}</p>
                  </div>
                </motion.div>
              )}

              {!sourceUrl && !isProcessing ? (
                <motion.div 
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-[1.5rem] py-8 sm:py-12 px-6 sm:px-10 text-center transition-all duration-300 cursor-pointer group overflow-hidden ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/15 scale-[1.015] shadow-[0_0_50px_rgba(59,130,246,0.35)] ring-4 ring-blue-500/30' 
                      : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden" 
                  />
                  
                  {/* Decorative Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="relative z-10">
                    <motion.div 
                      animate={isDragging ? { scale: 1.1, y: -5 } : {}}
                      className={`mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center mb-4 border transition-all duration-300 ${
                        isDragging 
                          ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-bounce' 
                          : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 shadow-sm'
                      }`}
                    >
                      <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight transition-colors">
                      {isDragging ? 'Drop Image Here to Extract Text!' : 'Drop image here or click to upload'}
                    </h3>
                    <p className="text-slate-500 dark:text-gray-400 mb-5 max-w-sm mx-auto font-medium text-xs sm:text-sm leading-relaxed">Supports JPG, PNG, and WebP. You can also paste screenshots directly (`Ctrl+V` / `Cmd+V`).</p>
                    
                    <div className="flex justify-center gap-6 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">
                      <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-500" /> Free Local OCR</div>
                      <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Private</div>
                    </div>
                  </div>
                </motion.div>
              ) : isProcessing ? (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/[0.01] rounded-[2.5rem] p-16 border border-white/5 shadow-inner flex flex-col items-center justify-center min-h-[450px]"
                >
                  <div className="relative mb-12">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                    <div className="relative bg-blue-600 text-white p-8 rounded-full shadow-[0_0_40px_rgba(37,99,235,0.5)]">
                      <Sparkles className="w-12 h-12 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Recognizing Text</h3>
                  <p className="text-gray-400 mb-10 text-center max-w-sm font-medium">{loadingText}</p>
                  
                  <div className="w-full max-w-md bg-white/5 rounded-full h-3 overflow-hidden border border-white/10 relative">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mt-6">First execution downloads ~15MB dictionary tables</p>
                </motion.div>
              ) : sourceUrl ? (
                <motion.div 
                  key="workspace"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch"
                >
                  {/* Left Column: Input Image Preview & Config */}
                  <div className="lg:col-span-6 flex flex-col gap-8">
                    <div className="glass p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] flex-1 flex flex-col min-h-[350px]">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-4 block">Input File View</span>
                      <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center p-4 flex-1">
                        <img src={sourceUrl} alt="Source Document" className="max-w-full max-h-[350px] object-contain rounded-lg shadow-2xl" />
                      </div>
                    </div>

                    {/* Language Settings and Engine Start */}
                    <div className="glass p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Document Language</label>
                        <select 
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                          disabled={extractedText !== ""}
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code} className="bg-slate-900">{lang.name}</option>
                          ))}
                        </select>
                      </div>

                      {extractedText === "" ? (
                        <button
                          onClick={processOCR}
                          className="w-full flex items-center justify-center gap-3 px-8 py-5 text-sm font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-[0.98]"
                        >
                          <Sparkles className="w-5 h-5" /> Run OCR Engine
                        </button>
                      ) : (
                        <button
                          onClick={resetAll}
                          className="w-full flex items-center justify-center gap-3 px-8 py-5 text-sm font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
                        >
                          <RefreshCw className="w-4 h-4" /> Reset Workspace
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Output Extracted Text Area */}
                  <div className="lg:col-span-6 flex flex-col">
                    <div className="glass p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] flex-1 flex flex-col min-h-[450px]">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
                          <Eye className="w-4 h-4" /> Extracted Text Output
                        </span>
                        {extractedText && (
                          <div className="flex gap-3">
                            <button 
                              onClick={copyToClipboard}
                              className="p-3 bg-white/5 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-blue-600/10 active:scale-95 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                              title="Copy Text"
                            >
                              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                              {isCopied ? "Copied" : "Copy"}
                            </button>
                            <button 
                              onClick={shareTool}
                              className="p-3 bg-white/5 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-blue-600/10 active:scale-95 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                              title="Share Tool"
                            >
                              <Share2 className="w-4 h-4" />
                              Share
                            </button>
                            <button 
                              onClick={downloadText}
                              className="p-3 bg-white/5 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-blue-600/10 active:scale-95 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                              title="Download TXT"
                            >
                              <FileDown className="w-4 h-4" />
                              Export
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {extractedText ? (
                        <textarea
                          value={extractedText}
                          onChange={(e) => setExtractedText(e.target.value)}
                          className="flex-1 w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-gray-300 font-mono text-sm leading-relaxed outline-none resize-none focus:border-white/10"
                        />
                      ) : (
                        <div className="flex-1 border border-white/5 border-dashed rounded-2xl bg-black/20 flex flex-col items-center justify-center p-8 text-center text-gray-600">
                          <FileText className="w-12 h-12 mb-4 opacity-30" />
                          <p className="text-sm font-bold">Workspace Ready</p>
                          <p className="text-xs font-medium max-w-xs mt-1">Configure language parameters on the left and trigger OCR parser.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* SEO Article Section */}
      <ToolArticle {...ocrArticle} />
    </div>
  );
}

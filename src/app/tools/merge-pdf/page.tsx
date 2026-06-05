"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, UploadCloud, Trash2,
  Files, AlertCircle, CheckCircle, RefreshCw,
  ArrowUp, ArrowDown, ChevronLeft, ArrowRight,
  Shield, FileUp, Sparkles, HelpCircle, GripVertical, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';

interface LoadedPdf {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number | null; // null represents reading pages state
  error?: string;
}

export default function MergePdf() {
  const [files, setFiles] = useState<LoadedPdf[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [outputFileName, setOutputFileName] = useState("merged_document");
  const [success, setSuccess] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ------------------------------------
  // HELPERS
  // ------------------------------------
  const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
    return bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPdfPageCount = async (file: File): Promise<number> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Read page count incrementally without building full metadata where possible
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        updateMetadata: false,
        ignoreEncryption: true
      });
      return pdfDoc.getPageCount();
    } catch (err) {
      console.error("Error reading page count:", err);
      return 1; // Fallback default
    }
  };

  // ------------------------------------
  // ACTIONS
  // ------------------------------------
  const handleFiles = async (fileList: FileList | File[]) => {
    setSuccess(false);
    const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList);
    const pdfFiles = filesArray.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));

    if (pdfFiles.length < filesArray.length) {
      toast.warning("Some files were skipped. Only PDF files are supported.");
    }

    if (pdfFiles.length === 0) return;

    const newPdfs: LoadedPdf[] = pdfFiles.map(file => {
      const id = Math.random().toString(36).substring(2, 9);
      return {
        id,
        file,
        name: file.name,
        size: file.size,
        pageCount: null
      };
    });

    setFiles(prev => [...prev, ...newPdfs]);

    // Load page counts asynchronously
    for (const newPdf of newPdfs) {
      try {
        const pageCount = await getPdfPageCount(newPdf.file);
        setFiles(prev => prev.map(item =>
          item.id === newPdf.id
            ? { ...item, pageCount: pageCount > 0 ? pageCount : 1 }
            : item
        ));
      } catch (err) {
        setFiles(prev => prev.map(item =>
          item.id === newPdf.id
            ? { ...item, pageCount: 1, error: "Encrypted or unreadable" }
            : item
        ));
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setSuccess(false);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;

    setFiles(prev => {
      const updated = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
    setSuccess(false);
  };

  const resetAll = () => {
    setFiles([]);
    setProgress(0);
    setIsProcessing(false);
    setSuccess(false);
    setOutputFileName("merged_document");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ------------------------------------
  // HTML5 REORDER HANDLERS
  // ------------------------------------
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOverCard = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDropCard = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setFiles(prev => {
      const updated = [...prev];
      const [movedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, movedItem);
      return updated;
    });
    setDraggedIndex(null);
  };

  // ------------------------------------
  // UPLOAD ZONE DRAG HANDLERS
  // ------------------------------------
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
      handleFiles(e.dataTransfer.files);
    }
  };

  // ------------------------------------
  // PDF MERGING ALGORITHM
  // ------------------------------------
  const processMerge = async () => {
    if (files.length < 2) {
      toast.error("Please add at least 2 PDF files to merge.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const loadedPdf = files[i];
        const arrayBuffer = await loadedPdf.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([uint8ArrayToArrayBuffer(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      const cleanName = outputFileName.trim() ? outputFileName.trim() : "merged_document";
      downloadLink.download = cleanName.endsWith(".pdf") ? cleanName : `${cleanName}.pdf`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      URL.revokeObjectURL(url);
      setSuccess(true);
      toast.success("PDF documents merged successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Error merging PDFs. One of the documents may be password-protected or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats
  const totalFiles = files.length;
  const totalPages = files.reduce((acc, curr) => acc + (curr.pageCount || 0), 0);
  const totalSize = files.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      <MeshGradient />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Navigation Link */}
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* Main Interface Block */}
        <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-16">
          
          {/* Header Banner */}
          <div className="p-8 sm:p-10 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                  <Files className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Merge PDF</h1>
                  <p className="text-gray-400 font-medium mt-1">Combine multiple PDF documents into one single file locally and securely.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 h-fit">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">100% Private</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 bg-black/[0.15]">
            
            {/* Success state */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-[2rem] text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/25 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Merge Completed!</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                  Your PDF was compiled successfully. Your download should have started automatically.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button 
                    onClick={processMerge} 
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <Download className="w-4 h-4" /> Download Again
                  </button>
                  <button 
                    onClick={resetAll} 
                    className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                  >
                    Merge New Files
                  </button>
                </div>
              </motion.div>
            )}

            {/* Layout Split */}
            {files.length === 0 ? (
              
              /* Upload Workspace */
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
                  onChange={(e) => e.target.files && handleFiles(e.target.files)} 
                  multiple 
                  accept="application/pdf" 
                  className="hidden" 
                />
                
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 border border-white/5 group-hover:text-blue-400 group-hover:bg-blue-500/10 group-hover:scale-110 transition-all duration-300 shadow-2xl">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-3">Select PDF files to Merge</h3>
                  <p className="text-sm text-gray-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                    Drag and drop PDF files here, or click to browse. Processing is fully secured inside your browser.
                  </p>
                  <button className="rounded-xl bg-white text-black px-8 py-3.5 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]">
                    Browse Files
                  </button>
                </div>
              </div>
            ) : (
              
              /* Editor Workspace */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* PDF Lists Container (2/3 Col) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                        Arrange Files Sequence
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">Drag file cards or use arrows to sort. Merging starts from the top file.</p>
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600/20 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add More
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => e.target.files && handleFiles(e.target.files)} 
                        multiple 
                        accept="application/pdf" 
                        className="hidden" 
                      />
                    </button>
                  </div>

                  {/* Cards stack */}
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {files.map((pdf, index) => (
                        <motion.div
                          key={pdf.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOverCard(e, index)}
                          onDrop={(e) => handleDropCard(e, index)}
                          className={`flex items-center gap-4 p-5 rounded-2xl border transition-all relative group bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.03] cursor-grab active:cursor-grabbing
                            ${draggedIndex === index ? 'opacity-40 border-blue-500/40 bg-blue-500/5' : ''}
                          `}
                        >
                          {/* Drag Handle */}
                          <div className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0">
                            <GripVertical className="w-5 h-5 cursor-row-resize" />
                          </div>

                          {/* PDF Badge Icon */}
                          <div className="bg-[#030712] p-3 rounded-xl border border-white/5 flex-shrink-0 flex items-center justify-center relative">
                            <FileText className="w-6 h-6 text-red-500" />
                            <span className="absolute bottom-0 right-0 bg-red-600 text-[6px] font-black uppercase px-1 rounded text-white tracking-widest scale-90">PDF</span>
                          </div>

                          {/* Meta Details */}
                          <div className="overflow-hidden flex-1 pr-4">
                            <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md" title={pdf.name}>
                              {pdf.name}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1 font-medium items-center">
                              <span>{formatBytes(pdf.size)}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                              {pdf.pageCount === null ? (
                                <span className="inline-block w-12 h-3 bg-white/5 rounded animate-pulse" />
                              ) : pdf.error ? (
                                <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {pdf.error}</span>
                              ) : (
                                <span>{pdf.pageCount} {pdf.pageCount === 1 ? 'page' : 'pages'}</span>
                              )}
                            </div>
                          </div>

                          {/* Card action controls */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button 
                              onClick={() => moveFile(index, 'up')} 
                              disabled={index === 0} 
                              className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all" 
                              title="Move Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => moveFile(index, 'down')} 
                              disabled={index === files.length - 1} 
                              className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all" 
                              title="Move Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <div className="w-px h-5 bg-white/10 mx-1" />
                            <button 
                              onClick={() => removeFile(pdf.id)} 
                              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" 
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right Side Summary panel (1/3 Col) */}
                <div>
                  <div className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 space-y-8 sticky top-28 self-start bg-white/[0.01]">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pb-4 border-b border-white/5">
                      Merge Configuration
                    </h4>

                    {/* Stats List */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">Total Files</span>
                        <span className="font-bold text-white">{totalFiles}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">Total Pages</span>
                        <span className="font-bold text-white">
                          {totalPages === 0 && files.some(f => f.pageCount === null) ? (
                            <span className="inline-block w-8 h-4 bg-white/5 rounded animate-pulse" />
                          ) : (
                            totalPages
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">Combined Size</span>
                        <span className="font-bold text-white">{formatBytes(totalSize)}</span>
                      </div>
                    </div>

                    {/* File Renamer field */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Output Name
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={outputFileName}
                          onChange={(e) => setOutputFileName(e.target.value)}
                          placeholder="merged_document"
                          className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold bg-[#030712] text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold pointer-events-none">.pdf</span>
                      </div>
                    </div>

                    {/* Progress Loader */}
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-blue-400">
                          <span>Merging documents...</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions button stack */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <button
                        onClick={processMerge}
                        disabled={isProcessing || files.length < 2}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Files className="w-4 h-4" />
                        )}
                        {isProcessing ? 'Merging PDF...' : 'Merge & Download'}
                      </button>

                      <button
                        onClick={resetAll}
                        disabled={isProcessing}
                        className="w-full px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-30"
                      >
                        Reset Workspace
                      </button>
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
            
            {/* Edit PDF Card */}
            <Link 
              href="/tools/pdf-tools/edit-pdf"
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
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Edit PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Add text annotations, fill complex PDF forms, write on documents, and download online.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* OCR Image to Text */}
            <Link 
              href="/tools/ocr-to-text"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  OCR
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <FileUp className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">OCR to Text</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Extract selectable plain text from scanned document pictures, PDFs, or screenshots instantly.
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
      {toolArticles['merge-pdf'] && (
        <ToolArticle {...toolArticles['merge-pdf']} />
      )}
    </div>
  );
}

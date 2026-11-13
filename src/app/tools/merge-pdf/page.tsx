"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Trash2,
  Files, AlertCircle, CheckCircle, RefreshCw,
  ArrowUp, ArrowDown, GripVertical, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';

import { formatBytes } from '@/lib/utils/format';
import { uint8ArrayToArrayBuffer, getPdfPageCount } from '@/lib/pdf/pdfUtils';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';
import UploadZone from '@/components/tools/UploadZone';


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
  const [outputFileName, setOutputFileName] = useState("merged_document");
  const [success, setSuccess] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const { PDFDocument } = await import('pdf-lib');
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
    <ToolLayout>
      {/* Main Interface Block */}
      <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
        
        {/* Header Banner */}
        <ToolHero 
          title="Merge PDF Online – Free & Private"
          description="Merge PDF files online for free. Combine 2 or more PDFs into one in your browser. No upload, no signup."
          icon={<Files className="w-7 h-7" />}
        />

        <div className="p-8 sm:p-10">
          
          {/* Success state */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-8 border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl text-center shadow-sm"
            >
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Merge Completed!</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Your PDF was compiled successfully. Your download should have started automatically.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={processMerge} 
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                >
                  <Download className="w-4 h-4" /> Download Again
                </button>
                <button 
                  onClick={resetAll} 
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                >
                  Merge New Files
                </button>
              </div>
            </motion.div>
          )}

          {/* Layout Split */}
          {files.length === 0 ? (
            <div className="space-y-8">
              <UploadZone
                onFilesSelected={handleFiles}
                accept="application/pdf"
                multiple={true}
                title="Drop PDFs here to merge"
                description="Two or more files. They stay in this tab — nothing is sent to a server."
              />
            </div>
          ) : (
            
            /* Editor Workspace */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* PDF Lists Container (2/3 Col) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
                      Arrange Files Sequence
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Drag file cards or use arrows to sort. Merging starts from the top file.</p>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 border border-blue-200 dark:border-blue-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 transition-all shadow-sm"
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
                        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all relative group bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-100/70 dark:hover:bg-white/[0.03] shadow-sm cursor-grab active:cursor-grabbing
                          ${draggedIndex === index ? 'opacity-40 border-blue-500/40 bg-blue-500/5' : ''}
                        `}
                      >
                        {/* Drag Handle */}
                        <div className="text-slate-400 dark:text-gray-600 group-hover:text-slate-600 dark:group-hover:text-gray-400 transition-colors flex-shrink-0">
                          <GripVertical className="w-5 h-5 cursor-row-resize" />
                        </div>

                        {/* PDF Badge Icon */}
                        <div className="bg-white dark:bg-[#030712] p-3 rounded-xl border border-slate-200 dark:border-white/5 flex-shrink-0 flex items-center justify-center relative shadow-sm">
                          <FileText className="w-6 h-6 text-red-500" />
                          <span className="absolute bottom-0 right-0 bg-red-600 text-[6px] font-black uppercase px-1 rounded text-white tracking-widest scale-90">PDF</span>
                        </div>

                        {/* Meta Details */}
                        <div className="overflow-hidden flex-1 pr-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md" title={pdf.name}>
                            {pdf.name}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-gray-500 mt-1 font-medium items-center">
                            <span>{formatBytes(pdf.size)}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/10" />
                            {pdf.pageCount === null ? (
                              <span className="inline-block w-12 h-3 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
                            ) : pdf.error ? (
                              <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {pdf.error}</span>
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
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all" 
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => moveFile(index, 'down')} 
                            disabled={index === files.length - 1} 
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all" 
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1" />
                          <button 
                            onClick={() => removeFile(pdf.id)} 
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Control Panel (1/3 Col) */}
              <div className="space-y-6">
                <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  
                  {/* Overview Stats */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Merge Overview</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-100/90 dark:bg-black/20 rounded-2xl p-4 border border-slate-200 dark:border-white/5 text-center shadow-sm">
                        <span className="block text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">Files</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{totalFiles}</span>
                      </div>
                      <div className="bg-slate-100/90 dark:bg-black/20 rounded-2xl p-4 border border-slate-200 dark:border-white/5 text-center shadow-sm">
                        <span className="block text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">Pages</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{totalPages}</span>
                      </div>
                      <div className="bg-slate-100/90 dark:bg-black/20 rounded-2xl p-4 border border-slate-200 dark:border-white/5 text-center shadow-sm">
                        <span className="block text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">Size</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white mt-2 block truncate">{formatBytes(totalSize)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Output Configuration */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-[0.2em] block ml-1">
                      Output Filename
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={outputFileName}
                        onChange={(e) => setOutputFileName(e.target.value)}
                        placeholder="merged_document"
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3 text-sm font-bold bg-white dark:bg-[#030712] text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all pr-12 shadow-sm"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-gray-500 font-bold pointer-events-none">.pdf</span>
                    </div>
                  </div>

                  {/* Progress Loader */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                        <span>Merging documents...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
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
                  <div className="space-y-3 pt-4 border-t border-[#E6ECF5] dark:border-white/5">
                    <button
                      onClick={processMerge}
                      disabled={isProcessing || files.length < 2}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(37,99,235,0.3)] active:scale-95"
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
                      className="w-full px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-gray-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl transition-all disabled:opacity-30 shadow-sm"
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



      {/* SEO Deep-Dive Article Section */}
      {toolArticles['merge-pdf'] && (
        <ToolArticle toolId="merge-pdf" preferArticleCopy {...toolArticles['merge-pdf']} />
      )}
    </ToolLayout>
  );
}

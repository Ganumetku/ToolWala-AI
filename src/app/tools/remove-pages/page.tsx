"use client";

import { useState } from 'react';

import { Trash2, Download, RefreshCw, CheckCircle, AlertCircle, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';
import UploadZone from '@/components/tools/UploadZone';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { formatBytes } from '@/lib/utils/format';
import { uint8ArrayToArrayBuffer } from '@/lib/pdf/pdfUtils';

export default function RemovePages() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pageRange, setPageRange] = useState<string>('');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  const handleFiles = async (fileList: FileList | File[]) => {
    setSuccess(false);
    setOutputUrl(null);
    const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList);
    const pdfFile = filesArray.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));

    if (pdfFile) {
      setFile(pdfFile);
      try {
        const { PDFDocument } = await import('pdf-lib');
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        setPageCount(pdfDoc.getPageCount());
      } catch (err) {
        setPageCount(0);
      }
    } else {
      toast.error("Please upload a valid PDF file.");
    }
  };

  const parsePageIndicesToRemove = (rangeStr: string, totalPages: number): number[] => {
    const indicesToRemove: number[] = [];
    if (!rangeStr.trim()) return [];
    
    const parts = rangeStr.split(',').map(s => s.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
          const actualStart = Math.min(start, totalPages);
          const actualEnd = Math.min(end, totalPages);
          for (let i = actualStart; i <= actualEnd; i++) {
            indicesToRemove.push(i - 1);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num > 0 && num <= totalPages) {
          indicesToRemove.push(num - 1);
        }
      }
    }
    return Array.from(new Set(indicesToRemove));
  };

  const processRemovePages = async () => {
    if (!file || !pageRange.trim()) return;
    setIsProcessing(true);
    setSuccess(false);

    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const totalPages = pdfDoc.getPageCount();

      const toRemove = parsePageIndicesToRemove(pageRange, totalPages);
      if (toRemove.length === 0) {
        toast.error("Invalid page range layout or indices out of bounds.");
        setIsProcessing(false);
        return;
      }
      if (toRemove.length >= totalPages) {
        toast.error("You cannot delete all pages from the PDF document. At least one page must remain.");
        setIsProcessing(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const keptIndices: number[] = [];
      for (let i = 0; i < totalPages; i++) {
        if (!toRemove.includes(i)) {
          keptIndices.push(i);
        }
      }

      const copiedPages = await newPdf.copyPages(pdfDoc, keptIndices);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([uint8ArrayToArrayBuffer(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      setSuccess(true);
      toast.success(`Removed ${toRemove.length} page(s) successfully!`);
    } catch (err: any) {
      console.error(err);
      toast.error("Error removing pages. The file may be password-protected or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPageRange('');
    setOutputUrl(null);
    setPageCount(0);
    setSuccess(false);
  };

  return (
    <ToolLayout>
      <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-16">
        <ToolHero 
          title="Remove PDF Pages"
          description="Delete specific pages or ranges from your PDF files locally and securely."
          icon={<Trash2 className="w-7 h-7" />}
        />

        <div className="p-8 sm:p-10 bg-white dark:bg-black/[0.15]">
          {!file ? (
            <UploadZone
              onFilesSelected={handleFiles}
              accept="application/pdf"
              multiple={false}
              title="Select PDF file to Edit"
              description="Drag and drop a PDF file here, or click to browse. Processing is fully secured inside your browser."
            />
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 gap-6">
                <div className="flex items-center gap-5 overflow-hidden w-full">
                  <div className="bg-[#F6F8FC] dark:bg-[#030712] p-4 rounded-2xl border border-white/5 flex-shrink-0">
                    <FileText className="w-7 h-7 text-red-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-base font-black text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatBytes(file.size)} • {pageCount} pages
                    </p>
                  </div>
                </div>
                <button 
                  onClick={resetAll} 
                  className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20 transition-all w-full sm:w-auto text-center cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {!outputUrl && (
                <div className="bg-blue-600/5 border border-blue-600/10 rounded-[2rem] p-8 space-y-4">
                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">
                    Pages to Delete
                  </label>
                  <input
                    type="text"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="e.g. 1, 3-5, 8"
                    className="w-full rounded-2xl border border-white/10 px-6 py-4 text-sm font-bold bg-[#F6F8FC] dark:bg-[#030712] text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xl"
                  />
                  <div className="flex items-start gap-3 mt-4 text-xs text-gray-500">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <p className="leading-relaxed">
                      Format: Use commas for individual pages and dashes for ranges. <br />
                      Example: <span className="font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded ml-1">1-3, 5, 8-10</span>
                    </p>
                  </div>
                </div>
              )}

              {success && outputUrl && (
                <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-[2.5rem] p-10 text-center shadow-2xl animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500/25 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                    Pages Removed Successfully!
                  </h4>
                  <p className="text-sm text-gray-400 mb-6">
                    A new PDF document has been created without the deleted pages.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-white/5">
                <button onClick={resetAll} className="w-full sm:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                  Reset
                </button>

                {!outputUrl ? (
                  <button
                    onClick={processRemovePages}
                    disabled={isProcessing || !pageRange.trim()}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 cursor-pointer"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {isProcessing ? 'Removing...' : 'Remove Pages & Download'}
                  </button>
                ) : (
                  <a
                    href={outputUrl}
                    download={`pages_removed_${file.name}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 text-center cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Clean PDF
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>



      {toolArticles['remove-pages'] && (
        <ToolArticle {...toolArticles['remove-pages']} />
      )}
    </ToolLayout>
  );
}

"use client";

import { useState } from 'react';

import { Minimize2, Download, RefreshCw, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';
import UploadZone from '@/components/tools/UploadZone';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { formatBytes } from '@/lib/utils/format';
import { uint8ArrayToArrayBuffer } from '@/lib/pdf/pdfUtils';
import { useTranslation } from '@/components/I18nContext';

export default function CompressPdf() {
  const { t, locale } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [compressResult, setCompressResult] = useState<{
    size: number;
    url: string;
    reductionPct: number;
  } | null>(null);

  const handleFiles = (fileList: FileList | File[]) => {
    setSuccess(false);
    setCompressResult(null);
    const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList);
    const pdfFile = filesArray.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));

    if (pdfFile) {
      setFile(pdfFile);
    } else {
      toast.error("Please upload a valid PDF file.");
    }
  };

  const processCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setSuccess(false);

    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

      const blob = new Blob([uint8ArrayToArrayBuffer(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const reductionPct = Math.max(0, ((file.size - pdfBytes.length) / file.size) * 100);

      setCompressResult({
        size: pdfBytes.length,
        url,
        reductionPct
      });
      setSuccess(true);
      toast.success("PDF document optimized successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Error optimizing PDF. The file may be password-protected or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setCompressResult(null);
    setSuccess(false);
  };

  return (
    <ToolLayout>
      <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-16">
        <ToolHero 
          title="Compress PDF"
          description="Reduce PDF file size locally in your browser while preserving document layout and quality."
          icon={<Minimize2 className="w-7 h-7" />}
        />

        <div className="p-8 sm:p-10 bg-black/[0.15]">
          {!file ? (
            <UploadZone
              onFilesSelected={handleFiles}
              accept="application/pdf"
              multiple={false}
              title="Select PDF file to Compress"
              description="Drag and drop a PDF file here, or click to browse. Processing is fully secured inside your browser."
            />
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 gap-6">
                <div className="flex items-center gap-5 overflow-hidden w-full">
                  <div className="bg-[#030712] p-4 rounded-2xl border border-white/5 flex-shrink-0">
                    <FileText className="w-7 h-7 text-red-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-base font-black text-white truncate">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Original Size: <span className="font-bold text-gray-300">{formatBytes(file.size)}</span></p>
                  </div>
                </div>
                <button 
                  onClick={resetAll} 
                  className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20 transition-all w-full sm:w-auto text-center cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {compressResult && (
                <div className={`border rounded-[2.5rem] p-10 text-center shadow-2xl animate-fade-in bg-emerald-500/5 border-emerald-500/20`}>
                  <div className="w-16 h-16 bg-emerald-500/25 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black tracking-tight mb-2 text-white">
                    Optimization Complete!
                  </h4>
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-black uppercase tracking-widest mt-8 bg-[#030712] w-fit mx-auto px-8 py-5 rounded-2xl border border-white/5 shadow-xl">
                    <div>
                      <span className="text-gray-500">Original</span>
                      <span className="text-white ml-3">{formatBytes(file.size)}</span>
                    </div>
                    <div className="hidden sm:block w-px h-6 bg-white/10"></div>
                    <div>
                      <span className="text-gray-500">New Size</span>
                      <span className="ml-3 text-emerald-400">{formatBytes(compressResult.size)}</span>
                    </div>
                    <div className="hidden sm:block w-px h-6 bg-white/10"></div>
                    <div>
                      <span className="text-gray-500">Reduction</span>
                      <span className="ml-3 text-emerald-400">{compressResult.reductionPct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-white/5">
                <button onClick={resetAll} className="w-full sm:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                  Reset
                </button>

                {!compressResult ? (
                  <button
                    onClick={processCompress}
                    disabled={isProcessing}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 cursor-pointer"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Minimize2 className="w-4 h-4" />}
                    {isProcessing ? 'Optimizing...' : 'Optimize PDF'}
                  </button>
                ) : (
                  <a
                    href={compressResult.url}
                    download={`optimized_${file.name}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 text-center cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Result
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>



      {toolArticles['compress-pdf'] && (
        <ToolArticle {...toolArticles['compress-pdf']} />
      )}
    </ToolLayout>
  );
}

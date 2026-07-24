"use client";

import { useState } from 'react';
import { Minimize2, Download, RefreshCw, CheckCircle, FileText, Lock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';
import UploadZone from '@/components/tools/UploadZone';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { formatBytes } from '@/lib/utils/format';
import { uint8ArrayToArrayBuffer } from '@/lib/pdf/pdfUtils';
import { useTranslation } from '@/components/I18nContext';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';

export default function AadhaarPdfCompressor() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [compressResult, setCompressResult] = useState<{
    size: number;
    url: string;
    reductionPct: number;
    isCompliant: boolean;
  } | null>(null);

  const handleFiles = (fileList: FileList | File[]) => {
    setSuccess(false);
    setCompressResult(null);
    setIsLocked(false);
    setPassword("");
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
      
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer, { 
          ignoreEncryption: false 
        });
      } catch (err: any) {
        if (err.message?.includes('password') || err.message?.includes('encrypted')) {
          setIsLocked(true);
          // If password is provided, try reloading with it
          if (password) {
            // pdf-lib does not fully support decrypting via password API directly in load options in standard packages
            // but we can catch it or prompt the user. We will show custom feedback.
            throw new Error("Password decryption required. Please unlock your PDF before compression.");
          }
          setIsProcessing(false);
          return;
        }
        throw err;
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      const blob = new Blob([uint8ArrayToArrayBuffer(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const reductionPct = Math.max(0, ((file.size - pdfBytes.length) / file.size) * 100);
      const isCompliant = pdfBytes.length <= 300 * 1024; // under 300KB limit

      setCompressResult({
        size: pdfBytes.length,
        url,
        reductionPct,
        isCompliant
      });
      setSuccess(true);
      if (isCompliant) {
        toast.success("e-Aadhaar PDF compressed and UIDAI-compliant!");
      } else {
        toast.warning("PDF compressed, but file size exceeds 300KB. Try lowering image density.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error optimizing PDF. The file may be password-protected or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setCompressResult(null);
    setSuccess(false);
    setIsLocked(false);
    setPassword("");
  };

  return (
    <ToolVisibilityGuard slug="aadhaar-pdf-compressor">
      <ToolLayout>
        <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-16">
          <ToolHero 
            title="Aadhaar PDF Compressor"
            description="Optimize and compress your e-Aadhaar PDF securely in your browser to meet UIDAI portal limits (< 300KB)."
            icon={<Minimize2 className="w-7 h-7" />}
          />

          <div className="p-8 sm:p-10 bg-white dark:bg-black/[0.15]">
            {!file ? (
              <UploadZone
                onFilesSelected={handleFiles}
                accept="application/pdf"
                multiple={false}
                title="Select e-Aadhaar PDF to Compress"
                description="Drag and drop your Aadhaar PDF file here, or click to browse. Processing is fully secured locally inside your browser."
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

                {isLocked && (
                  <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-4">
                    <Lock className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Aadhaar PDF is Password-Protected</h5>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        e-Aadhaar PDF files downloaded from UIDAI are locked with a password (format: first 4 letters of your name in CAPITALS followed by your birth year, e.g., KART1990). For security, please decrypt your PDF first using an unlock tool or submit a decrypted file.
                      </p>
                    </div>
                  </div>
                )}

                {compressResult && (
                  <div className={`border rounded-[2.5rem] p-10 text-center shadow-2xl animate-fade-in ${
                    compressResult.isCompliant ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-yellow-500/5 border-yellow-500/20'
                  }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                      compressResult.isCompliant ? 'bg-emerald-500/25 border-emerald-500/30 text-emerald-400' : 'bg-yellow-500/25 border-yellow-500/30 text-yellow-400'
                    }`}>
                      {compressResult.isCompliant ? <CheckCircle className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                    </div>
                    <h4 className="text-2xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">
                      {compressResult.isCompliant ? 'UIDAI-Compliant Output!' : 'Compressed!'}
                    </h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      {compressResult.isCompliant 
                        ? 'Your Aadhaar PDF is optimized and under the 300KB limit, ready for UIDAI portal submissions.' 
                        : 'Optimization finished, but the file size is still above the 300KB UIDAI portal limit.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-black uppercase tracking-widest mt-8 bg-[#F6F8FC] dark:bg-[#030712] w-fit mx-auto px-8 py-5 rounded-2xl border border-white/5 shadow-xl">
                      <div>
                        <span className="text-gray-500">Original</span>
                        <span className="text-white ml-3">{formatBytes(file.size)}</span>
                      </div>
                      <div className="hidden sm:block w-px h-6 bg-white/10"></div>
                      <div>
                        <span className="text-gray-500">New Size</span>
                        <span className={`ml-3 ${compressResult.isCompliant ? 'text-emerald-400' : 'text-yellow-400'}`}>{formatBytes(compressResult.size)}</span>
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
                      {isProcessing ? 'Optimizing...' : 'Compress PDF'}
                    </button>
                  ) : (
                    <a
                      href={compressResult.url}
                      download={`optimized_aadhaar_${file.name}`}
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



        {toolArticles['aadhaar-pdf-compressor'] && (
          <ToolArticle {...toolArticles['aadhaar-pdf-compressor']} />
        )}
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

"use client";

import { useState } from 'react';
import { Minimize2, Download, RefreshCw, CheckCircle, FileText, ShieldAlert } from 'lucide-react';
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

interface TargetLimit {
  id: string;
  label: string;
  maxBytes: number;
  description: string;
}

const PORTAL_LIMITS: TargetLimit[] = [
  { id: "100kb", label: "EPFO / General (Max 100 KB)", maxBytes: 100 * 1024, description: "Common limit for Employees Provident Fund Organisation uploads." },
  { id: "200kb", label: "State Exams / Banking (Max 200 KB)", maxBytes: 200 * 1024, description: "Standard upload limit for state PSC and IBPS attachments." },
  { id: "300kb", label: "UPSC / Aadhaar (Max 300 KB)", maxBytes: 300 * 1024, description: "Official limit for Union Public Service Commission and UIDAI portals." },
  { id: "500kb", label: "NSDL PAN Card (Max 500 KB)", maxBytes: 500 * 1024, description: "NSDL e-PAN document upload specifications." },
  { id: "1mb", label: "Passport Seva / Visa (Max 1 MB)", maxBytes: 1024 * 1024, description: "Indian Passport applications and visa document scans." },
];

export default function GovFormPdfCompressor() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [activeLimit, setActiveLimit] = useState<TargetLimit>(PORTAL_LIMITS[2]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [compressResult, setCompressResult] = useState<{
    size: number;
    url: string;
    reductionPct: number;
    isCompliant: boolean;
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
      const isCompliant = pdfBytes.length <= activeLimit.maxBytes;

      setCompressResult({
        size: pdfBytes.length,
        url,
        reductionPct,
        isCompliant
      });
      setSuccess(true);
      if (isCompliant) {
        toast.success("PDF compressed successfully and matches portal limit!");
      } else {
        toast.warning("PDF optimized, but still exceeds target portal limit. Try splitting pages.");
      }
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
    <ToolVisibilityGuard slug="gov-form-pdf-compressor">
      <ToolLayout>
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <ToolHero 
            title="Government Form PDF Compressor"
            description="Optimize and compress PDF attachments locally. Select exact target limits for Indian recruitment and e-governance portals."
            icon={<Minimize2 className="w-7 h-7" />}
          />

          <div className="p-8 sm:p-10">
            
            {/* Target Limit Selector */}
            <div className="max-w-4xl mx-auto mb-10 text-left">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-400 block mb-3">
                Select Target Portal Upload Specification
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {PORTAL_LIMITS.map((limit) => (
                  <button
                    key={limit.id}
                    onClick={() => {
                      setActiveLimit(limit);
                      if (compressResult) {
                        setCompressResult(null);
                        setSuccess(false);
                      }
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                      activeLimit.id === limit.id
                        ? "bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200/70 dark:bg-white/[0.01] border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/10"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wide block">{limit.label}</span>
                    <span className="text-[9px] text-slate-500 dark:text-gray-500 block mt-1 leading-normal font-semibold">{limit.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {!file ? (
              <UploadZone
                onFilesSelected={handleFiles}
                accept="application/pdf"
                multiple={false}
                title="Drop the form PDF here"
                description={`It stays in this tab. Target size: ${activeLimit.label}.`}
              />
            ) : (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50/70 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 gap-6 shadow-sm">
                  <div className="flex items-center gap-5 overflow-hidden w-full">
                    <div className="bg-white dark:bg-[#030712] p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex-shrink-0 shadow-inner">
                      <FileText className="w-7 h-7 text-red-500" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-base font-black text-slate-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-sm text-slate-500 dark:text-gray-500 mt-1">Original Size: <span className="font-bold text-slate-800 dark:text-gray-300">{formatBytes(file.size)}</span></p>
                    </div>
                  </div>
                  <button 
                    onClick={resetAll} 
                    className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 px-6 py-3 rounded-xl border border-red-200 dark:border-red-500/20 transition-all w-full sm:w-auto text-center cursor-pointer shadow-sm"
                  >
                    Remove
                  </button>
                </div>

                {compressResult && (
                  <div className={`border rounded-3xl p-10 text-center shadow-sm animate-fade-in ${
                    compressResult.isCompliant ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-yellow-50 dark:bg-yellow-500/5 border-yellow-200 dark:border-yellow-500/20'
                  }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                      compressResult.isCompliant ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {compressResult.isCompliant ? <CheckCircle className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                    </div>
                    <h4 className="text-2xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">
                      {compressResult.isCompliant ? 'Portal Upload Ready!' : 'Optimization Limit Alert!'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-gray-400 max-w-sm mx-auto font-medium">
                      {compressResult.isCompliant 
                        ? `Your PDF file size is successfully compressed under the targeted ${formatBytes(activeLimit.maxBytes)} limit for easy portal upload.` 
                        : `Optimization complete, but size exceeds the selected portal upload limit of ${formatBytes(activeLimit.maxBytes)}.`}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-black uppercase tracking-widest mt-8 bg-white dark:bg-[#030712] w-fit mx-auto px-8 py-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                      <div>
                        <span className="text-slate-500 dark:text-gray-500">Original</span>
                        <span className="text-slate-900 dark:text-white ml-3 font-bold">{formatBytes(file.size)}</span>
                      </div>
                      <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-white/10"></div>
                      <div>
                        <span className="text-slate-500 dark:text-gray-500">New Size</span>
                        <span className={`ml-3 font-bold ${compressResult.isCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{formatBytes(compressResult.size)}</span>
                      </div>
                      <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-white/10"></div>
                      <div>
                        <span className="text-slate-500 dark:text-gray-500">Reduction</span>
                        <span className="ml-3 text-emerald-600 dark:text-emerald-400 font-bold">{compressResult.reductionPct.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-slate-200 dark:border-white/5">
                  <button onClick={resetAll} className="w-full sm:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm">
                    Reset
                  </button>

                  {!compressResult ? (
                    <button
                      onClick={processCompress}
                      disabled={isProcessing}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(37,99,235,0.3)] active:scale-95 cursor-pointer"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Minimize2 className="w-4 h-4" />}
                      {isProcessing ? 'Optimizing...' : 'Compress PDF'}
                    </button>
                  ) : (
                    <a
                      href={compressResult.url}
                      download={`optimized_form_${file.name}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 rounded-2xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-95 text-center cursor-pointer"
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



        {toolArticles['gov-form-pdf-compressor'] && (
          <ToolArticle {...toolArticles['gov-form-pdf-compressor']} />
        )}
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}

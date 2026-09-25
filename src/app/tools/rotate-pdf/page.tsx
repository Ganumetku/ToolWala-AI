"use client";

import { useState } from 'react';

import { RotateCw, Download, RefreshCw, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';
import UploadZone from '@/components/tools/UploadZone';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { formatBytes } from '@/lib/utils/format';
import { uint8ArrayToArrayBuffer } from '@/lib/pdf/pdfUtils';

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rotationAngle, setRotationAngle] = useState<number>(90); // 90, 180, 270
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);

  const handleFiles = (fileList: FileList | File[]) => {
    setSuccess(false);
    setRotatedPdfUrl(null);
    const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList);
    const pdfFile = filesArray.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));

    if (pdfFile) {
      setFile(pdfFile);
    } else {
      toast.error("Please upload a valid PDF file.");
    }
  };

  const processRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setSuccess(false);

    try {
      const { PDFDocument, degrees } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotationAngle) % 360));
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([uint8ArrayToArrayBuffer(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setRotatedPdfUrl(url);
      setSuccess(true);
      toast.success("PDF pages rotated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Error rotating PDF. The file may be password-protected or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setRotatedPdfUrl(null);
    setSuccess(false);
  };

  return (
    <ToolLayout>
      <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
        <ToolHero 
          title="Rotate PDF"
          description="Rotates every page 90°, 180°, or 270°. No thumbnail grid. One page: Organize PDF."
          icon={<RotateCw className="w-7 h-7" />}
        />

        <div className="p-8 sm:p-10">
          {!file ? (
            <UploadZone
              onFilesSelected={handleFiles}
              accept="application/pdf"
              multiple={false}
              title="Select PDF file to Rotate"
              description="Drag and drop a PDF file here, or click to browse. Processing is fully secured inside your browser."
            />
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50/70 dark:bg-white/[0.02] rounded-3xl border border-slate-200/80 dark:border-white/5 gap-6 shadow-sm">
                <div className="flex items-center gap-5 overflow-hidden w-full">
                  <div className="bg-white dark:bg-[#030712] p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex-shrink-0 shadow-sm">
                    <FileText className="w-7 h-7 text-red-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-base font-black text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-sm text-slate-500 dark:text-gray-500 mt-1">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button 
                  onClick={resetAll} 
                  className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 px-6 py-3 rounded-xl border border-red-200 dark:border-red-500/20 transition-all w-full sm:w-auto text-center cursor-pointer shadow-sm"
                >
                  Remove
                </button>
              </div>

              {!rotatedPdfUrl && (
                <div className="bg-blue-50/50 dark:bg-blue-600/5 border border-blue-200/60 dark:border-blue-600/10 rounded-3xl p-8 space-y-4 shadow-sm">
                  <label className="block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] ml-1">Rotation Angle</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "90° Clockwise", val: 90 },
                      { label: "180° Flip", val: 180 },
                      { label: "270° Counter-Clockwise", val: 270 }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setRotationAngle(opt.val)}
                        className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                          rotationAngle === opt.val
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-slate-100 hover:bg-slate-200/70 border-slate-200 text-slate-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {success && rotatedPdfUrl && (
                <div className="border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl p-10 text-center shadow-sm animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                    PDF Rotated Successfully!
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-6">
                    All pages have been rotated by {rotationAngle} degrees.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-[#E6ECF5] dark:border-white/5">
                <button onClick={resetAll} className="w-full sm:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl transition-all cursor-pointer shadow-sm">
                  Reset
                </button>

                {!rotatedPdfUrl ? (
                  <button
                    onClick={processRotate}
                    disabled={isProcessing}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(37,99,235,0.3)] active:scale-95 cursor-pointer"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                    {isProcessing ? 'Rotating...' : 'Rotate PDF Pages'}
                  </button>
                ) : (
                  <a
                    href={rotatedPdfUrl}
                    download={`rotated_${file.name}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-95 text-center cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Rotated PDF
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>



      {toolArticles['rotate-pdf'] && (
        <ToolArticle {...toolArticles['rotate-pdf']} />
      )}
    </ToolLayout>
  );
}

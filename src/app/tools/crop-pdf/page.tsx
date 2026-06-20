"use client";

import { useState } from 'react';


import { Scissors, Download, RefreshCw, CheckCircle, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';
import UploadZone from '@/components/tools/UploadZone';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { formatBytes } from '@/lib/utils/format';
import { uint8ArrayToArrayBuffer } from '@/lib/pdf/pdfUtils';

export default function CropPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Crop Margins in Percentage (0 - 50%)
  const [topMargin, setTopMargin] = useState<number>(10);
  const [bottomMargin, setBottomMargin] = useState<number>(10);
  const [leftMargin, setLeftMargin] = useState<number>(10);
  const [rightMargin, setRightMargin] = useState<number>(10);

  const [croppedPdfUrl, setCroppedPdfUrl] = useState<string | null>(null);

  const handleFiles = (fileList: FileList | File[]) => {
    setSuccess(false);
    setCroppedPdfUrl(null);
    const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList);
    const pdfFile = filesArray.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));

    if (pdfFile) {
      setFile(pdfFile);
    } else {
      toast.error("Please upload a valid PDF file.");
    }
  };

  const processCrop = async () => {
    if (!file) return;
    setIsProcessing(true);
    setSuccess(false);

    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const { width, height } = page.getSize();
        
        // Calculate crop bounds
        const xOffset = width * (leftMargin / 100);
        const yOffset = height * (bottomMargin / 100);
        const croppedWidth = width * (1 - (leftMargin + rightMargin) / 100);
        const croppedHeight = height * (1 - (topMargin + bottomMargin) / 100);

        // Update CropBox and MediaBox
        page.setCropBox(xOffset, yOffset, croppedWidth, croppedHeight);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([uint8ArrayToArrayBuffer(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setCroppedPdfUrl(url);
      setSuccess(true);
      toast.success("PDF pages cropped successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Error cropping PDF. The file may be password-protected or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setCroppedPdfUrl(null);
    setSuccess(false);
    setTopMargin(10);
    setBottomMargin(10);
    setLeftMargin(10);
    setRightMargin(10);
  };

  return (
    <ToolLayout>
      <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-16">
        <ToolHero 
          title="Crop PDF"
          description="Trim PDF page margins and customize visible document borders locally and securely."
          icon={<Scissors className="w-7 h-7" />}
        />

        <div className="p-8 sm:p-10 bg-black/[0.15]">
          {!file ? (
            <UploadZone
              onFilesSelected={handleFiles}
              accept="application/pdf"
              multiple={false}
              title="Select PDF file to Crop"
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
                    <p className="text-sm text-gray-500 mt-1">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button 
                  onClick={resetAll} 
                  className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20 transition-all w-full sm:w-auto text-center cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {!croppedPdfUrl && (
                <div className="bg-blue-600/5 border border-blue-600/10 rounded-[2rem] p-8 space-y-6">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">
                    Configure Margins to Crop (%)
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { label: "Top Margin", val: topMargin, set: setTopMargin },
                      { label: "Bottom Margin", val: bottomMargin, set: setBottomMargin },
                      { label: "Left Margin", val: leftMargin, set: setLeftMargin },
                      { label: "Right Margin", val: rightMargin, set: setRightMargin }
                    ].map((m, idx) => (
                      <div key={idx} className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          {m.label}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={m.val}
                            onChange={(e) => m.set(Math.min(50, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                            className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold bg-[#030712] text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all pr-10"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold">%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-3 mt-4 text-xs text-gray-500">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <p className="leading-relaxed">
                      Enter the percentage of the page size to trim from each side. Maximum limit is 50% per edge.
                    </p>
                  </div>
                </div>
              )}

              {success && croppedPdfUrl && (
                <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-[2.5rem] p-10 text-center shadow-2xl animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500/25 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black tracking-tight text-white mb-2">
                    PDF Cropped Successfully!
                  </h4>
                  <p className="text-sm text-gray-400 mb-6">
                    A new PDF document has been compiled with the visible borders cropped.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-white/5">
                <button onClick={resetAll} className="w-full sm:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                  Reset
                </button>

                {!croppedPdfUrl ? (
                  <button
                    onClick={processCrop}
                    disabled={isProcessing}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 cursor-pointer"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                    {isProcessing ? 'Cropping...' : 'Crop PDF'}
                  </button>
                ) : (
                  <a
                    href={croppedPdfUrl}
                    download={`cropped_${file.name}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 text-center cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Cropped PDF
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>



      {toolArticles['crop-pdf'] && (
        <ToolArticle {...toolArticles['crop-pdf']} />
      )}
    </ToolLayout>
  );
}

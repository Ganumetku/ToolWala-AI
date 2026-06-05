"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, UploadCloud, Trash2,
  Files, AlertCircle, CheckCircle, RefreshCw,
  ChevronLeft, ArrowRight, Shield, FileUp, Sparkles,
  Image as ImageIcon, RotateCw, ArrowUp, ArrowDown, GripVertical, Settings, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  src: string;
  rotation: number; // 0, 90, 180, 270 degrees
}

type PageSizeOption = 'a4' | 'letter' | 'auto';
type OrientationOption = 'portrait' | 'landscape';
type MarginOption = 'none' | 'thin' | 'thick';

const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

export default function JpgToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeOption>('a4');
  const [orientation, setOrientation] = useState<OrientationOption>('portrait');
  const [margin, setMargin] = useState<MarginOption>('none');
  const [outputFileName, setOutputFileName] = useState("converted_document");
  
  // Progress & State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [success, setSuccess] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ------------------------------------
  // FILE LOADING
  // ------------------------------------
  const handleImages = (fileList: FileList | File[]) => {
    setSuccess(false);
    const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList);
    
    // Accept standard image types
    const validImages = filesArray.filter(f => 
      f.type.startsWith('image/jpeg') || 
      f.type.startsWith('image/png') || 
      f.name.endsWith('.jpg') || 
      f.name.endsWith('.jpeg') || 
      f.name.endsWith('.png') ||
      f.name.endsWith('.webp')
    );

    if (validImages.length < filesArray.length) {
      toast.warning("Some files were skipped. Only JPG, JPEG, PNG, and WebP are supported.");
    }

    if (validImages.length === 0) return;

    const newImages: ImageFile[] = validImages.map(file => {
      const id = Math.random().toString(36).substring(2, 9);
      return {
        id,
        file,
        name: file.name,
        size: file.size,
        src: URL.createObjectURL(file),
        rotation: 0
      };
    });

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const target = prev.find(item => item.id === id);
      if (target) URL.revokeObjectURL(target.src);
      return prev.filter(item => item.id !== id);
    });
    setSuccess(false);
  };

  const rotateImage = (id: string) => {
    setImages(prev => prev.map(item => 
      item.id === id 
        ? { ...item, rotation: (item.rotation + 90) % 360 } 
        : item
    ));
    setSuccess(false);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    setImages(prev => {
      const updated = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
    setSuccess(false);
  };

  const resetAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.src));
    setImages([]);
    setPageSize('a4');
    setOrientation('portrait');
    setMargin('none');
    setOutputFileName("converted_document");
    setProgress(0);
    setIsProcessing(false);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ------------------------------------
  // HTML5 DRAGGABLE REORDER HANDLERS
  // ------------------------------------
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOverCard = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropCard = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setImages(prev => {
      const updated = [...prev];
      const [movedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, movedItem);
      return updated;
    });
    setDraggedIndex(null);
  };

  // ------------------------------------
  // CANVAS ROTATION PROCESSOR
  // ------------------------------------
  const rotateImageBytes = async (file: File, rotation: number): Promise<Uint8Array> => {
    if (rotation === 0) {
      const arrayBuffer = await file.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          file.arrayBuffer().then(buf => resolve(new Uint8Array(buf))).catch(reject);
          return;
        }

        const rad = (rotation * Math.PI) / 180;
        if (rotation === 90 || rotation === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob((blob) => {
          if (blob) {
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
              resolve(new Uint8Array(fileReader.result as ArrayBuffer));
            };
            fileReader.onerror = reject;
            fileReader.readAsArrayBuffer(blob);
          } else {
            file.arrayBuffer().then(buf => resolve(new Uint8Array(buf))).catch(reject);
          }
        }, 'image/jpeg', 0.95);
      };
      img.onerror = () => {
        file.arrayBuffer().then(buf => resolve(new Uint8Array(buf))).catch(reject);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // ------------------------------------
  // CONVERT IMAGES TO PDF
  // ------------------------------------
  const processConversion = async () => {
    if (images.length === 0) {
      toast.error("Please add at least 1 image to convert.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < images.length; i++) {
        const imgFile = images[i];
        
        // Prepare image bytes rotated on canvas
        const bytes = await rotateImageBytes(imgFile.file, imgFile.rotation);
        
        // Check format. Rotated canvas exports are always JPEG. Unrotated can be PNG.
        const isPng = imgFile.rotation === 0 && imgFile.file.type === 'image/png';
        let embeddedImage;
        if (isPng) {
          embeddedImage = await pdfDoc.embedPng(bytes);
        } else {
          embeddedImage = await pdfDoc.embedJpg(bytes);
        }

        // Determine PDF page size
        let pageWidth = 595.28; // A4 default width in points (1 point = 1/72 inch)
        let pageHeight = 841.89; // A4 default height in points
        
        if (pageSize === 'letter') {
          pageWidth = 612.00;
          pageHeight = 792.00;
        } else if (pageSize === 'auto') {
          pageWidth = embeddedImage.width;
          pageHeight = embeddedImage.height;
        }

        // Handle page orientation
        if (pageSize !== 'auto' && orientation === 'landscape') {
          [pageWidth, pageHeight] = [pageHeight, pageWidth];
        }

        // Add page to document
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate margin sizing
        const marginVal = margin === 'none' ? 0 : margin === 'thin' ? 20 : 40;
        const targetWidth = pageWidth - (marginVal * 2);
        const targetHeight = pageHeight - (marginVal * 2);

        // Calculate aspect ratios & fit scaling
        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;
        const scaleX = targetWidth / imgWidth;
        const scaleY = targetHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY);

        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        // Center within margins
        const drawX = marginVal + (targetWidth - drawWidth) / 2;
        const drawY = marginVal + (targetHeight - drawHeight) / 2;

        page.drawImage(embeddedImage, {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight
        });

        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([uint8ArrayToArrayBuffer(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const dl = document.createElement("a");
      dl.href = url;
      const cleanName = outputFileName.trim() ? outputFileName.trim() : "converted_document";
      dl.download = cleanName.endsWith(".pdf") ? cleanName : `${cleanName}.pdf`;
      
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
      
      URL.revokeObjectURL(url);
      setSuccess(true);
      toast.success("Images converted to PDF successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to convert images to PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload zones drag handlers
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
      handleImages(e.dataTransfer.files);
    }
  };

  // Cumulative sizes
  const totalFiles = images.length;
  const totalSize = images.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      <MeshGradient />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Back navigation */}
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* Workspace Card */}
        <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-16">
          
          {/* Header Area */}
          <div className="p-8 sm:p-10 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase">JPG to PDF</h1>
                  <p className="text-gray-400 font-medium mt-1">Convert JPEG, JPG, and PNG images into a beautifully formatted PDF document locally.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 h-fit">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">100% Secure</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 bg-black/[0.15]">
            
            {/* Success state circular indicator */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-[2rem] text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/25 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Conversion Complete!</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                  Your images were converted into a single PDF document successfully. Download triggered automatically.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button 
                    onClick={processConversion} 
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <Download className="w-4 h-4" /> Download PDF Again
                  </button>
                  <button 
                    onClick={resetAll} 
                    className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                  >
                    Convert New Images
                  </button>
                </div>
              </motion.div>
            )}

            {/* Split Grid */}
            {images.length === 0 ? (
              
              /* Uploadzone drop target */
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
                  onChange={(e) => e.target.files && handleImages(e.target.files)} 
                  multiple 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                />
                
                {/* Visual back glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 border border-white/5 group-hover:text-blue-400 group-hover:bg-blue-500/10 group-hover:scale-110 transition-all duration-300 shadow-2xl">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-3">Upload your Images to Convert</h3>
                  <p className="text-sm text-gray-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                    Drag and drop JPG, JPEG, PNG, or WebP files here, or click to browse. Conversion processes offline in your browser.
                  </p>
                  <button className="rounded-xl bg-white text-black px-8 py-3.5 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]">
                    Browse Images
                  </button>
                </div>
              </div>
            ) : (
              
              /* Conversion Workspace layout */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left side preview grid list (2/3 Col) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Grid stats header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                        Arrange Page Order ({images.length} images)
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">Drag image cards or use arrows to sort. Pages compile top-to-bottom.</p>
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600/20 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Images
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => e.target.files && handleImages(e.target.files)} 
                        multiple 
                        accept="image/jpeg, image/png, image/webp" 
                        className="hidden" 
                      />
                    </button>
                  </div>

                  {/* Visual card grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence initial={false}>
                      {images.map((img, index) => (
                        <motion.div
                          key={img.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={handleDragOverCard}
                          onDrop={(e) => handleDropCard(e, index)}
                          className={`flex gap-4 p-4 rounded-2xl border transition-all relative group bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.03] cursor-grab active:cursor-grabbing
                            ${draggedIndex === index ? 'opacity-40 border-blue-500/40 bg-blue-500/5' : ''}
                          `}
                        >
                          {/* Drag Handle */}
                          <div className="text-gray-600 group-hover:text-gray-400 transition-colors flex flex-col justify-center flex-shrink-0">
                            <GripVertical className="w-5 h-5 cursor-row-resize" />
                          </div>

                          {/* Image Thumbnail wrapper */}
                          <div className="w-20 h-20 bg-[#030712] rounded-xl border border-white/5 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                            <img 
                              src={img.src} 
                              alt={img.name} 
                              style={{ transform: `rotate(${img.rotation}deg)` }}
                              className="max-h-full max-w-full object-contain transition-transform duration-300"
                            />
                            
                            {/* Page Index Badge */}
                            <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] font-black px-1.5 py-0.5 rounded text-white tracking-wider border border-white/5 backdrop-blur-md">
                              Pg {index + 1}
                            </span>
                          </div>

                          {/* File Details */}
                          <div className="overflow-hidden flex-1 flex flex-col justify-between pr-2">
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-white truncate" title={img.name}>{img.name}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{formatBytes(img.size)}</p>
                            </div>
                            
                            {/* Card actions bottom bar */}
                            <div className="flex items-center gap-1.5 pb-0.5">
                              <button 
                                onClick={() => rotateImage(img.id)}
                                className="p-1.5 bg-white/5 border border-white/5 text-gray-400 hover:text-white rounded-lg transition-all flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
                                title="Rotate 90°"
                              >
                                <RotateCw className="w-3 h-3 text-blue-400" /> Rotate
                              </button>
                            </div>
                          </div>

                          {/* Sequence move buttons */}
                          <div className="flex flex-col justify-between items-center flex-shrink-0 border-l border-white/5 pl-3">
                            <button 
                              onClick={() => moveImage(index, 'up')} 
                              disabled={index === 0} 
                              className="p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-20 transition-all"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => moveImage(index, 'down')} 
                              disabled={index === images.length - 1} 
                              className="p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-20 transition-all"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => removeImage(img.id)} 
                              className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right side layout settings panel (1/3 Col) */}
                <div>
                  <div className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 space-y-6 sticky top-28 self-start bg-white/[0.01]">
                    
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pb-3 border-b border-white/5 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-400 animate-spin-slow" /> Layout Settings
                    </h4>

                    {/* Page format selector */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Page Size
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['a4', 'letter', 'auto'] as const).map(option => (
                          <button
                            key={option}
                            onClick={() => setPageSize(option)}
                            className={`px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                              ${pageSize === option 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                                : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                              }
                            `}
                          >
                            {option === 'a4' ? 'A4' : option === 'letter' ? 'Letter' : 'Auto'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Orientation option */}
                    {pageSize !== 'auto' && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                          Orientation
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['portrait', 'landscape'] as const).map(option => (
                            <button
                              key={option}
                              onClick={() => setOrientation(option)}
                              className={`px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                                ${orientation === option 
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                                  : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/5'
                                }
                              `}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Margin option */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Margins
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['none', 'thin', 'thick'] as const).map(option => (
                          <button
                            key={option}
                            onClick={() => setMargin(option)}
                            className={`px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                              ${margin === option 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                                : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/5'
                              }
                            `}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Document naming */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Output Name
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={outputFileName}
                          onChange={(e) => setOutputFileName(e.target.value)}
                          placeholder="converted_document"
                          className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold bg-[#030712] text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold pointer-events-none">.pdf</span>
                      </div>
                    </div>

                    {/* Stats display */}
                    <div className="pt-4 border-t border-white/5 space-y-2 text-xs font-bold text-gray-400">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Total Images</span>
                        <span className="text-white">{totalFiles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Combined Size</span>
                        <span className="text-white">{formatBytes(totalSize)}</span>
                      </div>
                    </div>

                    {/* Progress loaders */}
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-blue-400">
                          <span>Generating PDF...</span>
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

                    {/* Convert actions */}
                    <div className="space-y-2.5 pt-3 border-t border-white/5">
                      <button
                        onClick={processConversion}
                        disabled={isProcessing || images.length === 0}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {isProcessing ? 'Processing PDF...' : 'Convert to PDF'}
                      </button>

                      <button
                        onClick={resetAll}
                        disabled={isProcessing}
                        className="w-full px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-30"
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

        {/* RELATED UTILITIES LIST */}
        <div className="mb-12 animate-fade-in">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 ml-1">Explore PDF Workspace</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Merge PDF Card */}
            <Link 
              href="/tools/merge-pdf"
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
                  <Files className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Merge PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Combine multiple distinct PDF documents into a single professional-grade file quickly and securely.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Split PDF Card */}
            <Link 
              href="/tools/split-pdf"
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
                  <FileUp className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Split PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Extract specific page segments or break PDFs into individual files securely.
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
      {toolArticles['jpg-to-pdf'] && (
        <ToolArticle {...toolArticles['jpg-to-pdf']} />
      )}
    </div>
  );
}

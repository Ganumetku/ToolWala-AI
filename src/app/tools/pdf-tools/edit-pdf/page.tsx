"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Rnd } from 'react-rnd';
import {
  FileText, Download, UploadCloud, Trash2,
  AlertCircle, CheckCircle, RefreshCw, Info,
  ChevronLeft, Type, Plus, Minus, Shield, X,
  ZoomIn, ZoomOut, Edit3, PlusCircle
} from 'lucide-react';

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 60, 72];
const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

interface TextBox {
  id: string;
  text: string;
  originalText: string;
  x: number;          // viewport pixels relative to top-left of canvas
  y: number;          // viewport pixels relative to top-left of canvas
  width: number;      // viewport pixels
  height: number;     // viewport pixels
  fontSize: number;   // viewport pixels
  color: string;      // hex color
  source: 'original' | 'custom';
  pageNumber: number;
  
  // For original text cover coordinates in PDF points
  originalPdfX?: number; 
  originalPdfY?: number;
  originalPdfWidth?: number;
  originalPdfHeight?: number;
  originalPdfFontSize?: number;
  
  isDeleted?: boolean;
  isModified?: boolean;
}

interface MergedTextItem {
  str: string;
  transform: number[]; // [a, b, c, d, tx, ty]
  width: number;
  height: number;
}

const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

// Merging algorithm for nearby PDF text items
const mergeTextItems = (items: any[]): MergedTextItem[] => {
  if (items.length === 0) return [];
  
  const validItems = items
    .filter(item => item && typeof item.str === 'string' && item.str.trim().length > 0)
    .map(item => ({
      str: item.str,
      transform: item.transform,
      width: item.width || 0,
      height: item.height || item.transform[3] || 10
    }));

  if (validItems.length === 0) return [];

  const merged: MergedTextItem[] = [];
  let current = { ...validItems[0] };
  
  for (let i = 1; i < validItems.length; i++) {
    const item = validItems[i];
    const currT = current.transform;
    const itemT = item.transform;
    
    // Check if on same baseline (approximate ty within 2 points)
    const sameLine = Math.abs(currT[5] - itemT[5]) < 2;
    
    // Check if horizontal distance is close (gap less than fontSize * 1.25)
    const prevEndX = currT[4] + current.width;
    const distance = itemT[4] - prevEndX;
    const fontSize = currT[3];
    const closeHorizontally = distance >= -3 && distance < fontSize * 1.25;
    
    const sameFontSize = Math.abs(currT[3] - itemT[3]) < 1.5;
    
    if (sameLine && closeHorizontally && sameFontSize) {
      const hasSpace = distance > fontSize * 0.15 && !current.str.endsWith(' ') && !item.str.startsWith(' ');
      current.str += (hasSpace ? ' ' : '') + item.str;
      current.width = (itemT[4] - currT[4]) + item.width;
    } else {
      merged.push(current);
      current = { ...item };
    }
  }
  merged.push(current);
  return merged;
};

export default function EditPdfPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [pdfjs, setPdfjs] = useState<any>(null);

  // File states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);

  // PDF.js Document and Page References
  const pdfDocRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);

  // State Options
  const [editMode, setEditMode] = useState<'edit' | 'add'>('edit');
  const [zoomIndex, setZoomIndex] = useState<number>(2); // defaults to 1.0 (index 2 in [0.5, 0.75, 1.0, 1.25, 1.5, 2.0])

  // PDF Page Layout sizes
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const viewportRef = useRef<any>(null);

  // Text Boxes state: page keys (1-based index)
  const [textBoxes, setTextBoxes] = useState<Record<number, TextBox[]>>({});
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // UI state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasScannedWarning, setHasScannedWarning] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentZoom = ZOOM_LEVELS[zoomIndex];

  // Initialize and load PDF.js client-side
  useEffect(() => {
    setIsMounted(true);
    const loadPdfjs = async () => {
      try {
        const lib = await import('pdfjs-dist');
        lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
        setPdfjs(lib);
      } catch (err) {
        console.error("Failed to load pdfjs-dist", err);
        setError("Failed to load PDF engine.");
      }
    };
    loadPdfjs();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render specific page on Canvas and extract text content
  const loadPageContent = async (pageNum: number, zoomLevel = currentZoom) => {
    if (!pdfDocRef.current || !pdfjs) return;
    setIsProcessing(true);
    setError(null);
    setHasScannedWarning(false);
    
    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      
      const nativeWidth = page.view[2] - page.view[0];
      const nativeHeight = page.view[3] - page.view[1];
      
      // Default base scale
      const baseScale = 1.0;
      const scale = baseScale * zoomLevel;
      const viewport = page.getViewport({ scale });
      viewportRef.current = viewport;

      setPageWidth(viewport.width);
      setPageHeight(viewport.height);

      // Render page canvas background
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        if (context) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
        }
      }

      // Load text content from PDF page if not initialized
      if (textBoxes[pageNum] === undefined) {
        const textContent = await page.getTextContent();
        
        if (textContent.items.length === 0) {
          setHasScannedWarning(true);
          setTextBoxes(prev => ({ ...prev, [pageNum]: [] }));
        } else {
          const rawItems = textContent.items as any[];
          const merged = mergeTextItems(rawItems);
          
          const boxes: TextBox[] = merged.map((item, idx) => {
            const tx = item.transform[4];
            const ty = item.transform[5];
            const fontSizePdf = item.transform[3];
            const widthPdf = item.width;
            
            // Convert to viewport pixels using PDF.js viewport translation
            const [vx, vy] = viewport.convertToViewportPoint(tx, ty);
            const boxHeight = fontSizePdf * scale;
            
            // Fallback width calculation if width is 0
            const boxWidth = widthPdf > 0 ? (widthPdf * scale) : (boxHeight * 0.55 * item.str.length);
            
            return {
              id: `detected_${pageNum}_${idx}_${Date.now()}`,
              text: item.str,
              originalText: item.str,
              
              // Viewport pixel coordinates (Requirement 6)
              x: vx,
              y: vy - boxHeight, // top-left in HTML
              width: boxWidth,
              height: boxHeight * 1.15,
              fontSize: fontSizePdf * scale,
              color: "#000000", // default black
              source: 'original',
              pageNumber: pageNum,
              
              // Coordinates in native PDF points for covering old text
              originalPdfX: tx,
              originalPdfY: ty,
              originalPdfWidth: widthPdf > 0 ? widthPdf : (fontSizePdf * 0.55 * item.str.length),
              originalPdfHeight: fontSizePdf,
              originalPdfFontSize: fontSizePdf,
            };
          });
          
          setTextBoxes(prev => ({ ...prev, [pageNum]: boxes }));
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to render page.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Render left panel page list thumbnails
  const generateThumbnails = async (doc: any) => {
    setThumbnailUrls([]);
    const urls: string[] = [];
    
    for (let i = 1; i <= doc.numPages; i++) {
      try {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.15 });
        
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
          urls.push(canvas.toDataURL());
        }
      } catch (err) {
        console.error(`Thumbnail failed for page ${i}`, err);
        urls.push('');
      }
    }
    setThumbnailUrls(urls);
  };

  // File Load handler
  const loadPdfFile = (file: File) => {
    setPdfFile(file);
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setSelectedBoxId(null);
    setTextBoxes({});
    setThumbnailUrls([]);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        setPdfBytes(bytes);
        
        if (!pdfjs) {
          setError("PDF engine is initializing, please select the file again.");
          setIsProcessing(false);
          return;
        }
        
        const loadingTask = pdfjs.getDocument({ data: bytes });
        const doc = await loadingTask.promise;
        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        
        generateThumbnails(doc);
        await loadPageContent(1);
      } catch (err: any) {
        console.error(err);
        setError("Invalid PDF file or failed to read content.");
        setPdfFile(null);
        setPdfBytes(null);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        loadPdfFile(file);
      } else {
        setError("Please upload a valid PDF file.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Page Changes
  const handlePageChange = async (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) return;
    setCurrentPage(pageNum);
    setSelectedBoxId(null);
    await loadPageContent(pageNum);
  };

  // Zoom adjustments & proportional state scaling
  const handleZoomIn = async () => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) {
      const oldZoom = currentZoom;
      const nextIndex = zoomIndex + 1;
      const newZoom = ZOOM_LEVELS[nextIndex];
      setZoomIndex(nextIndex);
      setSelectedBoxId(null);
      
      const ratio = newZoom / oldZoom;
      setTextBoxes(prev => {
        const updated: Record<number, TextBox[]> = {};
        Object.keys(prev).forEach(key => {
          const pageNum = parseInt(key, 10);
          updated[pageNum] = (prev[pageNum] || []).map(box => ({
            ...box,
            x: box.x * ratio,
            y: box.y * ratio,
            width: box.width * ratio,
            height: box.height * ratio,
            fontSize: box.fontSize * ratio,
          }));
        });
        return updated;
      });
      
      await loadPageContent(currentPage, newZoom);
    }
  };

  const handleZoomOut = async () => {
    if (zoomIndex > 0) {
      const oldZoom = currentZoom;
      const nextIndex = zoomIndex - 1;
      const newZoom = ZOOM_LEVELS[nextIndex];
      setZoomIndex(nextIndex);
      setSelectedBoxId(null);
      
      const ratio = newZoom / oldZoom;
      setTextBoxes(prev => {
        const updated: Record<number, TextBox[]> = {};
        Object.keys(prev).forEach(key => {
          const pageNum = parseInt(key, 10);
          updated[pageNum] = (prev[pageNum] || []).map(box => ({
            ...box,
            x: box.x * ratio,
            y: box.y * ratio,
            width: box.width * ratio,
            height: box.height * ratio,
            fontSize: box.fontSize * ratio,
          }));
        });
        return updated;
      });
      
      await loadPageContent(currentPage, newZoom);
    }
  };

  const handleZoomReset = async () => {
    if (zoomIndex !== 2) {
      const oldZoom = currentZoom;
      const newZoom = ZOOM_LEVELS[2];
      setZoomIndex(2);
      setSelectedBoxId(null);
      
      const ratio = newZoom / oldZoom;
      setTextBoxes(prev => {
        const updated: Record<number, TextBox[]> = {};
        Object.keys(prev).forEach(key => {
          const pageNum = parseInt(key, 10);
          updated[pageNum] = (prev[pageNum] || []).map(box => ({
            ...box,
            x: box.x * ratio,
            y: box.y * ratio,
            width: box.width * ratio,
            height: box.height * ratio,
            fontSize: box.fontSize * ratio,
          }));
        });
        return updated;
      });
      
      await loadPageContent(currentPage, newZoom);
    }
  };

  // Add custom text boxes (in click mode)
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editMode !== 'add') return;
    
    if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName !== 'CANVAS') {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (!viewportRef.current) return;

    const scale = viewportRef.current.scale;
    const defaultFontSize = 14 * scale;
    const boxWidth = 150 * scale;
    const boxHeight = defaultFontSize * 1.25;

    const newBox: TextBox = {
      id: `custom_${currentPage}_${Date.now()}`,
      text: 'Type text here...',
      originalText: '',
      x: clickX,
      y: clickY,
      width: boxWidth,
      height: boxHeight,
      fontSize: defaultFontSize,
      color: "#0000ff", // default to blue
      source: 'custom',
      pageNumber: currentPage,
    };

    setTextBoxes(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newBox]
    }));
    setSelectedBoxId(newBox.id);
  };

  const updateTextBoxText = (id: string, text: string) => {
    setTextBoxes(prev => {
      const pageBoxes = prev[currentPage] || [];
      const updated = pageBoxes.map(box => {
        if (box.id === id) {
          const isModified = box.source === 'original' ? text !== box.originalText : false;
          return { ...box, text, isModified };
        }
        return box;
      });
      return { ...prev, [currentPage]: updated };
    });
  };

  const updateTextBoxFontSize = (id: string, newFontSize: number) => {
    setTextBoxes(prev => {
      const pageBoxes = prev[currentPage] || [];
      const updated = pageBoxes.map(box => {
        if (box.id === id) {
          const fontRatio = newFontSize / box.fontSize;
          const isModified = box.source === 'original' ? true : false;
          return {
            ...box,
            fontSize: newFontSize,
            width: box.width * fontRatio,
            height: box.height * fontRatio,
            isModified,
          };
        }
        return box;
      });
      return { ...prev, [currentPage]: updated };
    });
  };

  const deleteTextBox = (id: string) => {
    setTextBoxes(prev => {
      const pageBoxes = prev[currentPage] || [];
      
      const updated = pageBoxes.map(box => {
        if (box.id === id) {
          if (box.source === 'original') {
            return { ...box, isDeleted: true };
          }
          return null; // completely filter out custom boxes
        }
        return box;
      }).filter((box): box is TextBox => box !== null);

      return { ...prev, [currentPage]: updated };
    });
    
    if (selectedBoxId === id) {
      setSelectedBoxId(null);
    }
  };

  const pageBoxesList = textBoxes[currentPage] || [];
  const activeBox = pageBoxesList.find(b => b.id === selectedBoxId && !b.isDeleted);

  // Helper utility to convert hex to rgb
  const hexToRgb = (hex: string) => {
    try {
      const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
      const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
      const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
      const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
      return rgb(
        isNaN(r) ? 0 : r,
        isNaN(g) ? 0 : g,
        isNaN(b) ? 0 : b
      );
    } catch (e) {
      return rgb(0, 0, 0);
    }
  };

  // Helper to wrap lines to match boundaries in PDF space
  const wrapText = (text: string, maxWidth: number, font: any, fontSize: number): string[] => {
    const paragraphs = text.split('\n');
    const lines: string[] = [];
    
    for (const para of paragraphs) {
      const words = para.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }
    return lines;
  };

  const downloadBlob = (bytes: Uint8Array, filename: string) => {
    const blob = new Blob([uint8ArrayToArrayBuffer(bytes)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save / Export modifications to PDF document via pdf-lib
  const handleSaveChanges = async () => {
    if (!pdfBytes) {
      setError("Please load a PDF document.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
        const page = pages[pageIdx];
        const pageNum = pageIdx + 1;
        const pageBoxes = textBoxes[pageNum] || [];

        if (pageBoxes.length === 0) continue;

        const { width: pdfWidth, height: pdfHeight } = page.getSize();
        
        // Calculate the scale between viewport pixels and PDF points for coordinates mapping
        const scale = pageWidth / pdfWidth;

        for (const box of pageBoxes) {
          // Calculations in PDF points (Requirement 7)
          const pdfX = box.x / scale;
          const pdfY = pdfHeight - ((box.y + box.height) / scale);
          const pdfWidthVal = box.width / scale;
          const pdfHeightVal = box.height / scale;
          const pdfFontSize = box.fontSize / scale;

          // Requirement 12: Debug logs
          console.log(`Saving Text Box ID: ${box.id}`, {
            text: box.text,
            pageNumber: box.pageNumber,
            source: box.source,
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            scale: scale,
            pdfX: pdfX,
            pdfY: pdfY,
            pdfWidth: pdfWidthVal,
            pdfHeight: pdfHeightVal,
            pdfFontSize: pdfFontSize,
          });

          // Requirement 8: Cover old text only if source is original and text changed (or is deleted)
          if (box.source === "original" && (box.isDeleted || box.isModified)) {
            if (
              box.originalPdfX !== undefined &&
              box.originalPdfY !== undefined &&
              box.originalPdfWidth !== undefined &&
              box.originalPdfHeight !== undefined
            ) {
              // Cover ONLY the exact old text area with white background (Requirement 2 & 3 & 4)
              page.drawRectangle({
                x: box.originalPdfX - 0.5,
                y: box.originalPdfY - 1.5, // slightly adjusted downward to cover descenders
                width: box.originalPdfWidth + 1,
                height: box.originalPdfHeight + 3, // slightly taller to cover outlines
                color: rgb(1, 1, 1), // White color (rgb(1,1,1)), no border
              });
            }
          }

          // Draw text overlay if it is not deleted and text is not empty
          if (!box.isDeleted && box.text.trim().length > 0) {
            // Draw original text only if it has changed, or draw custom text directly (Requirement 9)
            if (box.source === "custom" || box.isModified) {
              const lines = wrapText(box.text, pdfWidthVal - 4, helveticaFont, pdfFontSize);
              const lineHeight = pdfFontSize * 1.25;

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // Align baseline correctly relative to the box top position in PDF points
                const lineY = (pdfHeight - (box.y / scale)) - pdfFontSize - (i * lineHeight);

                page.drawText(line, {
                  x: pdfX + 2, // padding offset
                  y: lineY,
                  size: pdfFontSize,
                  font: helveticaFont,
                  color: hexToRgb(box.color || "#000000"), // Close to blue/black as selected
                });
              }
            }
          }
        }
      }

      const modifiedBytes = await pdfDoc.save();
      downloadBlob(modifiedBytes, `edited_${pdfFile?.name || 'document.pdf'}`);
      setSuccess("PDF saved and exported successfully!");
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate and download edited PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPdfFile(null);
    setPdfBytes(null);
    pdfDocRef.current = null;
    setCurrentPage(1);
    setTotalPages(1);
    setThumbnailUrls([]);
    setTextBoxes({});
    setSelectedBoxId(null);
    setZoomIndex(2); // reset 100%
    setError(null);
    setSuccess(null);
    setHasScannedWarning(false);
  };

  if (!isMounted) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" suppressHydrationWarning />
          <p className="text-slate-500 font-bold font-sans">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans">
      
      {/* 1. TOP APP BAR TOOLBAR */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-30 select-none">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link href="/tools/pdf-tools" className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-4 h-4" suppressHydrationWarning />
            All PDF Tools
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" suppressHydrationWarning />
            <span className="font-extrabold text-slate-900 truncate max-w-[200px] md:max-w-xs">
              {pdfFile ? pdfFile.name : "Edit PDF Document"}
            </span>
          </div>
        </div>

        {/* Center Section: Modes & Zooms */}
        {pdfFile && (
          <div className="flex items-center gap-6">
            
            {/* Mode Select Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                onClick={() => { setEditMode('edit'); setSelectedBoxId(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  editMode === 'edit'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" suppressHydrationWarning />
                Edit Existing
              </button>
              <button
                onClick={() => { setEditMode('add'); setSelectedBoxId(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  editMode === 'add'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" suppressHydrationWarning />
                Add New Text
              </button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={handleZoomOut}
                disabled={zoomIndex === 0}
                className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-200 rounded-lg disabled:opacity-20 transition-all"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" suppressHydrationWarning />
              </button>
              <button
                onClick={handleZoomReset}
                className="px-2.5 py-1 text-xs font-black text-slate-600 hover:text-slate-950 hover:bg-slate-200 rounded-lg transition-all"
                title="Reset Zoom"
              >
                {Math.round(currentZoom * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-200 rounded-lg disabled:opacity-20 transition-all"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" suppressHydrationWarning />
              </button>
            </div>

          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {pdfFile ? (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-red-500 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-red-500/10 disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" suppressHydrationWarning />
                ) : (
                  <Download className="w-3.5 h-3.5" suppressHydrationWarning />
                )}
                Save Changes
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Shield className="w-4 h-4" suppressHydrationWarning />
              <span className="text-[10px] font-black uppercase tracking-widest">Local Processing</span>
            </div>
          )}
        </div>
      </header>

      {/* 2. CORE WORKSPACE */}
      {!pdfFile ? (
        // File Upload Panel
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-blue-600/2 blur-[80px] -z-10" />
          
          <div className="max-w-2xl w-full text-center space-y-8">
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-sans">Edit PDF Text</h1>
              <p className="text-slate-500 font-medium font-sans">
                Detect, select, and edit original text elements inside your document. Modify formatting, or add new text overlays.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-5 rounded-2xl flex items-start gap-4 border border-red-200 text-left animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" suppressHydrationWarning />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div
              onDragOver={(e) => { e.preventDefault(); }}
              onDragLeave={(e) => { e.preventDefault(); }}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file && file.type === 'application/pdf') loadPdfFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/10 rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 shadow-sm group"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" className="hidden" />
              <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-blue-500 mx-auto mb-4 transition-colors" suppressHydrationWarning />
              <h3 className="text-lg font-black text-slate-800 mb-1 font-sans">Choose PDF file</h3>
              <p className="text-sm text-slate-400 mb-6 font-sans">or drag and drop your document here</p>
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-widest shadow-md transition-all active:scale-95">
                Select PDF File
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Document Editor Panel
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT COLUMN: Page Thumbnails Panel */}
          <aside className="w-48 bg-white border-r border-slate-200 flex flex-col overflow-hidden select-none">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Pages</span>
              <span className="text-xs font-bold text-slate-500">{totalPages} total</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
              {thumbnailUrls.map((url, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <div
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-blue-50/80 border-blue-500 shadow-sm scale-[1.02]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {url ? (
                      <img src={url} alt={`Page ${pageNum}`} className="w-28 h-auto shadow-sm rounded-lg border border-slate-100 object-contain" />
                    ) : (
                      <div className="w-28 h-36 bg-white animate-pulse rounded-lg border border-slate-100 flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-slate-300 animate-spin" suppressHydrationWarning />
                      </div>
                    )}
                    <span className={`text-[10px] font-black tracking-widest uppercase ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      Page {pageNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* CENTER COLUMN: PDF Viewer Canvas Space */}
          <main className="flex-1 bg-slate-200/50 overflow-auto p-8 flex flex-col items-center justify-start custom-scrollbar">
            
            <div className="max-w-[800px] w-full space-y-4 mb-6 select-none">
              {error && (
                <div className="bg-red-50 text-red-500 px-5 py-4 rounded-xl flex items-center gap-3 border border-red-200 animate-fade-in shadow-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" suppressHydrationWarning />
                  <p className="text-xs font-bold leading-normal">{error}</p>
                  <button onClick={clearMessages} className="ml-auto text-red-400 hover:text-red-600 p-1">
                    <X className="w-4 h-4" suppressHydrationWarning />
                  </button>
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 text-emerald-600 px-5 py-4 rounded-xl flex items-center gap-3 border border-emerald-200 animate-fade-in shadow-sm">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" suppressHydrationWarning />
                  <p className="text-xs font-bold leading-normal">{success}</p>
                  <button onClick={clearMessages} className="ml-auto text-emerald-400 hover:text-emerald-600 p-1">
                    <X className="w-4 h-4" suppressHydrationWarning />
                  </button>
                </div>
              )}
              {hasScannedWarning && (
                <div className="bg-amber-50 text-amber-700 px-5 py-4 rounded-xl flex items-center gap-3 border border-amber-200 animate-fade-in shadow-sm">
                  <Info className="w-5 h-5 flex-shrink-0" suppressHydrationWarning />
                  <p className="text-xs font-bold leading-normal">Scanned PDF detected. No editable text items were found, but you can still add new text overlays!</p>
                </div>
              )}
            </div>

            {/* Rendering Spinner */}
            {isProcessing && !pdfBytes && (
              <div className="flex items-center gap-2.5 text-blue-600 my-10 animate-pulse select-none">
                <RefreshCw className="w-5 h-5 animate-spin" suppressHydrationWarning />
                <span className="text-sm font-extrabold">Loading PDF layout...</span>
              </div>
            )}

            {/* Canvas workspace block */}
            <div className="relative shadow-xl rounded-xl border border-slate-300/60 bg-white">
              <div
                onClick={handleCanvasClick}
                className={`relative select-none ${editMode === 'add' ? 'cursor-crosshair' : 'cursor-default'}`}
                style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}
              >
                {/* PDF Page Canvas */}
                <canvas ref={canvasRef} className="absolute inset-0 rounded-xl" />

                {/* Textbox Annotations Overlay layer */}
                {pageBoxesList.map((box) => {
                  if (box.isDeleted) return null;
                  
                  // Hide original text boxes in add mode unless active/selected to keep screen clean
                  if (box.source === 'original' && editMode === 'add' && selectedBoxId !== box.id) {
                    return null;
                  }

                  const isSelected = selectedBoxId === box.id;

                  return (
                    <Rnd
                      key={box.id}
                      size={{ width: box.width, height: box.height }}
                      position={{ x: box.x, y: box.y }}
                      onDragStop={(e, d) => {
                        setTextBoxes(prev => {
                          const pageBoxes = prev[currentPage] || [];
                          const updated = pageBoxes.map(b => {
                            if (b.id === box.id) {
                              const isModified = b.source === 'original' ? true : false;
                              return { ...b, x: d.x, y: d.y, isModified };
                            }
                            return b;
                          });
                          return { ...prev, [currentPage]: updated };
                        });
                      }}
                      onResizeStop={(e, dir, ref, delta, pos) => {
                        const w = parseInt(ref.style.width, 10);
                        const h = parseInt(ref.style.height, 10);
                        setTextBoxes(prev => {
                          const pageBoxes = prev[currentPage] || [];
                          const updated = pageBoxes.map(b => {
                            if (b.id === box.id) {
                              const isModified = b.source === 'original' ? true : false;
                              return { ...b, width: w, height: h, x: pos.x, y: pos.y, isModified };
                            }
                            return b;
                          });
                          return { ...prev, [currentPage]: updated };
                        });
                      }}
                      bounds="parent"
                      disableDragging={!isSelected}
                      enableResizing={{
                        topLeft: isSelected,
                        topRight: isSelected,
                        bottomLeft: isSelected,
                        bottomRight: isSelected,
                        top: false,
                        right: isSelected,
                        bottom: isSelected,
                        left: false,
                      }}
                      onClick={(e: React.MouseEvent<HTMLElement>) => {
                        e.stopPropagation();
                        setSelectedBoxId(box.id);
                      }}
                      
                      // UI style specifications (Requirement 13 & 14): transparent background and blue dashed border
                      className={`absolute flex items-start justify-start p-0.5 transition-all bg-transparent ${
                        isSelected
                          ? 'border border-dashed border-blue-500 shadow-sm z-20'
                          : box.source === 'original'
                            ? 'border border-dashed border-blue-400/40 hover:border-blue-500/60 hover:bg-blue-500/[0.02] cursor-pointer z-10'
                            : 'border border-dashed border-slate-300 hover:border-blue-500/60 cursor-pointer z-10'
                      }`}
                    >
                      {/* Anchor dots for active selected box */}
                      {isSelected && (
                        <>
                          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full pointer-events-none z-10" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full pointer-events-none z-10" />
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full pointer-events-none z-10" />
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full pointer-events-none z-10" />
                        </>
                      )}

                      {/* Text editor textarea */}
                      <textarea
                        value={box.text}
                        onChange={(e) => updateTextBoxText(box.id, e.target.value)}
                        style={{
                          fontSize: `${box.fontSize}px`,
                          color: box.color || "#000000",
                        }}
                        className="w-full h-full bg-transparent border-none resize-none outline-none overflow-hidden font-sans leading-tight select-text"
                        placeholder="Type text..."
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedBoxId(box.id)}
                      />
                    </Rnd>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-slate-400 select-none">
              {editMode === 'edit' ? (
                <p>Click any blue box to select and edit its text content.</p>
              ) : (
                <p>Click anywhere on the PDF page above to spawn a custom text annotation.</p>
              )}
            </div>
          </main>

          {/* RIGHT COLUMN: Sidebar properties panel */}
          <aside className="w-80 bg-white border-l border-slate-200 flex flex-col overflow-hidden select-none">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Properties</span>
              <span className="text-xs font-bold text-slate-500">{activeBox ? "Selected" : "No Selection"}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeBox ? (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Selected Box Info Type */}
                  <div className="bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Annotation Source</span>
                    <span className="text-xs font-black text-slate-700">
                      {activeBox.source === 'original' ? "Original PDF Text" : "Custom Added Text"}
                    </span>
                  </div>

                  {/* Input textarea editor */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Edit Text Content
                    </label>
                    <textarea
                      value={activeBox.text}
                      onChange={(e) => updateTextBoxText(activeBox.id, e.target.value)}
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white transition-all placeholder-slate-400 outline-none"
                      placeholder="Type text..."
                    />
                  </div>

                  {/* Font Size controls */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Font Size
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateTextBoxFontSize(activeBox.id, Math.max(6, activeBox.fontSize - 1))}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-slate-600 hover:text-slate-900"
                        title="Decrease Font Size"
                      >
                        <Minus className="w-4 h-4" suppressHydrationWarning />
                      </button>
                      
                      <select
                        value={activeBox.fontSize}
                        onChange={(e) => updateTextBoxFontSize(activeBox.id, parseInt(e.target.value, 10))}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:border-blue-500 outline-none transition-all"
                      >
                        {FONT_SIZES.map((sz) => (
                          <option key={sz} value={sz}>{sz} px</option>
                        ))}
                      </select>

                      <button
                        onClick={() => updateTextBoxFontSize(activeBox.id, Math.min(100, activeBox.fontSize + 1))}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-slate-600 hover:text-slate-900"
                        title="Increase Font Size"
                      >
                        <Plus className="w-4 h-4" suppressHydrationWarning />
                      </button>
                    </div>
                  </div>

                  {/* Color Selector controls (Requirement 11) */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2.5">
                      {[
                        { name: 'Black', hex: '#000000', bg: 'bg-black' },
                        { name: 'Blue', hex: '#1e3a8a', bg: 'bg-blue-900' },
                        { name: 'Sky', hex: '#0284c7', bg: 'bg-sky-600' },
                        { name: 'Red', hex: '#ef4444', bg: 'bg-red-500' },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => {
                            setTextBoxes(prev => {
                              const pageBoxes = prev[currentPage] || [];
                              const updated = pageBoxes.map(b => b.id === activeBox.id ? { ...b, color: c.hex, isModified: b.source === 'original' ? true : false } : b);
                              return { ...prev, [currentPage]: updated };
                            });
                          }}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${c.bg} ${
                            activeBox.color === c.hex
                              ? 'border-blue-500 scale-110 shadow'
                              : 'border-transparent hover:scale-105 hover:border-slate-300'
                          }`}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTextBox(activeBox.id)}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-red-100"
                  >
                    <Trash2 className="w-4 h-4" suppressHydrationWarning />
                    Delete Element
                  </button>

                </div>
              ) : (
                // Empty Property inspector
                <div className="py-20 text-center space-y-4">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-slate-100 shadow-inner text-slate-400">
                    <Type className="w-6 h-6" suppressHydrationWarning />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">No Element Selected</h4>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed px-4">
                    {editMode === 'edit'
                      ? "Select any text box on the PDF canvas to edit its properties."
                      : "Switch back to 'Edit Existing' or click on the canvas to add text."}
                  </p>
                </div>
              )}
            </div>

            {/* Quick helper Guide */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Editor Guide</h4>
              <ul className="text-[11px] text-slate-500 space-y-2 leading-normal">
                <li className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                  <span>All modifications take place securely on your browser.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                  <span>Original text modified will be covered and redrawn correctly.</span>
                </li>
              </ul>
            </div>
          </aside>

        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolHero from "@/components/tools/ToolHero";
import UploadZone from "@/components/tools/UploadZone";
import {
  Scissors,
  Download,
  RefreshCw,
  CheckCircle,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { uint8ArrayToArrayBuffer } from "@/lib/pdf/pdfUtils";

export interface NormalizedCrop {
  x: number; // percentage 0 - 100 from left
  y: number; // percentage 0 - 100 from top
  width: number; // percentage 0 - 100 width
  height: number; // percentage 0 - 100 height
}

export interface PageDimension {
  widthPt: number;
  heightPt: number;
}

export type DisplayUnit = "px" | "mm" | "%";
export type TargetScope = "current" | "selected" | "all";
export type ViewMode = "editor" | "before-after";

interface CropPdfEngineProps {
  seoArticle?: React.ReactNode;
}

export default function CropPdfEngine({ seoArticle }: CropPdfEngineProps) {
  // File & PDFJS State
  const [file, setFile] = useState<File | null>(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<Record<number, PageDimension>>({});
  
  // Navigation & Selection
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set([1]));
  const [applyScope, setApplyScope] = useState<TargetScope>("all");
  
  // Crop Data (Normalized per page)
  const defaultCrop: NormalizedCrop = { x: 0, y: 0, width: 100, height: 100 };
  const [pageCrops, setPageCrops] = useState<Record<number, NormalizedCrop>>({});

  // View & Workspace Settings
  const [zoom, setZoom] = useState<number>(1.0);
  const [fitMode, setFitMode] = useState<"custom" | "width" | "page">("page");
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>("%");
  const [viewMode, setViewMode] = useState<ViewMode>("editor");

  // Interaction State for Drag & Resize
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null); // 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'
  const [dragStart, setDragStart] = useState<{ x: number; y: number; crop: NormalizedCrop }>({
    x: 0,
    y: 0,
    crop: defaultCrop,
  });
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);

  // Smart Detection State
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [suggestedCrop, setSuggestedCrop] = useState<NormalizedCrop | null>(null);

  // Compilation & Output State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [croppedPdfUrl, setCroppedPdfUrl] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // DOM Refs
  const workspaceRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainRenderTaskRef = useRef<any>(null);
  const thumbnailRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  // Get active crop for current page
  const currentCrop = pageCrops[currentPage] || defaultCrop;

  // Initialize PDF.js
  useEffect(() => {
    const initPdfjs = async () => {
      try {
        const lib = await import("pdfjs-dist");
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        setPdfjs(lib);
      } catch (err) {
        console.error("Failed to load pdfjs-dist", err);
        toast.error("Failed to load PDF engine. Please refresh.");
      }
    };
    initPdfjs();
  }, []);

  // Track Shift Key for aspect ratio preservation & Arrow Keys for page navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(true);
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentPage((p) => Math.max(1, p - 1));
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentPage((p) => (pdfDoc ? Math.min(pdfDoc.numPages, p + 1) : p));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pdfDoc]);

  // Load PDF document when file changes
  const handleFilesSelected = async (fileList: FileList | File[]) => {
    const files = Array.isArray(fileList) ? fileList : Array.from(fileList);
    const pdfFile = files.find((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));

    if (!pdfFile) {
      toast.error("Please select a valid PDF file.");
      return;
    }

    if (!pdfjs) {
      toast.error("PDF engine is initializing, please try again in a moment.");
      return;
    }

    try {
      setFile(pdfFile);
      setCroppedPdfUrl(null);
      setIsSuccess(false);
      setSuggestedCrop(null);

      const buffer = await pdfFile.arrayBuffer();
      setPdfArrayBuffer(buffer);

      const loadingTask = pdfjs.getDocument({ data: buffer.slice(0) });
      const loadedDoc = await loadingTask.promise;
      setPdfDoc(loadedDoc);
      setNumPages(loadedDoc.numPages);
      setCurrentPage(1);

      // Initialize selected pages and page dimensions
      const initialSelected = new Set<number>();
      for (let i = 1; i <= loadedDoc.numPages; i++) initialSelected.add(i);
      setSelectedPages(initialSelected);

      // Load all page dimensions
      const dims: Record<number, PageDimension> = {};
      const crops: Record<number, NormalizedCrop> = {};
      for (let i = 1; i <= loadedDoc.numPages; i++) {
        const page = await loadedDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        dims[i] = { widthPt: viewport.width, heightPt: viewport.height };
        crops[i] = { ...defaultCrop };
      }
      setPageDimensions(dims);
      setPageCrops(crops);
      toast.success(`Loaded PDF with ${loadedDoc.numPages} page(s).`);
    } catch (err: any) {
      console.error(err);
      toast.error("Error opening PDF file. File may be encrypted or corrupted.");
    }
  };

  // Render thumbnail for a page
  const renderThumbnail = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement | null) => {
      if (!canvas || !pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.25 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
        }
      } catch (e: any) {
        if (e?.name !== "RenderingCancelledException") {
          console.error(`Error rendering thumbnail page ${pageNum}`, e);
        }
      }
    },
    [pdfDoc]
  );

  // Render main page canvas
  const renderMainCanvas = useCallback(async () => {
    if (!pdfDoc || !mainCanvasRef.current || currentPage < 1) return;

    try {
      // Cancel previous in-flight render task if active
      if (mainRenderTaskRef.current) {
        try {
          mainRenderTaskRef.current.cancel();
        } catch (_) {}
        mainRenderTaskRef.current = null;
      }

      const page = await pdfDoc.getPage(currentPage);
      const baseViewport = page.getViewport({ scale: 1.0 });
      let renderScale = zoom;

      if (fitMode === "width" && workspaceRef.current) {
        const containerWidth = workspaceRef.current.clientWidth - 96;
        renderScale = containerWidth / baseViewport.width;
      } else if (fitMode === "page" && workspaceRef.current) {
        const containerWidth = workspaceRef.current.clientWidth - 96;
        const containerHeight = workspaceRef.current.clientHeight - 96;
        const widthScale = containerWidth / baseViewport.width;
        const heightScale = containerHeight / baseViewport.height;
        renderScale = Math.min(widthScale, heightScale, 2.0);
      }

      renderScale = Math.max(0.4, Math.min(3.0, renderScale));

      const viewport = page.getViewport({ scale: renderScale });
      const canvas = mainCanvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const task = page.render({ canvasContext: ctx, viewport });
        mainRenderTaskRef.current = task;
        await task.promise;
        mainRenderTaskRef.current = null;
      }
    } catch (e: any) {
      if (e?.name !== "RenderingCancelledException") {
        console.error("Error rendering main page canvas", e);
      }
    }
  }, [pdfDoc, currentPage, zoom, fitMode]);

  useEffect(() => {
    renderMainCanvas();
  }, [renderMainCanvas]);

  // Update a crop and apply to scope
  const updateCrop = useCallback(
    (newCrop: NormalizedCrop) => {
      // Clamp crop boundaries
      const x = Math.max(0, Math.min(95, newCrop.x));
      const y = Math.max(0, Math.min(95, newCrop.y));
      const width = Math.max(5, Math.min(100 - x, newCrop.width));
      const height = Math.max(5, Math.min(100 - y, newCrop.height));

      const clamped: NormalizedCrop = { x, y, width, height };

      setPageCrops((prev) => {
        const updated = { ...prev };
        if (applyScope === "current") {
          updated[currentPage] = clamped;
        } else if (applyScope === "selected") {
          selectedPages.forEach((p) => {
            updated[p] = clamped;
          });
        } else if (applyScope === "all") {
          for (let p = 1; p <= numPages; p++) {
            updated[p] = clamped;
          }
        }
        return updated;
      });
    },
    [applyScope, currentPage, selectedPages, numPages]
  );

  // Mouse Drag & Handle Resizing Logic
  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragHandle(handle);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      crop: { ...currentCrop },
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragHandle || !mainCanvasRef.current) return;

      const rect = mainCanvasRef.current.getBoundingClientRect();
      const dxPx = e.clientX - dragStart.x;
      const dyPx = e.clientY - dragStart.y;

      const dxPct = (dxPx / rect.width) * 100;
      const dyPct = (dyPx / rect.height) * 100;

      const initial = dragStart.crop;
      let next: NormalizedCrop = { ...initial };

      if (dragHandle === "move") {
        next.x = initial.x + dxPct;
        next.y = initial.y + dyPct;
      } else {
        let newX = initial.x;
        let newY = initial.y;
        let newW = initial.width;
        let newH = initial.height;

        if (dragHandle.includes("w")) {
          newX = initial.x + dxPct;
          newW = initial.width - dxPct;
        }
        if (dragHandle.includes("e")) {
          newW = initial.width + dxPct;
        }
        if (dragHandle.includes("n")) {
          newY = initial.y + dyPct;
          newH = initial.height - dyPct;
        }
        if (dragHandle.includes("s")) {
          newH = initial.height + dyPct;
        }

        // Handle Shift key aspect ratio preservation
        if (isShiftPressed && initial.height > 0) {
          const aspect = initial.width / initial.height;
          newH = newW / aspect;
        }

        next = { x: newX, y: newY, width: newW, height: newH };
      }

      updateCrop(next);
    },
    [isDragging, dragHandle, dragStart, isShiftPressed, updateCrop]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragHandle(null);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Double click overlay reset
  const handleDoubleClickReset = () => {
    updateCrop({ ...defaultCrop });
    toast.success("Crop box reset to full page.");
  };

  // Convert unit to display values
  const getMarginValues = () => {
    const dim = pageDimensions[currentPage] || { widthPt: 595, heightPt: 842 };
    const topPct = currentCrop.y;
    const leftPct = currentCrop.x;
    const bottomPct = 100 - (currentCrop.y + currentCrop.height);
    const rightPct = 100 - (currentCrop.x + currentCrop.width);

    if (displayUnit === "%") {
      return {
        top: Math.round(topPct),
        bottom: Math.round(bottomPct),
        left: Math.round(leftPct),
        right: Math.round(rightPct),
        width: Math.round(currentCrop.width),
        height: Math.round(currentCrop.height),
      };
    }

    const factor = displayUnit === "px" ? 1.33333 : 0.352778;
    const widthUnit = dim.widthPt * factor;
    const heightUnit = dim.heightPt * factor;

    return {
      top: Math.round((topPct / 100) * heightUnit),
      bottom: Math.round((bottomPct / 100) * heightUnit),
      left: Math.round((leftPct / 100) * widthUnit),
      right: Math.round((rightPct / 100) * widthUnit),
      width: Math.round((currentCrop.width / 100) * widthUnit),
      height: Math.round((currentCrop.height / 100) * heightUnit),
    };
  };

  // Update margin from input field
  const handleMarginInputChange = (side: "top" | "bottom" | "left" | "right", val: number) => {
    const dim = pageDimensions[currentPage] || { widthPt: 595, heightPt: 842 };
    let pctVal = val;

    if (displayUnit !== "%") {
      const factor = displayUnit === "px" ? 1.33333 : 0.352778;
      const dimension = side === "top" || side === "bottom" ? dim.heightPt * factor : dim.widthPt * factor;
      pctVal = (val / dimension) * 100;
    }

    pctVal = Math.max(0, Math.min(45, pctVal));

    let next: NormalizedCrop = { ...currentCrop };
    if (side === "top") {
      next.y = pctVal;
      next.height = 100 - pctVal - (100 - (currentCrop.y + currentCrop.height));
    } else if (side === "bottom") {
      next.height = 100 - currentCrop.y - pctVal;
    } else if (side === "left") {
      next.x = pctVal;
      next.width = 100 - pctVal - (100 - (currentCrop.x + currentCrop.width));
    } else if (side === "right") {
      next.width = 100 - currentCrop.x - pctVal;
    }

    updateCrop(next);
  };

  // Presets
  const applyPreset = (preset: "white-margins" | "a4-safe" | "book-scan" | "cleanup" | "reset") => {
    if (preset === "white-margins") {
      runSmartWhiteMarginDetection();
    } else if (preset === "a4-safe") {
      updateCrop({ x: 5, y: 5, width: 90, height: 90 });
      toast.success("Applied A4 Safe Crop (5% margins)");
    } else if (preset === "book-scan") {
      updateCrop({ x: 10, y: 8, width: 80, height: 84 });
      toast.success("Applied Book Scan Crop (10% side, 8% top/bottom)");
    } else if (preset === "cleanup") {
      updateCrop({ x: 8, y: 8, width: 84, height: 84 });
      toast.success("Applied Document Cleanup Crop (8% margins)");
    } else if (preset === "reset") {
      updateCrop({ ...defaultCrop });
      toast.success("Reset crop to full page size");
    }
  };

  // AI / Smart Auto White Margin Detector
  const runSmartWhiteMarginDetection = async () => {
    if (!mainCanvasRef.current) return;
    setIsDetecting(true);
    try {
      const canvas = mainCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const width = canvas.width;
      const height = canvas.height;

      let minX = width;
      let maxX = 0;
      let minY = height;
      let maxY = 0;

      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a > 30 && (r < 242 || g < 242 || b < 242)) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (minX >= maxX || minY >= maxY) {
        toast.warning("No distinct white margins detected.");
        setIsDetecting(false);
        return;
      }

      const padX = width * 0.02;
      const padY = height * 0.02;

      const cropX = Math.max(0, ((minX - padX) / width) * 100);
      const cropY = Math.max(0, ((minY - padY) / height) * 100);
      const cropW = Math.min(100 - cropX, ((maxX - minX + padX * 2) / width) * 100);
      const cropH = Math.min(100 - cropY, ((maxY - minY + padY * 2) / height) * 100);

      const detected: NormalizedCrop = {
        x: Math.round(cropX),
        y: Math.round(cropY),
        width: Math.round(cropW),
        height: Math.round(cropH),
      };

      setSuggestedCrop(detected);
      toast.info("Auto white margin crop calculated. Click Accept to apply.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to detect white margins.");
    } finally {
      setIsDetecting(false);
    }
  };

  const acceptSuggestedCrop = () => {
    if (suggestedCrop) {
      updateCrop(suggestedCrop);
      setSuggestedCrop(null);
      toast.success("Applied suggested white margin crop!");
    }
  };

  const rejectSuggestedCrop = () => {
    setSuggestedCrop(null);
  };

  // Compile PDF using pdf-lib
  const processCompileCrop = async () => {
    if (!pdfArrayBuffer || !file) return;
    setIsProcessing(true);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDocLib = await PDFDocument.load(pdfArrayBuffer, { ignoreEncryption: true });
      const pages = pdfDocLib.getPages();

      pages.forEach((page, idx) => {
        const pageNum = idx + 1;
        const crop = pageCrops[pageNum] || defaultCrop;

        const { width, height } = page.getSize();

        const xOffset = width * (crop.x / 100);
        const yOffset = height * ((100 - crop.y - crop.height) / 100);
        const croppedWidth = width * (crop.width / 100);
        const croppedHeight = height * (crop.height / 100);

        page.setCropBox(xOffset, yOffset, croppedWidth, croppedHeight);
      });

      const pdfBytes = await pdfDocLib.save();
      const blob = new Blob([uint8ArrayToArrayBuffer(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setCroppedPdfUrl(url);
      setIsSuccess(true);
      toast.success("Cropped PDF compiled successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Error cropping PDF. The file may be password-protected or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfArrayBuffer(null);
    setPdfDoc(null);
    setNumPages(0);
    setCroppedPdfUrl(null);
    setIsSuccess(false);
    setPageCrops({});
    setSelectedPages(new Set());
    setSuggestedCrop(null);
  };

  const margins = getMarginValues();

  return (
    <ToolLayout>
      <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-16">
        <ToolHero
          title="Crop PDF Editor"
          description="Visual, high-resolution PDF margin cropper with interactive handles, auto white margin detection, and multi-unit synchronization."
          icon={<Scissors className="w-7 h-7" />}
        />

        <div className="p-6 sm:p-10 bg-black/[0.15]">
          {!file ? (
            <UploadZone
              onFilesSelected={handleFilesSelected}
              accept="application/pdf"
              multiple={false}
              title="Upload PDF to Crop Margins"
              description="Drag & drop your PDF file here. 100% private & client-side processing."
            />
          ) : (
            <div className="space-y-6">
              {/* File Info Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 gap-4">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="bg-[#030712] p-3 rounded-xl border border-white/5 flex-shrink-0 text-red-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {numPages} Page(s) • {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={resetAll}
                    className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/20 transition-all cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Main Workspace Layout (Sidebar + Viewer + Right Panel) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT SIDEBAR: Page Thumbnails */}
                <div className="lg:col-span-3 bg-[#030712]/80 border border-white/10 rounded-2xl p-4 space-y-4 max-h-[700px] flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                      Pages ({numPages})
                    </span>
                    <button
                      onClick={() => {
                        if (selectedPages.size === numPages) {
                          setSelectedPages(new Set([currentPage]));
                        } else {
                          const all = new Set<number>();
                          for (let i = 1; i <= numPages; i++) all.add(i);
                          setSelectedPages(all);
                        }
                      }}
                      className="text-[10px] font-bold text-blue-400 hover:underline cursor-pointer"
                    >
                      {selectedPages.size === numPages ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="overflow-y-auto space-y-3 pr-1 flex-1 scrollbar-thin scrollbar-thumb-white/10">
                    {Array.from({ length: numPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isCurrent = currentPage === pageNum;
                      const isSelected = selectedPages.has(pageNum);

                      return (
                        <div
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isCurrent
                              ? "bg-blue-600/15 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                              : isSelected
                              ? "bg-white/5 border-white/20"
                              : "bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/[0.02]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              const nextSet = new Set(selectedPages);
                              if (nextSet.has(pageNum)) {
                                if (nextSet.size > 1) nextSet.delete(pageNum);
                              } else {
                                nextSet.add(pageNum);
                              }
                              setSelectedPages(nextSet);
                            }}
                            className="rounded border-white/20 bg-black/40 text-blue-500 focus:ring-0 cursor-pointer"
                          />

                          <div className="w-14 h-18 bg-white/5 rounded border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                            <canvas
                              ref={(el) => {
                                thumbnailRefs.current[pageNum] = el;
                                if (el) renderThumbnail(pageNum, el);
                              }}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>

                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Page {pageNum}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {pageCrops[pageNum] && pageCrops[pageNum].width < 100
                                ? "Cropped"
                                : "Full Size"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CENTER WORKSPACE: Main PDF Page + Draggable Crop Box Overlay */}
                <div
                  ref={workspaceRef}
                  className="lg:col-span-6 bg-[#030712] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-[600px] overflow-hidden"
                >
                  {/* Top Workspace Toolbar */}
                  <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-6 gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-white px-2">
                        {currentPage} / {numPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                        disabled={currentPage === numPages}
                        className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Next Page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode(viewMode === "editor" ? "before-after" : "editor")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          viewMode === "before-after"
                            ? "bg-purple-600/20 border-purple-500 text-purple-300"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {viewMode === "editor" ? "Compare Preview" : "Back to Editor"}
                      </button>

                      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        <button
                          onClick={() => {
                            setFitMode("custom");
                            setZoom((z) => Math.max(0.4, z - 0.15));
                          }}
                          className="p-1.5 text-gray-400 hover:text-white cursor-pointer"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-bold text-gray-300 px-1">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={() => {
                            setFitMode("custom");
                            setZoom((z) => Math.min(3.0, z + 0.15));
                          }}
                          className="p-1.5 text-gray-400 hover:text-white cursor-pointer"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setFitMode("page")}
                          className="p-1.5 text-gray-400 hover:text-white cursor-pointer"
                          title="Fit Page"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Smart Margin Suggestion Banner */}
                  {suggestedCrop && (
                    <div className="w-full mb-4 p-3 bg-blue-600/15 border border-blue-500/30 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2 text-xs text-blue-300 font-medium">
                        <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        Auto white margin crop suggested ({suggestedCrop.width}% x {suggestedCrop.height}%)
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={acceptSuggestedCrop}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          onClick={rejectSuggestedCrop}
                          className="px-2 py-1 text-gray-400 hover:text-white text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PDF Main Render Workspace Area */}
                  <div className="relative flex items-center justify-center max-w-full overflow-auto p-4 select-none">
                    {viewMode === "editor" ? (
                      <div className="relative inline-block border border-white/10 shadow-2xl rounded bg-white">
                        <canvas ref={mainCanvasRef} className="block max-w-full h-auto" />

                        {/* Interactive Drag & Resize Crop Rectangle Overlay */}
                        <div
                          onDoubleClick={handleDoubleClickReset}
                          className="absolute inset-0 pointer-events-none"
                        >
                          {/* Top Dark Overlay */}
                          <div
                            className="absolute bg-[#030712]/75 backdrop-blur-[1px]"
                            style={{
                              top: 0,
                              left: 0,
                              right: 0,
                              height: `${currentCrop.y}%`,
                            }}
                          />
                          {/* Bottom Dark Overlay */}
                          <div
                            className="absolute bg-[#030712]/75 backdrop-blur-[1px]"
                            style={{
                              top: `${currentCrop.y + currentCrop.height}%`,
                              left: 0,
                              right: 0,
                              bottom: 0,
                            }}
                          />
                          {/* Left Dark Overlay */}
                          <div
                            className="absolute bg-[#030712]/75 backdrop-blur-[1px]"
                            style={{
                              top: `${currentCrop.y}%`,
                              left: 0,
                              width: `${currentCrop.x}%`,
                              height: `${currentCrop.height}%`,
                            }}
                          />
                          {/* Right Dark Overlay */}
                          <div
                            className="absolute bg-[#030712]/75 backdrop-blur-[1px]"
                            style={{
                              top: `${currentCrop.y}%`,
                              left: `${currentCrop.x + currentCrop.width}%`,
                              right: 0,
                              height: `${currentCrop.height}%`,
                            }}
                          />

                          {/* Active Crop Box Boundary */}
                          <div
                            onMouseDown={(e) => handleMouseDown(e, "move")}
                            className="absolute border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] pointer-events-auto cursor-move group"
                            style={{
                              top: `${currentCrop.y}%`,
                              left: `${currentCrop.x}%`,
                              width: `${currentCrop.width}%`,
                              height: `${currentCrop.height}%`,
                            }}
                          >
                            {/* Inner Grid Guidelines */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity">
                              <div className="border-r border-b border-blue-400/50" />
                              <div className="border-r border-b border-blue-400/50" />
                              <div className="border-b border-blue-400/50" />
                              <div className="border-r border-b border-blue-400/50" />
                              <div className="border-r border-b border-blue-400/50" />
                              <div className="border-b border-blue-400/50" />
                            </div>

                            {/* 8 Resize Handles */}
                            {/* Corners */}
                            <div
                              onMouseDown={(e) => handleMouseDown(e, "nw")}
                              className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                            />
                            <div
                              onMouseDown={(e) => handleMouseDown(e, "ne")}
                              className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                            />
                            <div
                              onMouseDown={(e) => handleMouseDown(e, "sw")}
                              className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                            />
                            <div
                              onMouseDown={(e) => handleMouseDown(e, "se")}
                              className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                            />

                            {/* Edges */}
                            <div
                              onMouseDown={(e) => handleMouseDown(e, "n")}
                              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-3 bg-blue-500 border border-white rounded-sm cursor-ns-resize shadow-md"
                            />
                            <div
                              onMouseDown={(e) => handleMouseDown(e, "s")}
                              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-3 bg-blue-500 border border-white rounded-sm cursor-ns-resize shadow-md"
                            />
                            <div
                              onMouseDown={(e) => handleMouseDown(e, "w")}
                              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-7 bg-blue-500 border border-white rounded-sm cursor-ew-resize shadow-md"
                            />
                            <div
                              onMouseDown={(e) => handleMouseDown(e, "e")}
                              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-7 bg-blue-500 border border-white rounded-sm cursor-ew-resize shadow-md"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Before / After Split Screen Comparison View */
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="space-y-2 text-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                            Before (Original Page)
                          </span>
                          <div className="border border-white/10 rounded overflow-hidden bg-white inline-block max-w-full">
                            <canvas ref={mainCanvasRef} className="block max-w-full h-auto" />
                          </div>
                        </div>

                        <div className="space-y-2 text-center">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                            After (Cropped Preview)
                          </span>
                          <div className="border border-emerald-500/40 rounded overflow-hidden bg-white inline-block max-w-full relative shadow-lg">
                            <div
                              className="overflow-hidden"
                              style={{
                                width: `${currentCrop.width}%`,
                                height: `${currentCrop.height}%`,
                                marginTop: `${currentCrop.y}%`,
                                marginLeft: `${currentCrop.x}%`,
                              }}
                            >
                              <canvas ref={mainCanvasRef} className="block max-w-full h-auto" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-500 mt-4">
                    💡 Drag handles to crop • Hold <kbd className="px-1 py-0.5 bg-white/10 rounded">Shift</kbd> for aspect ratio • Double-click to reset
                  </p>
                </div>

                {/* RIGHT PANEL: Presets, Units, & Property Inputs */}
                <div className="lg:col-span-3 bg-[#030712]/80 border border-white/10 rounded-2xl p-5 space-y-6">
                  
                  {/* Presets */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
                      Crop Presets
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => applyPreset("white-margins")}
                        disabled={isDetecting}
                        className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 text-left text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer col-span-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        {isDetecting ? "Scanning..." : "Detect White Margins"}
                      </button>

                      <button
                        onClick={() => applyPreset("a4-safe")}
                        className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-left text-xs font-bold transition-all cursor-pointer"
                      >
                        A4 Safe Crop
                      </button>
                      <button
                        onClick={() => applyPreset("book-scan")}
                        className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-left text-xs font-bold transition-all cursor-pointer"
                      >
                        Book Scan
                      </button>
                      <button
                        onClick={() => applyPreset("cleanup")}
                        className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-left text-xs font-bold transition-all cursor-pointer"
                      >
                        Document Cleanup
                      </button>
                      <button
                        onClick={() => applyPreset("reset")}
                        className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-left text-xs font-bold transition-all cursor-pointer"
                      >
                        Reset Crop
                      </button>
                    </div>
                  </div>

                  {/* Units & Synchronized Margins */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                        Margin Inputs
                      </label>

                      {/* Unit Switcher Buttons */}
                      <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10">
                        {(["px", "mm", "%"] as DisplayUnit[]).map((u) => (
                          <button
                            key={u}
                            onClick={() => setDisplayUnit(u)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase transition-all cursor-pointer ${
                              displayUnit === u
                                ? "bg-blue-600 text-white"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Top / Bottom / Left / Right Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Top Margin
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={margins.top}
                            onChange={(e) => handleMarginInputChange("top", parseFloat(e.target.value) || 0)}
                            className="w-full rounded-xl border border-white/10 px-3 py-2 text-xs font-bold bg-[#030712] text-white focus:border-blue-500 focus:outline-none pr-8"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 uppercase">
                            {displayUnit}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Bottom Margin
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={margins.bottom}
                            onChange={(e) => handleMarginInputChange("bottom", parseFloat(e.target.value) || 0)}
                            className="w-full rounded-xl border border-white/10 px-3 py-2 text-xs font-bold bg-[#030712] text-white focus:border-blue-500 focus:outline-none pr-8"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 uppercase">
                            {displayUnit}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Left Margin
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={margins.left}
                            onChange={(e) => handleMarginInputChange("left", parseFloat(e.target.value) || 0)}
                            className="w-full rounded-xl border border-white/10 px-3 py-2 text-xs font-bold bg-[#030712] text-white focus:border-blue-500 focus:outline-none pr-8"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 uppercase">
                            {displayUnit}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Right Margin
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={margins.right}
                            onChange={(e) => handleMarginInputChange("right", parseFloat(e.target.value) || 0)}
                            className="w-full rounded-xl border border-white/10 px-3 py-2 text-xs font-bold bg-[#030712] text-white focus:border-blue-500 focus:outline-none pr-8"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 uppercase">
                            {displayUnit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-gray-300 font-medium">
                      Dimensions: <span className="font-bold text-white">{margins.width} x {margins.height} {displayUnit}</span>
                    </div>
                  </div>

                  {/* Apply Scope Selection */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
                      Apply Crop To
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: "current", label: `Current Page (Page ${currentPage})` },
                        { id: "selected", label: `Selected Pages (${selectedPages.size} pages)` },
                        { id: "all", label: `All Pages (${numPages} pages)` },
                      ].map((scope) => (
                        <label
                          key={scope.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            applyScope === scope.id
                              ? "bg-blue-600/15 border-blue-500/60 text-white"
                              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                          }`}
                        >
                          <input
                            type="radio"
                            name="applyScope"
                            value={scope.id}
                            checked={applyScope === scope.id}
                            onChange={() => setApplyScope(scope.id as TargetScope)}
                            className="text-blue-500 focus:ring-0"
                          />
                          <span className="text-xs font-bold">{scope.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Notification & Download */}
              {isSuccess && croppedPdfUrl && (
                <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-3xl p-8 text-center shadow-2xl animate-fade-in my-6">
                  <div className="w-14 h-14 bg-emerald-500/25 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">PDF Cropped Successfully!</h4>
                  <p className="text-xs text-gray-400 mb-4">
                    Your cropped document is compiled and ready for instant download.
                  </p>
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10">
                <button
                  onClick={() => applyPreset("reset")}
                  className="w-full sm:w-auto px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                >
                  Reset Crop
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {!croppedPdfUrl ? (
                    <button
                      onClick={processCompileCrop}
                      disabled={isProcessing}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Scissors className="w-4 h-4" />
                      )}
                      {isProcessing ? "Cropping PDF..." : "Apply & Crop PDF"}
                    </button>
                  ) : (
                    <a
                      href={croppedPdfUrl}
                      download={`cropped_${file.name}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] text-center cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download Cropped PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {seoArticle}
    </ToolLayout>
  );
}

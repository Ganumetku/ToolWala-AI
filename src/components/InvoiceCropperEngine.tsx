"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  Crop,
  RefreshCw,
  Sliders,
  SlidersHorizontal,
  Check,
  Sparkles,
  FileImage,
  UploadCloud,
  Trash2,
  FileText,
  RotateCw,
  Sun,
  Maximize2,
  FileCheck,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

// Local byte formatter helper
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Grayscale canvas sharpening helper
const sharpenCanvas = (canvas: HTMLCanvasElement, value: number) => {
  if (value <= 0) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;
  const copy = new Uint8ClampedArray(pixels);

  const w = value / 150;
  const a = -w;
  const b = 1 + 4 * w;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = ((y - 1) * width + x) * 4 + c;
        const bottom = ((y + 1) * width + x) * 4 + c;
        const left = (y * width + (x - 1)) * 4 + c;
        const right = (y * width + (x + 1)) * 4 + c;
        const center = i + c;

        const newVal = copy[center] * b + (copy[top] + copy[bottom] + copy[left] + copy[right]) * a;
        pixels[center] = Math.max(0, Math.min(255, newVal));
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
};

// Helper to compress canvas to JPEG below target KB limit using binary search
const compressToKbLimit = (
  canvas: HTMLCanvasElement,
  targetKb: number
): Promise<string> => {
  return new Promise((resolve) => {
    let low = 0.01;
    let high = 0.99;
    let bestDataUrl = "";
    let iterations = 0;
    const targetBytes = targetKb * 1024;

    const run = () => {
      if (iterations >= 8 || low > high) {
        resolve(bestDataUrl || canvas.toDataURL("image/jpeg", 0.1));
        return;
      }
      iterations++;
      const mid = (low + high) / 2;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(canvas.toDataURL("image/jpeg", mid));
            return;
          }
          const size = blob.size;
          if (size <= targetBytes) {
            const reader = new FileReader();
            reader.onloadend = () => {
              bestDataUrl = reader.result as string;
              low = mid + 0.02;
              run();
            };
            reader.readAsDataURL(blob);
          } else {
            high = mid - 0.02;
            run();
          }
        },
        "image/jpeg",
        mid
      );
    };
    run();
  });
};

// Auto edge scanner using pixel gradient variance
const analyzeDocumentMargins = (img: HTMLImageElement): { top: number, bottom: number, left: number, right: number } => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return { top: 0, bottom: img.naturalHeight || img.height, left: 0, right: img.naturalWidth || img.width };

  const maxDim = 300;
  const nw = img.naturalWidth || img.width || 300;
  const nh = img.naturalHeight || img.height || 300;
  const scale = Math.min(maxDim / nw, maxDim / nh);
  const w = Math.round(nw * scale);
  const h = Math.round(nh * scale);

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Horizontal variance
    const rowVariances = new Float32Array(h);
    for (let y = 0; y < h; y++) {
      let sum = 0;
      let sumSq = 0;
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const val = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        sum += val;
        sumSq += val * val;
      }
      const mean = sum / w;
      rowVariances[y] = (sumSq / w) - (mean * mean);
    }

    // Vertical variance
    const colVariances = new Float32Array(w);
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let sumSq = 0;
      for (let y = 0; y < h; y++) {
        const idx = (y * w + x) * 4;
        const val = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        sum += val;
        sumSq += val * val;
      }
      const mean = sum / h;
      colVariances[x] = (sumSq / h) - (mean * mean);
    }

    let maxRowVar = 0;
    for (let y = 0; y < h; y++) {
      if (rowVariances[y] > maxRowVar) maxRowVar = rowVariances[y];
    }
    let maxColVar = 0;
    for (let x = 0; x < w; x++) {
      if (colVariances[x] > maxColVar) maxColVar = colVariances[x];
    }

    // Keep threshold slightly sensitive to detect document pages (3% of max variance)
    const rowThresh = Math.max(12, maxRowVar * 0.03);
    const colThresh = Math.max(12, maxColVar * 0.03);

    let top = 0;
    while (top < h && rowVariances[top] < rowThresh) top++;

    let bottom = h - 1;
    while (bottom > top && rowVariances[bottom] < rowThresh) bottom--;

    let left = 0;
    while (left < w && colVariances[left] < colThresh) left++;

    let right = w - 1;
    while (right > left && colVariances[right] < colThresh) right--;

    // Pad margins slightly (3% padding)
    const wPad = Math.round((right - left) * 0.03);
    const hPad = Math.round((bottom - top) * 0.03);

    return {
      top: Math.max(0, Math.round((top - hPad) / scale)),
      bottom: Math.min(nh, Math.round((bottom + hPad) / scale)),
      left: Math.max(0, Math.round((left - wPad) / scale)),
      right: Math.min(nw, Math.round((right + wPad) / scale))
    };
  } catch {
    return { top: 0, bottom: nh, left: 0, right: nw };
  }
};

interface InvoiceCropperEngineProps {
  toolSlug: string;
  title: string;
  description: string;
  seoArticle?: React.ReactNode;
}

export default function InvoiceCropperEngine({
  toolSlug,
  title,
  description,
  seoArticle
}: InvoiceCropperEngineProps) {
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [step, setStep] = useState<"upload" | "processing" | "editor">("upload");
  const [loadingText, setLoadingText] = useState("");
  const [progress, setProgress] = useState(0);

  // File variables
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalImgUrl, setOriginalImgUrl] = useState<string | null>(null);
  const [activeImgElement, setActiveImgElement] = useState<HTMLImageElement | null>(null);
  
  // PDF states
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfPagesCount, setPdfPagesCount] = useState<number>(0);
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(1);
  const [pdfPreviews, setPdfPreviews] = useState<string[]>([]);

  // Workspace configuration
  const workW = 500;
  const workH = 400;
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(40);
  const [cropW, setCropW] = useState(400);
  const [cropH, setCropH] = useState(320);
  const [isLocked, setIsLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Enhancements
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [sharpness, setSharpness] = useState<number>(0);
  const [cleanBg, setCleanBg] = useState<boolean>(true);
  const [autoEnhance, setAutoEnhance] = useState<boolean>(false);

  // Transforms
  const [imgZoom, setImgZoom] = useState(1.0);
  const [imgPan, setImgPan] = useState({ x: 0, y: 0 });
  const [imgRotate, setImgRotate] = useState(0);

  // Image dimension references
  const [fitScale, setFitScale] = useState(1.0);
  const [imgNaturalWidth, setImgNaturalWidth] = useState(600);
  const [imgNaturalHeight, setImgNaturalHeight] = useState(600);

  // Exporter configs
  const [format, setFormat] = useState<"jpg" | "png" | "pdf">("pdf");
  const [targetKb, setTargetKb] = useState<number>(200);
  const [targetKbMode, setTargetKbMode] = useState<"custom" | "none">("none");
  const [downloadSizeInfo, setDownloadSizeInfo] = useState<string>("");
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Refs for interactions
  const workspaceRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragType = useRef<string | null>(null);
  const startPointer = useRef({ x: 0, y: 0 });
  const startCrop = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const startPan = useRef({ x: 0, y: 0 });
  const touchStartDist = useRef(0);
  const zoomStart = useRef(1.0);

  // Dynamically load PDF.js client-side
  useEffect(() => {
    const initPdfjs = async () => {
      try {
        const lib = await import("pdfjs-dist");
        lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
        setPdfjs(lib);
      } catch (err) {
        console.error("Failed to load pdfjs-dist", err);
      }
    };
    initPdfjs();
  }, []);

  // Sync workspace dimensions when element changes
  useEffect(() => {
    if (activeImgElement) {
      const nw = activeImgElement.naturalWidth || activeImgElement.width || 600;
      const nh = activeImgElement.naturalHeight || activeImgElement.height || 600;
      setImgNaturalWidth(nw);
      setImgNaturalHeight(nh);

      const fs = Math.min((workW * 0.95) / nw, (workH * 0.95) / nh);
      setFitScale(fs);
    }
  }, [activeImgElement]);

  const handleReset = () => {
    setImgZoom(1.0);
    setImgPan({ x: 0, y: 0 });
    setImgRotate(0);
    // Reset crop overlay
    setCropW(400);
    setCropH(320);
    setCropX(50);
    setCropY(40);
    toast.success("Workspace coordinates reset.");
  };

  // Variance edge scanning execution
  const executeAutoEdgeScan = () => {
    if (!activeImgElement) return;
    setIsScanning(true);
    toast.info("Scanning document edges...");

    setTimeout(() => {
      const bounds = analyzeDocumentMargins(activeImgElement);
      const s = fitScale * imgZoom;
      const cx = workW / 2 + imgPan.x;
      const cy = workH / 2 + imgPan.y;
      const imgLeft = cx - (imgNaturalWidth * s) / 2;
      const imgTop = cy - (imgNaturalHeight * s) / 2;

      // Map scanned dimensions to workspace coordinates
      const x = imgLeft + bounds.left * s;
      const y = imgTop + bounds.top * s;
      const w = (bounds.right - bounds.left) * s;
      const h = (bounds.bottom - bounds.top) * s;

      // Clamp within workspace boundaries
      const clampedX = Math.max(5, Math.min(workW - 35, x));
      const clampedY = Math.max(5, Math.min(workH - 35, y));
      const clampedW = Math.max(30, Math.min(workW - clampedX - 5, w));
      const clampedH = Math.max(30, Math.min(workH - clampedY - 5, h));

      setCropX(clampedX);
      setCropY(clampedY);
      setCropW(clampedW);
      setCropH(clampedH);

      setIsScanning(false);
      toast.success("Document edges aligned.");
    }, 1500); // Visual laser scanning effect duration
  };

  // Compile final crop slice on Canvas
  const compileExportImage = useCallback(async () => {
    if (!activeImgElement) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Define natural export size of the crop slice
      const s = fitScale * imgZoom;
      const sliceW = cropW / s;
      const sliceH = cropH / s;

      canvas.width = sliceW;
      canvas.height = sliceH;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sliceW, sliceH);

      // Apply filters before drawing
      const appliedBright = autoEnhance ? 108 : brightness;
      const appliedContrast = autoEnhance ? 110 : contrast;
      if (appliedBright !== 100 || appliedContrast !== 100) {
        ctx.filter = `brightness(${appliedBright}%) contrast(${appliedContrast}%)`;
      }

      // Translate context mapping workspace view properties
      ctx.save();
      const exportScale = sliceW / cropW;
      ctx.scale(exportScale, exportScale);
      ctx.translate(-cropX, -cropY);

      // Map image matrices
      ctx.translate(workW / 2 + imgPan.x, workH / 2 + imgPan.y);
      ctx.rotate((imgRotate * Math.PI) / 180);

      const drawW = imgNaturalWidth * fitScale * imgZoom;
      const drawH = imgNaturalHeight * fitScale * imgZoom;
      ctx.drawImage(activeImgElement, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Reset filter state
      ctx.filter = "none";

      // Sharpness boost
      const appliedSharp = autoEnhance ? 20 : sharpness;
      if (appliedSharp > 0) {
        sharpenCanvas(canvas, appliedSharp);
      }

      // Whitening / document cleaning pixel processing
      if (cleanBg) {
        const imgData = ctx.getImageData(0, 0, sliceW, sliceH);
        const pixels = imgData.data;
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const val = 0.299 * r + 0.587 * g + 0.114 * b;

          if (val > 195) {
            pixels[i] = 255;
            pixels[i + 1] = 255;
            pixels[i + 2] = 255;
          } else {
            // Enhance dark text contrast
            pixels[i] = Math.max(0, r * 0.95 - 12);
            pixels[i + 1] = Math.max(0, g * 0.95 - 12);
            pixels[i + 2] = Math.max(0, b * 0.95 - 12);
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Save output data
      let finalUrl = "";
      if (format === "png") {
        finalUrl = canvas.toDataURL("image/png");
        setDownloadSizeInfo(formatBytes(Math.round((finalUrl.length - 814) * 0.75)));
      } else {
        if (targetKbMode === "custom") {
          finalUrl = await compressToKbLimit(canvas, targetKb);
        } else {
          finalUrl = canvas.toDataURL("image/jpeg", 0.92);
        }
        setDownloadSizeInfo(formatBytes(Math.round((finalUrl.length - 814) * 0.75)));
      }

      setPreviewPhotoUrl(finalUrl);
    } catch (err) {
      console.error("Canvas compiler export error:", err);
    }
  }, [
    activeImgElement,
    cropX,
    cropY,
    cropW,
    cropH,
    fitScale,
    imgZoom,
    imgPan,
    imgRotate,
    imgNaturalWidth,
    imgNaturalHeight,
    brightness,
    contrast,
    sharpness,
    cleanBg,
    autoEnhance,
    format,
    targetKbMode,
    targetKb
  ]);

  // Debounced rendering loops
  useEffect(() => {
    if (step === "editor" && activeImgElement) {
      const timeout = setTimeout(() => {
        compileExportImage();
      }, 60);
      return () => clearTimeout(timeout);
    }
  }, [
    step,
    activeImgElement,
    cropX,
    cropY,
    cropW,
    cropH,
    imgZoom,
    imgPan,
    imgRotate,
    brightness,
    contrast,
    sharpness,
    cleanBg,
    autoEnhance,
    format,
    targetKbMode,
    targetKb,
    compileExportImage
  ]);

  // Handle image assets upload
  const loadSourceImage = (file: File) => {
    setStep("processing");
    setLoadingText("Importing document cache...");
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const url = URL.createObjectURL(file);
        setOriginalImgUrl(url);

        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        setActiveImgElement(img);
        setStep("editor");
        toast.success("Document loaded successfully.");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load document formatting details.");
        setStep("upload");
      }
    };
    reader.readAsDataURL(file);
  };

  // Convert loaded PDF Page to Image
  const renderPdfPageToImage = async (doc: any, pageNum: number) => {
    try {
      setLoadingText(`Rendering page ${pageNum}...`);
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // High-DPI layout scale

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;

        const url = canvas.toDataURL("image/jpeg", 0.95);
        setOriginalImgUrl(url);

        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = url;
        });

        setActiveImgElement(img);
        setStep("editor");
        toast.success(`PDF Page ${pageNum} rendered.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to compile PDF layout page.");
      setStep("upload");
    }
  };

  // Handle PDF documents load
  const loadSourcePdf = (file: File) => {
    if (!pdfjs) {
      toast.error("Preview engine initializing. Drop file again.");
      return;
    }

    setStep("processing");
    setLoadingText("Opening secure PDF stream...");
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);

        const loadingTask = pdfjs.getDocument({ data: bytes });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setPdfPagesCount(doc.numPages);
        setPdfCurrentPage(1);

        // Pre-render pages previews
        const previews: string[] = [];
        for (let i = 1; i <= Math.min(doc.numPages, 4); i++) {
          const page = await doc.getPage(i);
          const vp = page.getViewport({ scale: 0.15 });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport: vp }).promise;
            previews.push(canvas.toDataURL("image/jpeg", 0.7));
          }
        }
        setPdfPreviews(previews);

        await renderPdfPageToImage(doc, 1);
      } catch (err) {
        console.error(err);
        toast.error("Secure PDF parsing failed.");
        setStep("upload");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        loadSourcePdf(file);
      } else if (file.type.startsWith("image/")) {
        loadSourceImage(file);
      } else {
        toast.error("Supports JPG, PNG, WEBP, or PDF files only.");
      }
    }
  };

  const switchPdfPage = async (pageNum: number) => {
    if (!pdfDoc) return;
    setPdfCurrentPage(pageNum);
    setStep("processing");
    await renderPdfPageToImage(pdfDoc, pageNum);
  };

  // Pointer interactions logic
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!workspaceRef.current) return;

    const target = e.target as HTMLElement;
    const handle = target.getAttribute("data-handle");

    const rect = workspaceRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    startPointer.current = { x: relX, y: relY };
    startCrop.current = { x: cropX, y: cropY, w: cropW, h: cropH };
    startPan.current = { x: imgPan.x, y: imgPan.y };

    if (handle) {
      dragType.current = handle;
      setIsDragging(true);
    } else {
      const inside = relX >= cropX && relX <= cropX + cropW && relY >= cropY && relY <= cropY + cropH;
      dragType.current = inside ? "move-crop" : "move-img";
      setIsDragging(true);
    }

    if ("touches" in e && e.touches.length === 2) {
      dragType.current = null;
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      zoomStart.current = imgZoom;
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!workspaceRef.current) return;

    if ("touches" in e && e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStartDist.current;
      setImgZoom(Math.max(0.1, Math.min(10.0, zoomStart.current * scale)));
      return;
    }

    if (!dragType.current) return;

    const rect = workspaceRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const dx = relX - startPointer.current.x;
    const dy = relY - startPointer.current.y;

    if (dragType.current === "move-crop") {
      let newX = startCrop.current.x + dx;
      let newY = startCrop.current.y + dy;

      newX = Math.max(5, Math.min(workW - startCrop.current.w - 5, newX));
      newY = Math.max(5, Math.min(workH - startCrop.current.h - 5, newY));

      setCropX(newX);
      setCropY(newY);
    } else if (dragType.current === "move-img") {
      setImgPan({
        x: startPan.current.x + dx,
        y: startPan.current.y + dy
      });
    } else {
      const { x: sx, y: sy, w: sw, h: sh } = startCrop.current;
      let x = sx;
      let y = sy;
      let w = sw;
      let h = sh;

      // Freeform Resizing
      if (dragType.current === "resize-r" || dragType.current === "resize-tr" || dragType.current === "resize-br") {
        w = Math.max(30, Math.min(workW - sx - 5, sw + dx));
      }
      if (dragType.current === "resize-l" || dragType.current === "resize-tl" || dragType.current === "resize-bl") {
        const maxX = sx + sw - 30;
        x = Math.max(5, Math.min(maxX, sx + dx));
        w = sx + sw - x;
      }
      if (dragType.current === "resize-b" || dragType.current === "resize-bl" || dragType.current === "resize-br") {
        h = Math.max(30, Math.min(workH - sy - 5, sh + dy));
      }
      if (dragType.current === "resize-t" || dragType.current === "resize-tl" || dragType.current === "resize-tr") {
        const maxY = sy + sh - 30;
        y = Math.max(5, Math.min(maxY, sy + dy));
        h = sy + sh - y;
      }

      setCropX(x);
      setCropY(y);
      setCropW(w);
      setCropH(h);
    }
  };

  const handlePointerUp = () => {
    dragType.current = null;
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = 1.05;
    if (e.deltaY < 0) {
      setImgZoom(Math.min(10.0, imgZoom * factor));
    } else {
      setImgZoom(Math.max(0.1, imgZoom / factor));
    }
  };

  // Compile download actions
  const handleDownload = () => {
    if (!previewPhotoUrl || !uploadedFile) return;
    const rawName = uploadedFile.name.replace(/\.[^/.]+$/, "");

    if (format === "pdf") {
      const pdf = new jsPDF({
        orientation: cropW > cropH ? "l" : "p",
        unit: "px",
        format: [cropW, cropH]
      });
      pdf.addImage(previewPhotoUrl, "JPEG", 0, 0, cropW, cropH);
      pdf.save(`${rawName}_crop.pdf`);
      toast.success("Cropped invoice PDF exported.");
    } else {
      const a = document.createElement("a");
      a.href = previewPhotoUrl;
      a.download = `${rawName}_crop.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Cropped invoice ${format.toUpperCase()} exported.`);
    }
  };

  const handleResetAll = () => {
    setStep("upload");
    setUploadedFile(null);
    setOriginalImgUrl(null);
    setActiveImgElement(null);
    setPdfDoc(null);
    setPdfPreviews([]);
    setPreviewPhotoUrl(null);
    setBrightness(100);
    setContrast(100);
    setSharpness(0);
    setCleanBg(true);
    setAutoEnhance(false);
    setImgZoom(1.0);
    setImgPan({ x: 0, y: 0 });
    setImgRotate(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      {step === "upload" ? (
        /* Upload Area */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-[2.5rem] p-16 sm:p-24 text-center hover:bg-white/[0.02] transition-all cursor-pointer overflow-hidden bg-white/[0.01]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg, image/png, image/webp, application/pdf"
            className="hidden"
          />
          {/* Neon Glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="mx-auto h-24 w-24 text-blue-500 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">
              Drop invoice photo or PDF
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium text-sm leading-relaxed">
              Supports PDF documents, JPG, PNG, and WebP files. Analyzes page bounds completely client-side for maximum security.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              Select Document File
            </div>
          </div>
        </div>
      ) : step === "processing" ? (
        /* Loader screen */
        <div className="min-h-[450px] flex items-center justify-center glass rounded-[2.5rem] border border-white/5 bg-black/40">
          <div className="flex flex-col items-center max-w-xs text-center px-4">
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full blur-3xl bg-blue-500 opacity-20 animate-pulse" />
              <div className="relative bg-[#030712] p-6.5 rounded-full border border-white/10 shadow-2xl">
                <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h3 className="text-xl font-black text-white mb-2 tracking-tight uppercase">
              {loadingText}
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              100% Client Managed • Local sandboxed compilation
            </p>
          </div>
        </div>
      ) : (
        /* Workspace Editor */
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar / Left Section */}
          <div className="w-full lg:w-[28%] space-y-6">
            {/* File Info */}
            <div className="glass p-5 rounded-[2rem] border border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  {uploadedFile?.name.toLowerCase().endsWith(".pdf") ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <FileImage className="w-5 h-5" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-black text-white truncate uppercase tracking-tight">
                    {uploadedFile?.name}
                  </h4>
                  <p className="text-[9px] text-gray-500 font-black tracking-widest mt-0.5">
                    {uploadedFile && formatBytes(uploadedFile.size)}
                  </p>
                </div>
              </div>
            </div>

            {/* PDF page switcher if PDF doc */}
            {pdfDoc && pdfPagesCount > 1 && (
              <div className="glass p-5 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-3">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block ml-1">
                  PDF Page selection ({pdfPagesCount} pages)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: Math.min(pdfPagesCount, 8) }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const previewUrl = pdfPreviews[idx];
                    return (
                      <button
                        key={idx}
                        onClick={() => switchPdfPage(pageNum)}
                        className={`aspect-[3/4] rounded-lg overflow-hidden border transition-all flex flex-col justify-between items-center p-1 cursor-pointer bg-black/40 ${
                          pdfCurrentPage === pageNum
                            ? "border-blue-500 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                            : "border-white/5 hover:border-white/10"
                        }`}
                      >
                        {previewUrl ? (
                          <img src={previewUrl} className="w-full h-[75%] object-cover rounded-md" alt={`P${pageNum}`} />
                        ) : (
                          <div className="h-[75%] flex items-center justify-center text-gray-600">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                        <span className="text-[8px] font-black text-gray-400">P{pageNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Smart Detection Deck */}
            <div className="glass p-5 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-4">
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Smart Edge Detection
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 leading-normal font-semibold">
                  Intelligently scans document boundaries and aligns cropping margins.
                </span>
              </div>
              <button
                onClick={executeAutoEdgeScan}
                disabled={isScanning}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.25)] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isScanning ? "Scanning..." : "Auto Detect Bounds"}
              </button>
            </div>

            {/* Clean filter toggle */}
            <div className="glass p-5 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Clean Background
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5 leading-normal font-semibold">
                    Whiten scanning shadows and boost text legibility.
                  </span>
                </div>
                <button
                  onClick={() => setCleanBg(prev => !prev)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    cleanBg ? "bg-blue-600" : "bg-gray-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      cleanBg ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Editor Component / Middle Section */}
          <div className="w-full lg:w-[44%] space-y-6">
            <div className="glass p-5 rounded-[2.5rem] border border-white/5 bg-white/[0.01] flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4 px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-1.5 select-none">
                  <Crop className="w-3.5 h-3.5" /> Cropping Area
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 rounded-xl transition-all cursor-pointer"
                    title="Reset parameters"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Viewport Box wrapper */}
              <div
                ref={workspaceRef}
                className="w-[500px] h-[400px] rounded-2xl bg-black/85 relative overflow-hidden select-none border border-white/5 shadow-2xl cursor-grab active:cursor-grabbing max-w-full flex-shrink-0"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #050812 25%, transparent 25%), linear-gradient(-45deg, #050812 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #050812 75%), linear-gradient(-45deg, transparent 75%, #050812 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
                }}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                onWheel={handleWheel}
              >
                {/* 1. Underlying image scaled and transformed */}
                {originalImgUrl && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      width: imgNaturalWidth,
                      height: imgNaturalHeight,
                      left: 250 - imgNaturalWidth / 2,
                      top: 200 - imgNaturalHeight / 2,
                      transform: `translate(${imgPan.x}px, ${imgPan.y}px) scale(${
                        fitScale * imgZoom
                      }) rotate(${imgRotate}deg)`,
                      transformOrigin: "center center",
                      transition: isDragging ? "none" : "transform 0.05s ease-out"
                    }}
                  >
                    <img
                      src={activeImgElement?.src || originalImgUrl}
                      alt="Workspace Canvas"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* 2. Shading masks */}
                <div
                  className="absolute bg-black/65 top-0 left-0 w-full pointer-events-none"
                  style={{ height: cropY }}
                />
                <div
                  className="absolute bg-black/65 left-0 w-full pointer-events-none"
                  style={{ top: cropY + cropH, height: Math.max(0, workH - (cropY + cropH)) }}
                />
                <div
                  className="absolute bg-black/65 left-0 pointer-events-none"
                  style={{ top: cropY, height: cropH, width: cropX }}
                />
                <div
                  className="absolute bg-black/65 pointer-events-none"
                  style={{ top: cropY, height: cropH, left: cropX + cropW, width: Math.max(0, workW - (cropX + cropW)) }}
                />

                {/* 3. Laser Scanner Line Animation during detection */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.div
                      initial={{ top: 0 }}
                      animate={{ top: "100%" }}
                      exit={{ opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* 4. Crop Box overlay */}
                <div
                  className="absolute border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  style={{
                    left: cropX,
                    top: cropY,
                    width: cropW,
                    height: cropH,
                    transition: isDragging ? "none" : "all 0.12s cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                >
                  {/* Grid layout */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-white" />
                    <div className="border-r border-white" />
                    <div />
                  </div>

                  {/* Corner handles */}
                  <div
                    data-handle="resize-tl"
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize rounded-sm hover:scale-125 z-20 transition-transform"
                  />
                  <div
                    data-handle="resize-tr"
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white cursor-nesw-resize rounded-sm hover:scale-125 z-20 transition-transform"
                  />
                  <div
                    data-handle="resize-bl"
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white cursor-nesw-resize rounded-sm hover:scale-125 z-20 transition-transform"
                  />
                  <div
                    data-handle="resize-br"
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize rounded-sm hover:scale-125 z-20 transition-transform"
                  />

                  {/* Edge handles */}
                  <div
                    data-handle="resize-t"
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-2 bg-blue-500 border border-white rounded-full cursor-ns-resize z-20"
                  />
                  <div
                    data-handle="resize-b"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-2 bg-blue-500 border border-white rounded-full cursor-ns-resize z-20"
                  />
                  <div
                    data-handle="resize-l"
                    className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2 h-8 bg-blue-500 border border-white rounded-full cursor-ew-resize z-20"
                  />
                  <div
                    data-handle="resize-r"
                    className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2 h-8 bg-blue-500 border border-white rounded-full cursor-ew-resize z-20"
                  />
                </div>
              </div>

              <div className="w-full flex justify-between text-[8px] text-gray-500 font-bold px-1 mt-3 uppercase tracking-wider select-none">
                <span>Drag box handles to resize crop overlay</span>
                <span>Pinch/wheel to zoom • Drag background to pan</span>
              </div>
            </div>

            {/* Adjustments Panel */}
            <div className="glass p-5 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Adjustment Console</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Zoom */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase">
                    <span>Zoom</span>
                    <span className="font-mono text-blue-400">{imgZoom.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="5.0"
                    step="0.05"
                    value={imgZoom}
                    onChange={(e) => setImgZoom(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase">
                    <span>Rotate</span>
                    <span className="font-mono text-blue-400">{imgRotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={imgRotate}
                    onChange={(e) => setImgRotate(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Export Settings Panel / Right Section */}
          <div className="w-full lg:w-[28%] space-y-6">
            {/* Live Cropped Export Preview */}
            <div className="glass p-5 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4 select-none">
                Export Preview
              </span>

              <div
                className="w-40 border border-white/5 rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center p-1.5 relative shadow-inner"
                style={{ aspectRatio: `${cropW / cropH}` }}
              >
                {previewPhotoUrl && (
                  <img
                    src={previewPhotoUrl}
                    alt="Export Slice"
                    className="max-w-full max-h-full object-contain rounded-lg relative z-10 border border-white/5 shadow-2xl"
                  />
                )}
              </div>

              <div className="mt-4 text-center space-y-1 select-none">
                <div className="text-[10px] font-black text-gray-300 uppercase">
                  {Math.round(cropW / fitScale)} x {Math.round(cropH / fitScale)} Pixels
                </div>
                {downloadSizeInfo && (
                  <div className="text-[9px] font-mono font-black text-blue-400">
                    Est. Size: {downloadSizeInfo}
                  </div>
                )}
              </div>
            </div>

            {/* Quality & Exports configuration options */}
            <div className="glass p-5 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <FileCheck className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Compiler settings</h3>
              </div>

              {/* Format selection */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block ml-1">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-black/35 border border-white/5 p-1 rounded-xl">
                  {(["pdf", "jpg", "png"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        format === fmt
                          ? "bg-white/5 text-white shadow-md"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality details / Filters */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Text Contrast Boost
                  </label>
                  <button
                    onClick={() => setAutoEnhance((prev) => !prev)}
                    className={`text-[9px] font-black uppercase tracking-widest border px-2.5 py-0.5 rounded-lg transition-all ${
                      autoEnhance
                        ? "bg-blue-600 text-white border-blue-500 shadow-md"
                        : "bg-white/5 text-gray-400 border-white/5 hover:text-white"
                    }`}
                  >
                    Auto
                  </button>
                </div>

                <div className={`space-y-3.5 ${autoEnhance ? "opacity-30 pointer-events-none" : ""}`}>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase">
                      <span>Brightness</span>
                      <span className="font-mono text-blue-400">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="130"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase">
                      <span>Contrast</span>
                      <span className="font-mono text-blue-400">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="130"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exporter triggers */}
      {step === "editor" && (
        <div className="glass p-6 rounded-[2.5rem] border border-white/5 bg-white/[0.01] mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Check className="w-4 h-4 stroke-[3.5]" />
            </div>
            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">
              Processing in Sandbox Memory • Ready for export
            </span>
          </div>

          <div className="flex gap-3.5 w-full sm:w-auto">
            <button
              onClick={handleResetAll}
              className="flex-1 sm:flex-initial px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5 cursor-pointer"
            >
              Clear Workspace
            </button>
            <button
              onClick={handleDownload}
              className="flex-1.5 sm:flex-initial px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)] cursor-pointer"
            >
              Export & Download Document
            </button>
          </div>
        </div>
      )}

      {/* Article content insertion */}
      {seoArticle}
    </div>
  );
}

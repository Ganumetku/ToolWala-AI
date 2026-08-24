"use client";

// ImageCropperEngine: Component handling image crop and adjustments
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  Crop,
  RefreshCw,
  Sliders,
  AlertCircle,
  Palette,
  Maximize2,
  SlidersHorizontal,
  UserCheck,
  Check,
  FileImage,
  Sparkles,
  Lock,
  Unlock,
  Layers,
  RotateCw,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils/format";
import ImageUploadPlaceholder from "./ImageUploadPlaceholder";

// Sharpening helper on canvas context
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

// Helper to compress canvas to JPEG below target KB size using multi-pass quality & resolution scaling
const compressToKbLimit = (
  canvas: HTMLCanvasElement,
  targetKb: number
): Promise<string> => {
  return new Promise((resolve) => {
    const targetBytes = targetKb * 1024;

    const tryCompressCanvas = (
      c: HTMLCanvasElement
    ): Promise<{ dataUrl: string; size: number; qualityUsed: number } | null> => {
      return new Promise((res) => {
        let low = 0.15; // Maintain minimum 15% quality to prevent blocky artifacts
        let high = 0.98;
        let bestDataUrl = "";
        let bestSize = Infinity;
        let bestQuality = 0;
        let iterations = 0;

        const run = () => {
          if (iterations >= 8 || low > high) {
            if (bestDataUrl) {
              res({ dataUrl: bestDataUrl, size: bestSize, qualityUsed: bestQuality });
            } else {
              res(null);
            }
            return;
          }
          iterations++;
          const mid = (low + high) / 2;
          c.toBlob(
            (blob) => {
              if (!blob) {
                res(null);
                return;
              }
              if (blob.size <= targetBytes) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  bestDataUrl = reader.result as string;
                  bestSize = blob.size;
                  bestQuality = mid;
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

    // First attempt: Compress at 100% canvas resolution
    tryCompressCanvas(canvas).then(async (result) => {
      if (result && result.qualityUsed >= 0.35) {
        // High visual quality achieved at full resolution
        resolve(result.dataUrl);
        return;
      }

      // If full resolution requires low quality (< 35%), scale down canvas resolution slightly
      // so quality stays crisp (60-90%) without visual artifacts or blur
      let bestAttempt = result;

      for (const scale of [0.85, 0.70, 0.55]) {
        const scaledCanvas = document.createElement("canvas");
        scaledCanvas.width = Math.max(100, Math.round(canvas.width * scale));
        scaledCanvas.height = Math.max(100, Math.round(canvas.height * scale));
        const ctx = scaledCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
          ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
        }

        const res = await tryCompressCanvas(scaledCanvas);
        if (res && res.size <= targetBytes) {
          bestAttempt = res;
          if (res.qualityUsed >= 0.45) break; // High quality threshold achieved!
        }
      }

      if (bestAttempt) {
        resolve(bestAttempt.dataUrl);
      } else {
        // Safe fallback
        resolve(canvas.toDataURL("image/jpeg", 0.5));
      }
    });
  });
};

const orderPoints = (pts: { x: number; y: number }[]) => {
  const sum = pts.map((p) => p.x + p.y);
  const diff = pts.map((p) => p.x - p.y);

  const tl = pts[sum.indexOf(Math.min(...sum))];
  const br = pts[sum.indexOf(Math.max(...sum))];
  const tr = pts[diff.indexOf(Math.max(...diff))];
  const bl = pts[diff.indexOf(Math.min(...diff))];

  return { tl, tr, br, bl };
};

const detectAndWarpAadhaar = async (
  imgElement: HTMLImageElement,
  cv: any
): Promise<string> => {
  // Downscale for faster processing
  const maxDim = 800;
  const origW = imgElement.naturalWidth || imgElement.width;
  const origH = imgElement.naturalHeight || imgElement.height;

  let scale = 1;
  let dstW = origW;
  let dstH = origH;
  if (origW > maxDim || origH > maxDim) {
    if (origW > origH) {
      scale = origW / maxDim;
      dstW = maxDim;
      dstH = Math.round(origH / scale);
    } else {
      scale = origH / maxDim;
      dstH = maxDim;
      dstW = Math.round(origW / scale);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = dstW;
  canvas.height = dstH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2d context for downscaled canvas");
  ctx.drawImage(imgElement, 0, 0, dstW, dstH);

  let src: any = null;
  let gray: any = null;
  let blurred: any = null;
  let edges: any = null;
  let dilated: any = null;
  let contours: any = null;
  let hierarchy: any = null;
  let M_dilate: any = null;
  let docContour: any = null;

  let srcOrig: any = null;
  let srcTri: any = null;
  let dstTri: any = null;
  let M: any = null;
  let warped: any = null;
  let cropped: any = null;

  try {
    src = cv.imread(canvas);
    gray = new cv.Mat();
    blurred = new cv.Mat();
    edges = new cv.Mat();

    // Grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Blur to reduce noise
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

    // Canny edge detection
    cv.Canny(blurred, edges, 75, 200);

    // Dilation to join gaps in edges
    M_dilate = cv.Mat.ones(3, 3, cv.CV_8U);
    dilated = new cv.Mat();
    cv.dilate(edges, dilated, M_dilate);

    // Find contours
    contours = new cv.MatVector();
    hierarchy = new cv.Mat();
    cv.findContours(
      dilated,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    let maxArea = 0;
    const minArea = dstW * dstH * 0.05; // 5% of total area

    // Step 1: Search for the largest 4-point contour
    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const area = cv.contourArea(cnt);
      if (area < minArea) continue;

      const perimeter = cv.arcLength(cnt, true);
      const approx = new cv.Mat();
      cv.approxPolyDP(cnt, approx, 0.02 * perimeter, true);

      if (approx.rows === 4 && area > maxArea) {
        if (docContour) docContour.delete();
        docContour = approx;
        maxArea = area;
      } else {
        approx.delete();
      }
    }

    let warpedUrl: string | null = null;

    if (docContour) {
      // Extract points
      const points = [];
      for (let i = 0; i < 4; i++) {
        points.push({
          x: docContour.data32S[i * 2],
          y: docContour.data32S[i * 2 + 1],
        });
      }

      // Scale points back to high-res coordinates
      const scaledPoints = points.map((p) => ({
        x: p.x * scale,
        y: p.y * scale,
      }));

      const ordered = orderPoints(scaledPoints);

      // Math helper for distance
      const dist = (p1: { x: number; y: number }, p2: { x: number; y: number }) =>
        Math.hypot(p1.x - p2.x, p1.y - p2.y);

      const w1 = dist(ordered.br, ordered.bl);
      const w2 = dist(ordered.tr, ordered.tl);
      const targetW = Math.max(w1, w2);

      const h1 = dist(ordered.br, ordered.tr);
      const h2 = dist(ordered.bl, ordered.tl);
      const targetH = Math.max(h1, h2);

      // Perspective Transform on the original high-resolution image
      srcOrig = cv.imread(imgElement);

      srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        ordered.tl.x, ordered.tl.y,
        ordered.tr.x, ordered.tr.y,
        ordered.br.x, ordered.br.y,
        ordered.bl.x, ordered.bl.y,
      ]);

      dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        targetW, 0,
        targetW, targetH,
        0, targetH,
      ]);

      M = cv.getPerspectiveTransform(srcTri, dstTri);
      warped = new cv.Mat();
      cv.warpPerspective(srcOrig, warped, M, new cv.Size(targetW, targetH));

      const warpedCanvas = document.createElement("canvas");
      warpedCanvas.width = targetW;
      warpedCanvas.height = targetH;
      cv.imshow(warpedCanvas, warped);
      warpedUrl = warpedCanvas.toDataURL("image/jpeg", 0.95);
    } else {
      // Fallback 1: Find the largest contour and crop its bounding rectangle
      let largestContour: any = null;
      let maxAreaB = 0;

      for (let i = 0; i < contours.size(); i++) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt);
        if (area > maxAreaB && area > minArea) {
          largestContour = cnt;
          maxAreaB = area;
        }
      }

      if (largestContour) {
        const rect = cv.boundingRect(largestContour);
        const rx = rect.x * scale;
        const ry = rect.y * scale;
        const rw = rect.width * scale;
        const rh = rect.height * scale;

        srcOrig = cv.imread(imgElement);

        // Ensure bounding box fits inside original image boundaries
        const origWidth = imgElement.naturalWidth || imgElement.width;
        const origHeight = imgElement.naturalHeight || imgElement.height;
        const safeX = Math.max(0, Math.min(origWidth - 1, rx));
        const safeY = Math.max(0, Math.min(origHeight - 1, ry));
        const safeW = Math.max(1, Math.min(origWidth - safeX, rw));
        const safeH = Math.max(1, Math.min(origHeight - safeY, rh));

        const rectOrig = new cv.Rect(safeX, safeY, safeW, safeH);
        cropped = srcOrig.roi(rectOrig);

        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = safeW;
        cropCanvas.height = safeH;
        cv.imshow(cropCanvas, cropped);
        warpedUrl = cropCanvas.toDataURL("image/jpeg", 0.95);
      }
    }

    if (!warpedUrl) {
      throw new Error("No clear card shape detected");
    }

    return warpedUrl;
  } finally {
    // Prevent Memory Leaks in WebAssembly heap
    if (src) src.delete();
    if (gray) gray.delete();
    if (blurred) blurred.delete();
    if (edges) edges.delete();
    if (dilated) dilated.delete();
    if (contours) contours.delete();
    if (hierarchy) hierarchy.delete();
    if (M_dilate) M_dilate.delete();
    if (docContour) docContour.delete();

    if (srcOrig) srcOrig.delete();
    if (srcTri) srcTri.delete();
    if (dstTri) dstTri.delete();
    if (M) M.delete();
    if (warped) warped.delete();
    if (cropped) cropped.delete();
  }
};

export interface CropperPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  targetKb: number;
  allowBgRemoval: boolean;
  allowPrintSheet?: boolean;
  bgColors: { name: string; hex: string }[];
  description: string;
  specs: string;
}

interface ImageCropperEngineProps {
  toolSlug: string;
  title: string;
  description: string;
  presets: CropperPreset[];
  defaultPresetIndex?: number;
  seoArticle?: React.ReactNode;
}

export default function ImageCropperEngine({
  toolSlug,
  title,
  description,
  presets,
  defaultPresetIndex = 0,
  seoArticle,
}: ImageCropperEngineProps) {
  const [activePreset, setActivePreset] = useState<CropperPreset>(
    presets[defaultPresetIndex] || presets[0]
  );
  const [step, setStep] = useState<"upload" | "processing" | "editor">("upload");
  const [loadingText, setLoadingText] = useState("");

  // Image assets states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalImgUrl, setOriginalImgUrl] = useState<string | null>(null);
  const [bgRemovedImgUrl, setBgRemovedImgUrl] = useState<string | null>(null);
  const [activeImgElement, setActiveImgElement] = useState<HTMLImageElement | null>(null);
  const [hasBgError, setHasBgError] = useState(false);

  // Aadhaar auto-crop states
  const [cvInstance, setCvInstance] = useState<any>(null);
  const [cvLoading, setCvLoading] = useState<boolean>(false);
  const [cropMode, setCropMode] = useState<"auto" | "manual">("manual");
  const [autoCroppedImgUrl, setAutoCroppedImgUrl] = useState<string | null>(null);

  // Config States
  const [selectedBgHex, setSelectedBgHex] = useState(
    presets[defaultPresetIndex]?.bgColors[0]?.hex || "#ffffff"
  );
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [targetKbMode, setTargetKbMode] = useState<"preset" | "custom">("preset");
  const [customTargetKb, setCustomTargetKb] = useState<number>(
    presets[defaultPresetIndex]?.targetKb || 50
  );
  const [downloadSizeInfo, setDownloadSizeInfo] = useState<string>("");

  // Enhancements
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [sharpness, setSharpness] = useState<number>(0);
  const [autoEnhance, setAutoEnhance] = useState<boolean>(false);

  // Image Transforms
  const [imgZoom, setImgZoom] = useState(1.0);
  const [imgPan, setImgPan] = useState({ x: 0, y: 0 });
  const [imgRotate, setImgRotate] = useState(0);

  // Crop Box state relative to the editor workspace (500x400)
  const workW = 500;
  const workH = 400;
  const [cropX, setCropX] = useState(100);
  const [cropY, setCropY] = useState(50);
  const [cropW, setCropW] = useState(300);
  const [cropH, setCropH] = useState(300);
  const [isLocked, setIsLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Background removal options
  const [aiBgCleanup, setAiBgCleanup] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // Live output data URL
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<"4x4" | "6x6" | "8x8" | null>(null);
  const [previewSheetUrl, setPreviewSheetUrl] = useState<string | null>(null);

  const handleReset = () => {
    setImgZoom(1.0);
    setImgPan({ x: 0, y: 0 });
    setImgRotate(0);
    initCropBox(activePreset);
    toast.success("Crop settings reset.");
  };

  // Dragging and touch resizing refs
  const dragType = useRef<
    | "move-crop"
    | "resize-tl"
    | "resize-tr"
    | "resize-bl"
    | "resize-br"
    | "resize-t"
    | "resize-b"
    | "resize-l"
    | "resize-r"
    | "move-img"
    | null
  >(null);

  const startPointer = useRef({ x: 0, y: 0 });
  const startCrop = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const startPan = useRef({ x: 0, y: 0 });
  const touchStartDist = useRef(0);
  const zoomStart = useRef(1.0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Fit scale calculation for loading image inside container
  const [fitScale, setFitScale] = useState(1.0);
  const [imgNaturalWidth, setImgNaturalWidth] = useState(600);
  const [imgNaturalHeight, setImgNaturalHeight] = useState(600);

  // Aspect ratio
  const aspectRatio = activePreset.width / activePreset.height;

  // Initialize and center crop box matching the aspect ratio
  const initCropBox = useCallback((preset: CropperPreset) => {
    const ratio = preset.width / preset.height;
    let w = 260;
    let h = 260 / ratio;

    if (h > 320) {
      h = 320;
      w = 320 * ratio;
    }

    setCropW(w);
    setCropH(h);
    setCropX((workW - w) / 2);
    setCropY((workH - h) / 2);
  }, []);

  // Sync preset changes
  useEffect(() => {
    setSelectedBgHex(activePreset.bgColors[0]?.hex || "#ffffff");
    setCustomTargetKb(activePreset.targetKb);
    setImgZoom(1.0);
    setImgPan({ x: 0, y: 0 });
    setImgRotate(0);
    initCropBox(activePreset);
  }, [activePreset, initCropBox]);

  // Preload OpenCV.js
  useEffect(() => {
    if (toolSlug === "aadhaar-photo-resizer" && !cvInstance && !cvLoading) {
      setCvLoading(true);
      const loadOpenCV = () => {
        return new Promise<any>((resolve, reject) => {
          if ((window as any).cv) {
            resolve((window as any).cv);
            return;
          }
          const script = document.createElement("script");
          script.src = "/opencv.js";
          script.async = true;
          script.onload = () => {
            const cvObj = (window as any).cv;
            if (cvObj.onRuntimeInitialized) {
              cvObj.onRuntimeInitialized = () => resolve(cvObj);
            } else {
              const interval = setInterval(() => {
                if ((window as any).cv && (window as any).cv.Mat) {
                  clearInterval(interval);
                  resolve((window as any).cv);
                }
              }, 100);
            }
          };
          script.onerror = () => reject(new Error("Failed to load OpenCV.js"));
          document.body.appendChild(script);
        });
      };

      loadOpenCV()
        .then((cvObj) => {
          setCvInstance(cvObj);
          setCvLoading(false);
          console.log("OpenCV.js loaded successfully");
        })
        .catch((err) => {
          console.error("OpenCV.js load error:", err);
          setCvLoading(false);
        });
    }
  }, [toolSlug, cvInstance, cvLoading]);

  // Load fit scale on image element change
  useEffect(() => {
    if (activeImgElement) {
      const nw = activeImgElement.naturalWidth || activeImgElement.width;
      const nh = activeImgElement.naturalHeight || activeImgElement.height;
      setImgNaturalWidth(nw);
      setImgNaturalHeight(nh);

      // Fit inside 500x400 workspace nicely
      const fs = Math.min((workW * 0.9) / nw, (workH * 0.9) / nh);
      setFitScale(fs);
    }
  }, [activeImgElement]);

  // On demand background cleaner
  const triggerBgCleanup = async (enable: boolean) => {
    setAiBgCleanup(enable);
    if (!enable) {
      if (originalImgUrl) {
        const img = new Image();
        img.onload = () => setActiveImgElement(img);
        img.src = originalImgUrl;
      }
      return;
    }

    if (bgRemovedImgUrl) {
      const img = new Image();
      img.onload = () => setActiveImgElement(img);
      img.src = bgRemovedImgUrl;
      return;
    }

    if (!uploadedFile) return;

    setIsRemovingBg(true);
    setLoadingText("Removing background locally...");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const publicPath = typeof window !== 'undefined' ? `${window.location.origin}/api/imgly/` : undefined;
      const bgRemovedBlob = await removeBackground(uploadedFile, { publicPath });
      const bgRemovedUrl = URL.createObjectURL(bgRemovedBlob);
      setBgRemovedImgUrl(bgRemovedUrl);

      const img = new Image();
      img.onload = () => setActiveImgElement(img);
      img.src = bgRemovedUrl;
      toast.success("AI Background Cleanup applied successfully.");
    } catch (err) {
      console.error("AI Background removal failed:", err);
      setHasBgError(true);
      setAiBgCleanup(false);
      toast.error("Background cleanup failed. Continuing with original photo.");
    } finally {
      setIsRemovingBg(false);
    }
  };

  // High-Resolution Export compilation using coordinate mapping
  const compileExportImage = useCallback(async () => {
    if (!activeImgElement) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W_exp = activePreset.width;
      const H_exp = activePreset.height;

      // Calculate dynamic export dimensions to match crop box aspect ratio exactly
      const exportW = W_exp;
      const exportH = isLocked ? H_exp : Math.round(W_exp * (cropH / cropW));

      canvas.width = exportW;
      canvas.height = exportH;

      // Apply background fills
      if (format === "png" && selectedBgHex === "transparent") {
        ctx.clearRect(0, 0, exportW, exportH);
      } else {
        ctx.fillStyle = selectedBgHex === "transparent" ? "#ffffff" : selectedBgHex;
        ctx.fillRect(0, 0, exportW, exportH);
      }

      // Apply filters
      const appliedBright = autoEnhance ? 106 : brightness;
      const appliedContrast = autoEnhance ? 104 : contrast;
      ctx.filter = `brightness(${appliedBright}%) contrast(${appliedContrast}%)`;

      // Draw crop box slice using transformations matrix mapping
      ctx.save();
      
      // Scale coordinates from UI workspace back to high-res export canvas
      const s = exportW / cropW;
      ctx.scale(s, s);
      ctx.translate(-cropX, -cropY);

      // Recreate exact image positioning seen in workspace
      ctx.translate(workW / 2 + imgPan.x, workH / 2 + imgPan.y);
      ctx.rotate((imgRotate * Math.PI) / 180);

      const drawW = imgNaturalWidth * fitScale * imgZoom;
      const drawH = imgNaturalHeight * fitScale * imgZoom;
      ctx.drawImage(activeImgElement, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.restore();

      // Sharpness boost
      const appliedSharp = autoEnhance ? 20 : sharpness;
      if (appliedSharp > 0) {
        sharpenCanvas(canvas, appliedSharp);
      }

      // Exact KB Sizing binary search loop
      let finalUrl = "";
      if (format === "png") {
        finalUrl = canvas.toDataURL("image/png");
        const approxBytes = Math.round((finalUrl.length - 814) * 0.75);
        setDownloadSizeInfo(formatBytes(approxBytes));
      } else {
        const targetLimit = targetKbMode === "preset" ? activePreset.targetKb : customTargetKb;
        finalUrl = await compressToKbLimit(canvas, targetLimit);
        const approxBytes = Math.round((finalUrl.length - 814) * 0.75);
        setDownloadSizeInfo(formatBytes(approxBytes));
      }

      setPreviewPhotoUrl(finalUrl);
    } catch (err) {
      console.error("Canvas export render error:", err);
    }
  }, [
    activeImgElement,
    activePreset,
    cropX,
    cropY,
    cropW,
    cropH,
    imgZoom,
    imgPan,
    imgRotate,
    format,
    selectedBgHex,
    autoEnhance,
    brightness,
    contrast,
    sharpness,
    imgNaturalWidth,
    imgNaturalHeight,
    fitScale,
    targetKbMode,
    customTargetKb,
  ]);

  const compilePrintSheet = useCallback((photoUrl: string, size: "4x4" | "6x6" | "8x8") => {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("");
          return;
        }

        let cols = 4;
        let rows = 4;
        if (size === "6x6") {
          cols = 6;
          rows = 6;
        } else if (size === "8x8") {
          cols = 8;
          rows = 8;
        }

        const photoW = activePreset.width;
        const photoH = isLocked ? activePreset.height : Math.round(activePreset.width * (cropH / cropW));
        const gap = 12; // gap in px

        const padding = 24;
        const canvasW = cols * photoW + (cols - 1) * gap + padding * 2;
        const canvasH = rows * photoH + (rows - 1) * gap + padding * 2;

        canvas.width = canvasW;
        canvas.height = canvasH;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasW, canvasH);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = padding + c * (photoW + gap);
            const y = padding + r * (photoH + gap);

            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 1;
            ctx.strokeRect(x - 1, y - 1, photoW + 2, photoH + 2);

            ctx.drawImage(img, x, y, photoW, photoH);
          }
        }

        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.src = photoUrl;
    });
  }, [activePreset, isLocked, cropW, cropH]);

  useEffect(() => {
    if (previewPhotoUrl && gridSize) {
      compilePrintSheet(previewPhotoUrl, gridSize).then((url) => {
        setPreviewSheetUrl(url);
      });
    } else {
      setPreviewSheetUrl(null);
    }
  }, [previewPhotoUrl, gridSize, compilePrintSheet]);

  // Render loop
  useEffect(() => {
    if (step === "editor" && activeImgElement) {
      const timeout = setTimeout(() => {
        compileExportImage();
      }, 50);
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
    format,
    selectedBgHex,
    brightness,
    contrast,
    sharpness,
    autoEnhance,
    compileExportImage,
  ]);

  // Initial upload handler
  const processUploadedImage = async (file: File) => {
    try {
      setStep("processing");
      setUploadedFile(file);
      setBgRemovedImgUrl(null);
      setAiBgCleanup(false);
      setHasBgError(false);

      const url = URL.createObjectURL(file);
      setOriginalImgUrl(url);

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      setImgZoom(1.0);
      setImgPan({ x: 0, y: 0 });
      setImgRotate(0);
      initCropBox(activePreset);

      if (toolSlug === "aadhaar-photo-resizer") {
        setLoadingText("Detecting Aadhaar card...");
        
        let cv = cvInstance;
        if (!cv) {
          setLoadingText("Initializing image processor (OpenCV)...");
          let checkCount = 0;
          while (!(window as any).cv || !(window as any).cv.Mat) {
            await new Promise((r) => setTimeout(r, 100));
            checkCount++;
            if (checkCount > 150) { // 15 seconds timeout
              break;
            }
          }
          cv = (window as any).cv;
        }

        if (cv && cv.Mat) {
          setLoadingText("Detecting document borders...");
          try {
            const warpedUrl = await detectAndWarpAadhaar(img, cv);
            setAutoCroppedImgUrl(warpedUrl);
            setCropMode("auto");

            const warpedImg = new Image();
            await new Promise((resolve, reject) => {
              warpedImg.onload = resolve;
              warpedImg.onerror = reject;
              warpedImg.src = warpedUrl;
            });
            setActiveImgElement(warpedImg);
            toast.success("Aadhaar card detected and cropped automatically!");
          } catch (detectErr) {
            console.warn("Aadhaar detection failed:", detectErr);
            toast.error("Couldn't detect the Aadhaar card clearly. Please adjust manually.");
            setCropMode("manual");
            setActiveImgElement(img);
          }
        } else {
          console.warn("OpenCV.js was not available");
          toast.error("Couldn't load image processor. Please adjust manually.");
          setCropMode("manual");
          setActiveImgElement(img);
        }
      } else {
        setLoadingText("Reading image credentials...");
        setActiveImgElement(img);
      }

      setStep("editor");
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse photo dimensions.");
      setStep("upload");
    }
  };

  const switchToAutoCrop = async () => {
    if (!autoCroppedImgUrl) {
      if (originalImgUrl) {
        setStep("processing");
        setLoadingText("Running auto detection...");
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = originalImgUrl;
          });

          const cv = cvInstance || (window as any).cv;
          if (cv && cv.Mat) {
            const warpedUrl = await detectAndWarpAadhaar(img, cv);
            setAutoCroppedImgUrl(warpedUrl);
            setCropMode("auto");

            const warpedImg = new Image();
            await new Promise((resolve, reject) => {
              warpedImg.onload = resolve;
              warpedImg.onerror = reject;
              warpedImg.src = warpedUrl;
            });
            setActiveImgElement(warpedImg);
            setImgZoom(1.0);
            setImgPan({ x: 0, y: 0 });
            setImgRotate(0);
            initCropBox(activePreset);
            toast.success("Aadhaar card detected and cropped automatically!");
          } else {
            toast.error("Image processor is not loaded yet.");
          }
        } catch (err) {
          console.warn("Aadhaar detection failed:", err);
          toast.error("Couldn't detect the Aadhaar card clearly. Please adjust manually.");
        } finally {
          setStep("editor");
        }
      }
      return;
    }

    setCropMode("auto");
    setStep("processing");
    setLoadingText("Loading cropped view...");
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = autoCroppedImgUrl;
      });
      setActiveImgElement(img);
      setImgZoom(1.0);
      setImgPan({ x: 0, y: 0 });
      setImgRotate(0);
      initCropBox(activePreset);
      toast.success("Switched to auto cropped Aadhaar view.");
    } catch (err) {
      toast.error("Failed to load auto cropped image.");
    } finally {
      setStep("editor");
    }
  };

  const switchToManualCrop = async () => {
    if (!originalImgUrl) return;

    setCropMode("manual");
    setStep("processing");
    setLoadingText("Loading manual adjustment view...");
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = originalImgUrl;
      });
      setActiveImgElement(img);
      setImgZoom(1.0);
      setImgPan({ x: 0, y: 0 });
      setImgRotate(0);
      initCropBox(activePreset);
      toast.success("Switched to original full image. You can adjust the crop manually.");
    } catch (err) {
      toast.error("Failed to load original image.");
    } finally {
      setStep("editor");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        processUploadedImage(file);
      } else {
        toast.error("Only image file formats are supported.");
      }
    }
  };

  // Click handler to determine what part of the crop tool is clicked
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!workspaceRef.current) return;
    
    // Stop event bubbling for nested handles, otherwise the canvas handles click propagation
    const target = e.target as HTMLElement;
    const handleType = target.getAttribute("data-handle") as any;

    const rect = workspaceRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    startPointer.current = { x: relX, y: relY };
    startCrop.current = { x: cropX, y: cropY, w: cropW, h: cropH };
    startPan.current = { x: imgPan.x, y: imgPan.y };

    if (handleType) {
      dragType.current = handleType;
      setIsDragging(true);
    } else {
      // Check if click was inside the crop box
      const inside = relX >= cropX && relX <= cropX + cropW && relY >= cropY && relY <= cropY + cropH;
      dragType.current = inside ? "move-crop" : "move-img";
      setIsDragging(true);
    }

    // Initialize pinch-zoom for mobile touch events
    if ("touches" in e && e.touches.length === 2) {
      dragType.current = null; // Disable standard drag
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      zoomStart.current = imgZoom;
    }
  };

  // Mouse move resize & move logic
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!workspaceRef.current || !dragType.current) {
      // Mobile pinch zoom check
      if ("touches" in e && e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = dist / touchStartDist.current;
        setImgZoom(Math.max(0.1, Math.min(10, zoomStart.current * scale)));
      }
      return;
    }

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
      
      // Restrict within boundary limits
      newX = Math.max(0, Math.min(workW - startCrop.current.w, newX));
      newY = Math.max(0, Math.min(workH - startCrop.current.h, newY));
      
      setCropX(newX);
      setCropY(newY);
    } else if (dragType.current === "move-img") {
      setImgPan({
        x: startPan.current.x + dx,
        y: startPan.current.y + dy,
      });
    } else {
      // Resize Handles Logic
      const { x: sx, y: sy, w: sw, h: sh } = startCrop.current;
      const rx = sx + sw;
      const by = sy + sh;
      const r = aspectRatio;

      let x = sx;
      let y = sy;
      let w = sw;
      let h = sh;

      if (!isLocked) {
        // --- FREEFORM RESIZING (UNLOCKED) ---
        // 1. Horizontal adjustments
        if (dragType.current === "resize-r" || dragType.current === "resize-tr" || dragType.current === "resize-br") {
          w = Math.max(30, Math.min(workW - sx, sw + dx));
        }
        if (dragType.current === "resize-l" || dragType.current === "resize-tl" || dragType.current === "resize-bl") {
          const maxX = sx + sw - 30;
          x = Math.max(0, Math.min(maxX, sx + dx));
          w = sx + sw - x;
        }
        // 2. Vertical adjustments
        if (dragType.current === "resize-b" || dragType.current === "resize-bl" || dragType.current === "resize-br") {
          h = Math.max(30, Math.min(workH - sy, sh + dy));
        }
        if (dragType.current === "resize-t" || dragType.current === "resize-tl" || dragType.current === "resize-tr") {
          const maxY = sy + sh - 30;
          y = Math.max(0, Math.min(maxY, sy + dy));
          h = sy + sh - y;
        }
      } else {
        // --- LOCKED ASPECT RATIO RESIZING ---
        switch (dragType.current) {
          case "resize-br": {
            // Top-left sx, sy is fixed
            const k = (dx * r + dy) / (r * r + 1);
            const limitW = Math.min(workW - sx, (workH - sy) * r);
            w = Math.max(30, Math.min(limitW, sw + k * r));
            h = w / r;
            x = sx;
            y = sy;
            break;
          }
          case "resize-bl": {
            // Top-right rx, sy is fixed
            const k = (-dx * r + dy) / (r * r + 1);
            const limitW = Math.min(rx, (workH - sy) * r);
            w = Math.max(30, Math.min(limitW, sw + k * r));
            h = w / r;
            x = rx - w;
            y = sy;
            break;
          }
          case "resize-tr": {
            // Bottom-left sx, by is fixed
            const k = (dx * r - dy) / (r * r + 1);
            const limitW = Math.min(workW - sx, by * r);
            w = Math.max(30, Math.min(limitW, sw + k * r));
            h = w / r;
            x = sx;
            y = by - h;
            break;
          }
          case "resize-tl": {
            // Bottom-right rx, by is fixed
            const k = (-dx * r - dy) / (r * r + 1);
            const limitW = Math.min(rx, by * r);
            w = Math.max(30, Math.min(limitW, sw + k * r));
            h = w / r;
            x = rx - w;
            y = by - h;
            break;
          }
          case "resize-r": {
            // Left sx is fixed, vertical center expands symmetrically
            const limitW = Math.min(workW - sx, workH * r);
            w = Math.max(30, Math.min(limitW, sw + dx));
            h = w / r;
            y = Math.max(0, Math.min(workH - h, sy - (h - sh) / 2));
            x = sx;
            break;
          }
          case "resize-l": {
            // Right rx is fixed, vertical center expands symmetrically
            const limitW = Math.min(rx, workH * r);
            w = Math.max(30, Math.min(limitW, sw - dx));
            h = w / r;
            y = Math.max(0, Math.min(workH - h, sy - (h - sh) / 2));
            x = rx - w;
            break;
          }
          case "resize-b": {
            // Top sy is fixed, horizontal center expands symmetrically
            const limitH = Math.min(workH - sy, workW / r);
            h = Math.max(30, Math.min(limitH, sh + dy));
            w = h * r;
            x = Math.max(0, Math.min(workW - w, sx - (w - sw) / 2));
            y = sy;
            break;
          }
          case "resize-t": {
            // Bottom by is fixed, horizontal center expands symmetrically
            const limitH = Math.min(by, workW / r);
            h = Math.max(30, Math.min(limitH, sh - dy));
            w = h * r;
            x = Math.max(0, Math.min(workW - w, sx - (w - sw) / 2));
            y = by - h;
            break;
          }
        }
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



  const handleDownload = () => {
    const downloadUrl = (gridSize && previewSheetUrl) ? previewSheetUrl : previewPhotoUrl;
    if (!downloadUrl || !uploadedFile) return;

    const a = document.createElement("a");
    a.href = downloadUrl;
    const suffix = gridSize ? `_sheet_${gridSize}` : `_crop`;
    a.download = `${uploadedFile.name.replace(/\.[^/.]+$/, "")}${suffix}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(gridSize ? `Passport sheet (${gridSize}) downloaded successfully!` : "Cropped photo exported successfully!");
  };

  const resetAll = () => {
    setStep("upload");
    setUploadedFile(null);
    setOriginalImgUrl(null);
    setBgRemovedImgUrl(null);
    setActiveImgElement(null);
    setPreviewPhotoUrl(null);
    setGridSize(null);
    setPreviewSheetUrl(null);
    setBrightness(100);
    setContrast(100);
    setSharpness(0);
    setAutoEnhance(false);
    setImgZoom(1.0);
    setImgPan({ x: 0, y: 0 });
    setImgRotate(0);
    setAutoCroppedImgUrl(null);
    setCropMode("manual");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      {step === "upload" ? (
        // UPLOAD COMPONENT
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
          />
          <ImageUploadPlaceholder 
            onClick={() => fileInputRef.current?.click()} 
            onDrop={(files) => {
              if (files && files[0]) {
                const dt = new DataTransfer();
                dt.items.add(files[0]);
                handleFileUpload({ target: { files: dt.files } } as any);
              }
            }}
          />
        </div>
      ) : step === "processing" || isRemovingBg ? (
        // LOADER
        <div className="min-h-[450px] flex items-center justify-center glass rounded-[2.5rem] border border-white/5 relative bg-black/40">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 w-2/3 animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
          </div>
          <div className="flex flex-col items-center max-w-sm text-center px-6">
            <div className="relative mb-10">
              <div className="absolute inset-0 rounded-full blur-3xl bg-blue-500 opacity-20 animate-pulse" />
              <div className="relative bg-[#030712] p-6.5 rounded-full shadow-2xl border border-white/10">
                <RefreshCw className="animate-spin h-10 w-10 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
              {loadingText}
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Compiling layouts and filters completely client-side.
            </p>
          </div>
        </div>
      ) : (
        // PROFESSIONAL WORKSPACE
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* 1. LEFT PANEL: ORIGINAL THUMBNAIL */}
          <div className="w-full xl:w-[15%] space-y-6 xl:sticky xl:top-28">
            <div className="glass p-5 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col items-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 mb-3">
                Source Image
              </span>
              <div className="w-full aspect-[4/5] shadow-2xl border border-white/5 rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center p-2">
                {originalImgUrl && (
                  <img
                    src={originalImgUrl}
                    alt="Original Context"
                    className="max-w-full max-h-full object-contain rounded-lg opacity-40"
                  />
                )}
              </div>
            </div>

            {/* Layout presets switcher */}
            {presets.length > 1 && (
              <div className="glass p-5 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-2.5">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Preset Dimensions
                </label>
                <div className="space-y-1.5">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setActivePreset(preset)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-[11px] font-black uppercase transition-all ${
                        activePreset.id === preset.id
                          ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/25"
                          : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. CENTER PANEL: DRAGGABLE CROP BOX EDITOR */}
          <div className="w-full xl:w-[50%] space-y-6">
            <div className="glass p-6 sm:p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] flex flex-col items-center">
              {/* Header inside workspace */}
              <div className="w-full flex items-center justify-between mb-4 px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-1.5">
                  <Crop className="w-3.5 h-3.5" /> Crop Canvas
                </span>

                <div className="flex gap-3 items-center">
                  {/* Aspect Lock Toggle */}
                  <button
                    onClick={() => setIsLocked((prev) => !prev)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[11px] font-black uppercase transition-all cursor-pointer ${
                      isLocked
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                        : "bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/[0.08]"
                    }`}
                    title={isLocked ? "Aspect Ratio Locked" : "Aspect Ratio Free"}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                      isLocked ? "bg-blue-500 border-blue-500 text-white" : "border-gray-600"
                    }`}>
                      {isLocked && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                    </div>
                    Lock Ratio
                  </button>
                  {/* Reset canvas button */}
                  <button
                    onClick={handleReset}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 rounded-xl transition-all cursor-pointer"
                    title="Reset Coordinates"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Aadhaar Scanner Controls Toolbar */}
              {toolSlug === "aadhaar-photo-resizer" && (
                <div className="w-full flex flex-wrap justify-center gap-2.5 mb-5 border-t border-b border-white/5 py-4 px-2">
                  <button
                    type="button"
                    onClick={switchToAutoCrop}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      cropMode === "auto"
                        ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/25"
                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto Crop
                  </button>
                  <button
                    type="button"
                    onClick={switchToManualCrop}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      cropMode === "manual"
                        ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/25"
                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <Crop className="w-3.5 h-3.5" />
                    Manual Adjust
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-500/25"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              )}

              {/* Main Crop Viewport wrapper */}
              <div
                ref={workspaceRef}
                className="w-[500px] h-[400px] rounded-2xl bg-black/75 relative overflow-hidden select-none border border-white/5 shadow-inner"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #070a13 25%, transparent 25%), linear-gradient(-45deg, #070a13 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #070a13 75%), linear-gradient(-45deg, transparent 75%, #070a13 75%)",
                  backgroundSize: "24px 24px",
                  backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
                }}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              >
                {/* 1. Underlying Transformed Image */}
                {originalImgUrl && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      width: imgNaturalWidth,
                      height: imgNaturalHeight,
                      left: `calc(50% - ${imgNaturalWidth / 2}px)`,
                      top: `calc(50% - ${imgNaturalHeight / 2}px)`,
                      transform: `translate(${imgPan.x}px, ${imgPan.y}px) scale(${
                        fitScale * imgZoom
                      }) rotate(${imgRotate}deg)`,
                      transformOrigin: "center center",
                      transition: isDragging ? "none" : "transform 0.05s ease-out",
                    }}
                  >
                    <img
                      src={activeImgElement?.src || originalImgUrl}
                      alt="Crop Viewport"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* 2. Visual Dark Overlay Mask (Surrounds Crop Box) */}
                <div
                  className="absolute bg-black/60 top-0 left-0 w-full pointer-events-none"
                  style={{ height: cropY }}
                />
                <div
                  className="absolute bg-black/60 left-0 w-full pointer-events-none"
                  style={{ top: cropY + cropH, height: workH - (cropY + cropH) }}
                />
                <div
                  className="absolute bg-black/60 left-0 pointer-events-none"
                  style={{ top: cropY, height: cropH, width: cropX }}
                />
                <div
                  className="absolute bg-black/60 pointer-events-none"
                  style={{ top: cropY, height: cropH, left: cropX + cropW, width: workW - (cropX + cropW) }}
                />

                 {/* 3. Glowing Crop Box */}
                 <div
                   className="absolute border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] cursor-move hover:border-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.55)] transition-colors duration-200"
                   style={{
                     left: cropX,
                     top: cropY,
                     width: cropW,
                     height: cropH,
                     transition: isDragging ? "none" : "left 0.12s cubic-bezier(0.16, 1, 0.3, 1), top 0.12s cubic-bezier(0.16, 1, 0.3, 1), width 0.12s cubic-bezier(0.16, 1, 0.3, 1), height 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
                   }}
                 >
                   {/* Grid Lines */}
                   <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                     <div className="border-r border-b border-white/20" />
                     <div className="border-r border-b border-white/20" />
                     <div className="border-b border-white/20" />
                     <div className="border-r border-b border-white/20" />
                     <div className="border-r border-b border-white/20" />
                     <div className="border-b border-white/20" />
                     <div className="border-r border-white/20" />
                     <div className="border-r border-white/20" />
                     <div />
                   </div>
 
                   {/* 8 Draggable Resize handles */}
                   {/* Corner Handles */}
                   <div
                     data-handle="resize-tl"
                     className="absolute -top-[9px] -left-[9px] w-[18px] h-[18px] bg-blue-500 border-2 border-white cursor-nwse-resize rounded-full hover:scale-125 hover:bg-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.85)] active:scale-110 transition-all duration-150 z-20"
                   />
                   <div
                     data-handle="resize-tr"
                     className="absolute -top-[9px] -right-[9px] w-[18px] h-[18px] bg-blue-500 border-2 border-white cursor-nesw-resize rounded-full hover:scale-125 hover:bg-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.85)] active:scale-110 transition-all duration-150 z-20"
                   />
                   <div
                     data-handle="resize-bl"
                     className="absolute -bottom-[9px] -left-[9px] w-[18px] h-[18px] bg-blue-500 border-2 border-white cursor-nesw-resize rounded-full hover:scale-125 hover:bg-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.85)] active:scale-110 transition-all duration-150 z-20"
                   />
                   <div
                     data-handle="resize-br"
                     className="absolute -bottom-[9px] -right-[9px] w-[18px] h-[18px] bg-blue-500 border-2 border-white cursor-nwse-resize rounded-full hover:scale-125 hover:bg-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.85)] active:scale-110 transition-all duration-150 z-20"
                   />
 
                   {/* Edge Handles */}
                   <div
                     data-handle="resize-t"
                     className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[36px] h-[10px] bg-blue-500 border border-white rounded-full cursor-ns-resize hover:scale-y-125 hover:bg-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.85)] transition-all duration-150 z-20"
                   />
                   <div
                     data-handle="resize-b"
                     className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-[36px] h-[10px] bg-blue-500 border border-white rounded-full cursor-ns-resize hover:scale-y-125 hover:bg-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.85)] transition-all duration-150 z-20"
                   />
                   <div
                     data-handle="resize-l"
                     className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-[10px] h-[36px] bg-blue-500 border border-white rounded-full cursor-ew-resize hover:scale-x-125 hover:bg-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.85)] transition-all duration-150 z-20"
                   />
                   <div
                     data-handle="resize-r"
                     className="absolute top-1/2 -translate-y-1/2 -right-[5px] w-[10px] h-[36px] bg-blue-500 border border-white rounded-full cursor-ew-resize hover:scale-x-125 hover:bg-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.85)] transition-all duration-150 z-20"
                   />
                </div>
              </div>

              {/* Instructions below editor */}
              <div className="w-full flex justify-between text-[10px] text-gray-500 font-bold px-2 mt-4 uppercase">
                <span>Drag crop corners or edges to resize</span>
                <span>Drag image to pan</span>
              </div>
            </div>

            {/* MANUAL ADJUSTMENTS SLIDERS DECK */}
            <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <Sliders className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Fine-Tuning Options</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Zoom slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span className="uppercase tracking-wider">Image Zoom</span>
                    <span className="font-mono text-blue-400">{imgZoom.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="6.0"
                    step="0.02"
                    value={imgZoom}
                    onChange={(e) => setImgZoom(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                {/* Rotation slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span className="uppercase tracking-wider">Image Rotation</span>
                    <span className="font-mono text-blue-400">{imgRotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={imgRotate}
                    onChange={(e) => setImgRotate(parseInt(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. RIGHT PANEL: EXPORT SETTINGS */}
          <div className="w-full xl:w-[35%] space-y-6">
            {/* Realtime compliance preview */}
            <div className="glass p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4">
                Live Export Preview
              </span>

              <div
                className="w-44 shadow-[0_0_40px_rgba(0,0,0,0.6)] border-4 border-white/5 rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-[#030712] relative"
                style={{ aspectRatio: `${cropW / cropH}` }}
              >
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                    backgroundSize: "15px 15px",
                  }}
                />
                {previewPhotoUrl && (
                  <img
                    src={previewPhotoUrl}
                    alt="Export Preview"
                    className="w-full h-full object-cover border border-white/5 rounded-lg shadow-2xl relative z-10"
                  />
                )}
              </div>

              {/* Dimensions specs label */}
              <div className="mt-4 text-center space-y-1">
                <div className="text-[11px] font-black text-white/90">
                  {activePreset.width} x {isLocked ? activePreset.height : Math.round(activePreset.width * (cropH / cropW))} Pixels ({activePreset.specs.split(",")[0]})
                </div>
                {downloadSizeInfo && (
                  <div className="text-[10px] font-mono font-black text-blue-400">
                    Compiled File Size: {downloadSizeInfo}
                  </div>
                )}
              </div>
            </div>

            {/* Passport Grid Print Sheet options */}
            <div className="glass p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Printer className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Passport Print Grid
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 bg-black/40 border border-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setGridSize(null)}
                  className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                    gridSize === null ? "bg-white/5 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setGridSize("4x4")}
                  className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                    gridSize === "4x4" ? "bg-white/5 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  4x4 Grid
                </button>
                <button
                  onClick={() => setGridSize("6x6")}
                  className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                    gridSize === "6x6" ? "bg-white/5 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  6x6 Grid
                </button>
                <button
                  onClick={() => setGridSize("8x8")}
                  className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                    gridSize === "8x8" ? "bg-white/5 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  8x8 Grid
                </button>
              </div>
            </div>

            {/* Optional AI background cleanup toggle */}
            {activePreset.allowBgRemoval && (
              <div className="glass p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      AI Background Cleanup
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      Clears backdrop to official solid color.
                    </span>
                  </div>
                  <button
                    onClick={() => triggerBgCleanup(!aiBgCleanup)}
                    disabled={isRemovingBg}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      aiBgCleanup ? "bg-blue-600" : "bg-gray-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        aiBgCleanup ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Formatting & background controls */}
            <div className="glass p-7 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <Palette className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Export Adjustments</h3>
              </div>

              {/* Background color select */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Background Backdrop
                </label>
                <div className="flex gap-3 items-center flex-wrap">
                  {activePreset.bgColors.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => setSelectedBgHex(bg.hex)}
                      className={`w-9 h-9 rounded-xl border-3 transition-all cursor-pointer ${
                        selectedBgHex === bg.hex
                          ? "border-blue-600 scale-105"
                          : "border-white/5 hover:border-white/15"
                      }`}
                      style={{
                        backgroundColor: bg.hex === "transparent" ? undefined : bg.hex,
                        backgroundImage:
                          bg.hex === "transparent"
                            ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                            : undefined,
                        backgroundSize: bg.hex === "transparent" ? "8px 8px" : undefined,
                      }}
                      title={bg.name}
                    />
                  ))}
                  <div className="w-px h-8 bg-white/10 mx-0.5" />
                  <button
                    onClick={() => colorInputRef.current?.click()}
                    className={`w-9 h-9 rounded-xl border-3 transition-all cursor-pointer flex items-center justify-center overflow-hidden ${
                      !activePreset.bgColors.some((bg) => bg.hex === selectedBgHex)
                        ? "border-blue-600 scale-105"
                        : "border-white/5 hover:border-white/15"
                    }`}
                    style={{
                      background:
                        "linear-gradient(45deg, #ff0000, #ffee00, #00ff66, #3366ff, #ff0099)",
                    }}
                    title="Custom Color"
                  >
                    <Sliders className="w-4 h-4 text-white drop-shadow-md" />
                    <input
                      type="color"
                      ref={colorInputRef}
                      value={selectedBgHex === "transparent" ? "#ffffff" : selectedBgHex}
                      onChange={(e) => setSelectedBgHex(e.target.value)}
                      className="sr-only"
                    />
                  </button>
                </div>
              </div>

              {/* Format selection */}
              <div className="space-y-4 pt-3 border-t border-white/5">
                <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setFormat("jpg")}
                    className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${
                      format === "jpg" ? "bg-white/5 text-white" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    JPEG (Standard)
                  </button>
                  <button
                    onClick={() => setFormat("png")}
                    className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${
                      format === "png" ? "bg-white/5 text-white" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    PNG (High Quality)
                  </button>
                </div>

                {format === "jpg" && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        KB Size limit
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTargetKbMode("preset")}
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            targetKbMode === "preset" ? "text-blue-400 bg-blue-500/10" : "text-gray-500"
                          }`}
                        >
                          Preset
                        </button>
                        <button
                          onClick={() => setTargetKbMode("custom")}
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            targetKbMode === "custom" ? "text-blue-400 bg-blue-500/10" : "text-gray-500"
                          }`}
                        >
                          Custom
                        </button>
                      </div>
                    </div>

                    {targetKbMode === "preset" ? (
                      <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-500 uppercase tracking-wider">Limit</span>
                        <span className="font-mono text-white">&lt; {activePreset.targetKb} KB</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-black/40 border border-white/5 px-4 py-2 rounded-xl">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                          Target Max Size (KB)
                        </span>
                        <input
                          type="number"
                          min="5"
                          max="800"
                          value={customTargetKb}
                          onChange={(e) =>
                            setCustomTargetKb(Math.max(5, parseInt(e.target.value) || 20))
                          }
                          className="w-16 bg-transparent text-right font-mono font-bold text-blue-400 outline-none text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Filters adjustment */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Ink / Contrast Enhance
                  </label>
                  <button
                    onClick={() => setAutoEnhance((prev) => !prev)}
                    className={`text-[9px] font-black uppercase tracking-widest border px-2.5 py-1 rounded-lg transition-all ${
                      autoEnhance
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                        : "bg-white/5 text-gray-400 border-white/5 hover:text-white"
                    }`}
                  >
                    Auto
                  </button>
                </div>

                <div className={`space-y-4 ${autoEnhance ? "opacity-30 pointer-events-none" : ""}`}>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                      <span className="uppercase tracking-wider">Brightness</span>
                      <span className="font-mono text-blue-400">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full accent-blue-600 h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                      <span className="uppercase tracking-wider">Contrast</span>
                      <span className="font-mono text-blue-400">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full accent-blue-600 h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                      <span className="uppercase tracking-wider">Sharpness Boost</span>
                      <span className="font-mono text-blue-400">+{sharpness}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={sharpness}
                      onChange={(e) => setSharpness(parseInt(e.target.value))}
                      className="w-full accent-blue-600 h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Sheet Preview */}
      {step === "editor" && gridSize && previewSheetUrl && (
        <div className="mt-12 max-w-5xl mx-auto glass rounded-[2.5rem] border border-white/5 p-8 text-center animate-fade-up animate-duration-500">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 block">
            Print Sheet Preview
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
            Passport Grid Layout ({gridSize})
          </h3>
          <div className="inline-block border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-white max-w-lg p-3">
            <img
              src={previewSheetUrl}
              alt="Grid Sheet print"
              className="max-w-full h-auto object-contain rounded-lg shadow-inner"
            />
          </div>
          <p className="text-xs text-gray-500 mt-6 leading-relaxed max-w-md mx-auto">
            This printable sheet layout packs {gridSize === "4x4" ? "16" : gridSize === "6x6" ? "36" : "64"} copies of your cropped photo on a clean white page with thin boundaries.
          </p>
        </div>
      )}

      {/* 4. BOTTOM ROW: DOWNLOAD SECTION */}
      {step === "editor" && (
        <div className="glass p-6 rounded-[2.5rem] border border-white/5 bg-white/[0.01] mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">
              Ready for Download • Checked for government validation
            </span>
          </div>

          <div className="flex gap-3.5 w-full sm:w-auto">
            <button
              onClick={resetAll}
              className="flex-1 sm:flex-initial px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5 cursor-pointer"
            >
              Upload Different Photo
            </button>
            <button
              onClick={handleDownload}
              className="flex-1.5 sm:flex-initial px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)] cursor-pointer"
            >
              Export & Download Compliant Image
            </button>
          </div>
        </div>
      )}

      {/* Dynamic SEO deep-dive articles */}
      {seoArticle}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  UploadCloud,
  Trash2,
  Sparkles,
  Download,
  RefreshCw,
  RotateCw,
  Plus,
  Minus,
  Check,
  ChevronLeft,
  Lock,
  ShieldCheck,
  AlertCircle,
  Undo2,
  FileImage,
  Info,
  Layers,
  HelpCircle,
  Scissors,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

// Formatter helper
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Canvas pixelation blur helper
const blurCanvasRegion = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  pixelSize = 12
) => {
  try {
    const imgData = ctx.getImageData(x, y, w, h);
    const data = imgData.data;

    for (let py = 0; py < h; py += pixelSize) {
      for (let px = 0; px < w; px += pixelSize) {
        let r = 0, g = 0, b = 0, count = 0;

        // Sample block pixels
        for (let dy = 0; dy < pixelSize && py + dy < h; dy++) {
          for (let dx = 0; dx < pixelSize && px + dx < w; dx++) {
            const idx = ((py + dy) * w + (px + dx)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        // Fill block pixels
        for (let dy = 0; dy < pixelSize && py + dy < h; dy++) {
          for (let dx = 0; dx < pixelSize && px + dx < w; dx++) {
            const idx = ((py + dy) * w + (px + dx)) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
          }
        }
      }
    }
    ctx.putImageData(imgData, x, y);
  } catch (e) {
    console.error("Pixelation error:", e);
  }
};

interface MaskOverlay {
  id: string;
  x: number; // Percentage based relative to original image size
  y: number;
  w: number;
  h: number;
  type: "redact" | "blur";
  label?: string;
}

interface AadhaarMaskingEngineProps {
  toolSlug: string;
  title: string;
  description: string;
  seoArticle?: React.ReactNode;
}

export default function AadhaarMaskingEngine({
  toolSlug,
  title,
  description,
  seoArticle
}: AadhaarMaskingEngineProps) {
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [step, setStep] = useState<"upload" | "scanning" | "editor">("upload");
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

  // OCR Cache
  const [ocrWords, setOcrWords] = useState<any[]>([]);

  // Workspace configuration & Overlays
  const [overlays, setOverlays] = useState<MaskOverlay[]>([]);
  const [sliderVal, setSliderVal] = useState<number>(50); // Before vs After split divider value
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [watermark, setWatermark] = useState<boolean>(true);
  const [blurQR, setBlurQR] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [maskType, setMaskType] = useState<"redact" | "blur">("redact");
  const [maskFullDigits, setMaskFullDigits] = useState<boolean>(false); // Mask 8 vs all 12 digits
  const [detectionSuccess, setDetectionSuccess] = useState<"success" | "none" | null>(null);
  const [maskingMethod, setMaskingMethod] = useState<"text" | "black" | "blur" | "pixel">("text");
  const [workspaceMode, setWorkspaceMode] = useState<"edit" | "compare">("edit");
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentDrawRect, setCurrentDrawRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Dimensions
  const [imgNaturalWidth, setImgNaturalWidth] = useState(600);
  const [imgNaturalHeight, setImgNaturalHeight] = useState(600);

  // Export properties
  const [exportFormat, setExportFormat] = useState<"png" | "jpg" | "pdf">("png");
  const [maskedPreviewUrl, setMaskedPreviewUrl] = useState<string | null>(null);
  const [downloadSizeInfo, setDownloadSizeInfo] = useState<string>("");

  // Refs
  const previewImgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamically load PDF.js client-side
  useEffect(() => {
    const initPdfjs = async () => {
      try {
        const lib = await import("pdfjs-dist");
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        setPdfjs(lib);
      } catch (err) {
        console.error("Failed to load pdfjs-dist", err);
      }
    };
    initPdfjs();
  }, []);

  // Sync dimensions when active image loads
  useEffect(() => {
    if (activeImgElement) {
      const nw = activeImgElement.naturalWidth || activeImgElement.width || 600;
      const nh = activeImgElement.naturalHeight || activeImgElement.height || 600;
      setImgNaturalWidth(nw);
      setImgNaturalHeight(nh);
    }
  }, [activeImgElement]);

  // Clean string helper for OCR issues
  const cleanOcrDigits = (str: string) => {
    return str
      .replace(/[Oo]/g, "0")
      .replace(/[IiLl|\[\]]/g, "1")
      .replace(/[Ss]/g, "5")
      .replace(/[Bb]/g, "8")
      .replace(/[Zz]/g, "2")
      .replace(/[GgQq]/g, "9")
      .replace(/[Tt]/g, "7")
      .replace(/[^0-9]/g, "");
  };

  // Generate Auto-redaction overlays based on cached OCR words and masking config
  const generateAutoOverlays = useCallback((words: any[], nw: number, nh: number, maskAll: boolean): MaskOverlay[] => {
    const detected: MaskOverlay[] = [];
    console.log("Analyzing parsed character layout structures...");

    // Heuristic: Sliding window to detect 12-digit numbers split across consecutive words
    for (let i = 0; i < words.length; i++) {
      let concatenated = "";
      let wordIndices: number[] = [];
      let yCoords: number[] = [];

      for (let j = i; j < Math.min(words.length, i + 5); j++) {
        const w = words[j];
        const cleaned = cleanOcrDigits(w.text);
        if (cleaned.length > 0) {
          concatenated += cleaned;
          wordIndices.push(j);
          yCoords.push(w.bbox.y0);
        }

        if (concatenated.length >= 12) {
          // Verify we have a matches of standard Aadhaar length
          if (concatenated.length === 12 || (concatenated.length > 12 && concatenated.length <= 14)) {
            const minY = Math.min(...yCoords);
            const maxY = Math.max(...yCoords);
            const itemH = words[i].bbox.y1 - words[i].bbox.y0;
            // Relaxed alignment check: vertical variance up to 3.5x character height to handle rotated card scans
            const isSameLine = (maxY - minY) < itemH * 3.5;

            console.log(`Candidate match found: "${concatenated}" across words [${wordIndices.map(idx => `"${words[idx].text}"`).join(", ")}]. isSameLine: ${isSameLine} (vertical gap: ${maxY - minY}px, allowable threshold: ${Math.round(itemH * 3.5)}px)`);

            if (isSameLine) {
              let digitsAccumulated = 0;
              const targetMaskDigits = maskAll ? 12 : 8;

              for (const idx of wordIndices) {
                const curWord = words[idx];
                const curDigits = cleanOcrDigits(curWord.text).length;

                if (digitsAccumulated < targetMaskDigits) {
                  const needToMask = Math.min(curDigits, targetMaskDigits - digitsAccumulated);

                  if (needToMask === curDigits) {
                    // Redact full word box
                    detected.push({
                      id: `auto-${Date.now()}-${idx}`,
                      x: (curWord.bbox.x0 / nw) * 100,
                      y: (curWord.bbox.y0 / nh) * 100,
                      w: ((curWord.bbox.x1 - curWord.bbox.x0) / nw) * 100,
                      h: ((curWord.bbox.y1 - curWord.bbox.y0) / nh) * 100,
                      type: "redact",
                      label: "Aadhaar Mask"
                    });
                  } else {
                    // Redact partial word box
                    const wWidth = curWord.bbox.x1 - curWord.bbox.x0;
                    const maskW = wWidth * (needToMask / curDigits);

                    detected.push({
                      id: `auto-${Date.now()}-${idx}`,
                      x: (curWord.bbox.x0 / nw) * 100,
                      y: (curWord.bbox.y0 / nh) * 100,
                      w: (maskW / nw) * 100,
                      h: ((curWord.bbox.y1 - curWord.bbox.y0) / nh) * 100,
                      type: "redact",
                      label: "Aadhaar Mask"
                    });
                  }
                }
                digitsAccumulated += curDigits;
              }

              console.log(`Successfully generated mask regions for candidate: "${concatenated}"`);
              // Advance index past this sequence
              i = j;
              break;
            }
          }
          break; // Stop inner loop if we exceed digits limit
        }
      }
    }

    console.log(`Layout scan complete. Total auto-redacted areas: ${detected.length}`);
    return detected;
  }, []);

  // Update auto-overlays when mask settings change, preserving manual drawings
  useEffect(() => {
    if (ocrWords.length > 0 && activeImgElement) {
      const nw = imgNaturalWidth;
      const nh = imgNaturalHeight;
      const newAuto = generateAutoOverlays(ocrWords, nw, nh, maskFullDigits);
      
      setOverlays((prev) => {
        // Keep manual overlays
        const manual = prev.filter((o) => !o.id.startsWith("auto-"));
        return [...manual, ...newAuto];
      });
    }
  }, [maskFullDigits, ocrWords, activeImgElement, imgNaturalWidth, imgNaturalHeight, generateAutoOverlays]);

  // Run Tesseract OCR on active image
  const runAutoAadhaarDetection = async (imgUrl: string, imgEl: HTMLImageElement) => {
    setStep("scanning");
    setLoadingText("Initializing browser OCR engine...");
    setProgress(15);
    try {
      const { createWorker } = await import("tesseract.js");
      setLoadingText("Downloading language models (~12MB)...");
      setProgress(35);

      const worker = await createWorker("eng", 1, {
        logger: (m: any) => {
          if (m.status === "recognizing text") {
            setLoadingText(`Scanning layout patterns: ${Math.round(m.progress * 100)}%`);
            setProgress(40 + Math.round(m.progress * 50));
          }
        }
      });

      setLoadingText("Running client-side secure character scan...");
      setProgress(50);
      
      // Draw image to an in-memory canvas to guarantee successful browser-side decoding
      // and avoid Tesseract.js image-loading bugs inside Web Workers.
      const canvas = document.createElement("canvas");
      const nw = imgEl.naturalWidth || imgEl.width || 600;
      const nh = imgEl.naturalHeight || imgEl.height || 600;
      canvas.width = nw;
      canvas.height = nh;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(imgEl, 0, 0);
      }

      const result = await worker.recognize(ctx ? canvas : imgEl, {}, {
        blocks: true
      });
      await worker.terminate();

      console.log("=== SECURE CLIENT-SIDE OCR RESULTS ===");
      console.log("Parsed Raw Text:\n", result.data.text);
      console.log("======================================");

      // Extract words from blocks hierarchy (Tesseract.js v5/v6/v7 compatible)
      const words: any[] = [];
      if (result.data.blocks) {
        result.data.blocks.forEach((block: any) => {
          if (block.paragraphs) {
            block.paragraphs.forEach((para: any) => {
              if (para.lines) {
                para.lines.forEach((line: any) => {
                  if (line.words) {
                    words.push(...line.words);
                  }
                });
              }
            });
          }
        });
      } else if ((result.data as any).words) {
        words.push(...(result.data as any).words);
      }

      setOcrWords(words); // Cache words to allow toggle re-calculation

      const autoMasks = generateAutoOverlays(words, nw, nh, maskFullDigits);

      if (autoMasks.length > 0) {
        setOverlays(autoMasks);
        setDetectionSuccess("success");
        toast.success(`Aadhaar card layout verified. ${autoMasks.length} areas masked.`);
      } else {
        setDetectionSuccess("none");
        toast.warning("Auto Aadhaar scanner could not locate numbers. Switched to manual adjustments.");
      }

      setStep("editor");
    } catch (err) {
      console.error("OCR Scanner Error details:", err);
      toast.error("OCR scanning failed. Switched to manual adjustments.");
      setDetectionSuccess("none");
      setStep("editor");
    }
  };

  // Compile final crop slice on Canvas
  const compileMaskedPreview = useCallback(async () => {
    if (!activeImgElement) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const nw = imgNaturalWidth;
      const nh = imgNaturalHeight;

      const isRotated90 = rotation === 90 || rotation === 270;
      canvas.width = isRotated90 ? nh : nw;
      canvas.height = isRotated90 ? nw : nh;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(activeImgElement, -nw / 2, -nh / 2, nw, nh);
      ctx.restore();

      // Draw active mask regions
      for (const m of overlays) {
        let rx = (m.x / 100) * nw;
        let ry = (m.y / 100) * nh;
        let rw = (m.w / 100) * nw;
        let rh = (m.h / 100) * nh;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        const drawX = rx - nw / 2;
        const drawY = ry - nh / 2;

        const isAuto = m.id.startsWith("auto-");
        // Effective method for this overlay block
        const method = isAuto ? maskingMethod : (m.type === "blur" ? "blur" : "black");

        console.log(`[Validation] Drawing mask: label="${m.label}", type="${m.type}", method="${method}", coordinates=(${Math.round(rx)}, ${Math.round(ry)}, ${Math.round(rw)}, ${Math.round(rh)})`);

        if (method === "black") {
          ctx.fillStyle = "#000000";
          ctx.fillRect(drawX, drawY, rw, rh);
        } 
        else if (method === "text") {
          let rectBgBrightness = 255;
          ctx.fillStyle = "#ffffff";
          try {
            // Map rotated relative coordinates back to screen canvas coordinates for pixel extraction
            const cx = rx + rw / 2;
            const cy = ry + rh / 2;
            const angle = (rotation * Math.PI) / 180;
            const rxRot = (cx - nw / 2) * Math.cos(angle) - (cy - nh / 2) * Math.sin(angle);
            const ryRot = (cx - nw / 2) * Math.sin(angle) + (cy - nh / 2) * Math.cos(angle);
            const canvasX = rxRot + canvas.width / 2;
            const canvasY = ryRot + canvas.height / 2;

            // Sample 4 points around the rectangle to find the card's background color
            const samplePoints = [
              { x: canvasX, y: canvasY - (isRotated90 ? rw : rh) / 2 - 5 }, // Above
              { x: canvasX, y: canvasY + (isRotated90 ? rw : rh) / 2 + 5 }, // Below
              { x: canvasX - (isRotated90 ? rh : rw) / 2 - 5, y: canvasY }, // Left
              { x: canvasX + (isRotated90 ? rh : rw) / 2 + 5, y: canvasY }  // Right
            ];

            let rSum = 0, gSum = 0, bSum = 0, count = 0;
            for (const pt of samplePoints) {
              const px = Math.max(0, Math.min(canvas.width - 1, Math.round(pt.x)));
              const py = Math.max(0, Math.min(canvas.height - 1, Math.round(pt.y)));
              const pData = ctx.getImageData(px, py, 1, 1).data;
              const brightness = 0.299 * pData[0] + 0.587 * pData[1] + 0.114 * pData[2];
              
              // Only use pixels that are relatively light (background) and not text/borders
              if (brightness > 80) {
                rSum += pData[0];
                gSum += pData[1];
                bSum += pData[2];
                count++;
              }
            }

            if (count > 0) {
              const rAvg = Math.round(rSum / count);
              const gAvg = Math.round(gSum / count);
              const bAvg = Math.round(bSum / count);
              ctx.fillStyle = `rgb(${rAvg}, ${gAvg}, ${bAvg})`;
              rectBgBrightness = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;
            } else {
              // Try average of all points without threshold
              let rTotal = 0, gTotal = 0, bTotal = 0;
              for (const pt of samplePoints) {
                const px = Math.max(0, Math.min(canvas.width - 1, Math.round(pt.x)));
                const py = Math.max(0, Math.min(canvas.height - 1, Math.round(pt.y)));
                const pData = ctx.getImageData(px, py, 1, 1).data;
                rTotal += pData[0];
                gTotal += pData[1];
                bTotal += pData[2];
              }
              const rAvg = Math.round(rTotal / 4);
              const gAvg = Math.round(gTotal / 4);
              const bAvg = Math.round(bTotal / 4);
              ctx.fillStyle = `rgb(${rAvg}, ${gAvg}, ${bAvg})`;
              rectBgBrightness = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;
            }
          } catch {
            ctx.fillStyle = "#f3f4f6";
            rectBgBrightness = 240;
          }

          ctx.fillRect(drawX, drawY, rw, rh);

          // Draw placeholder masking values only for thin blocks (digits) to prevent large manual boxes from showing "XXXX"
          if (m.label === "Aadhaar Mask" || rh < 45) {
            const fontSize = Math.max(12, Math.round(rh * 0.62));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = rectBgBrightness > 128 ? "#000000" : "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("XXXX", drawX + rw / 2, drawY + rh / 2 + 1);
          }
        } 
        else if (method === "blur") {
          ctx.restore();

          const cx = rx + rw / 2;
          const cy = ry + rh / 2;
          const angle = (rotation * Math.PI) / 180;
          const rxRot = (cx - nw / 2) * Math.cos(angle) - (cy - nh / 2) * Math.sin(angle);
          const ryRot = (cx - nw / 2) * Math.sin(angle) + (cy - nh / 2) * Math.cos(angle);
          const rotatedX = rxRot + canvas.width / 2;
          const rotatedY = ryRot + canvas.height / 2;

          const finalW = isRotated90 ? rh : rw;
          const finalH = isRotated90 ? rw : rh;

          blurCanvasRegion(
            ctx,
            Math.max(0, Math.round(rotatedX - finalW / 2)),
            Math.max(0, Math.round(rotatedY - finalH / 2)),
            Math.round(finalW),
            Math.round(finalH),
            8
          );
          ctx.save();
        } 
        else if (method === "pixel") {
          ctx.restore();

          const cx = rx + rw / 2;
          const cy = ry + rh / 2;
          const angle = (rotation * Math.PI) / 180;
          const rxRot = (cx - nw / 2) * Math.cos(angle) - (cy - nh / 2) * Math.sin(angle);
          const ryRot = (cx - nw / 2) * Math.sin(angle) + (cy - nh / 2) * Math.cos(angle);
          const rotatedX = rxRot + canvas.width / 2;
          const rotatedY = ryRot + canvas.height / 2;

          const finalW = isRotated90 ? rh : rw;
          const finalH = isRotated90 ? rw : rh;

          blurCanvasRegion(
            ctx,
            Math.max(0, Math.round(rotatedX - finalW / 2)),
            Math.max(0, Math.round(rotatedY - finalH / 2)),
            Math.round(finalW),
            Math.round(finalH),
            16
          );
          ctx.save();
        }
        ctx.restore();
      }

      // Quick blur helper for standard QR code boundaries
      if (blurQR) {
        const qrW = nw * 0.32;
        const qrH = nh * 0.32;
        const qrx = nw * 0.62;
        const qry = nh * 0.62;

        const dx = qrx + qrW / 2 - nw / 2;
        const dy = qry + qrH / 2 - nh / 2;
        const angle = (rotation * Math.PI) / 180;
        const rxRot = dx * Math.cos(angle) - dy * Math.sin(angle);
        const ryRot = dx * Math.sin(angle) + dy * Math.cos(angle);
        const rotatedX = rxRot + canvas.width / 2;
        const rotatedY = ryRot + canvas.height / 2;

        const finalW = isRotated90 ? qrH : qrW;
        const finalH = isRotated90 ? qrW : qrH;

        blurCanvasRegion(
          ctx,
          Math.max(0, Math.round(rotatedX - finalW / 2)),
          Math.max(0, Math.round(rotatedY - finalH / 2)),
          Math.round(finalW),
          Math.round(finalH),
          16
        );
      }

      // Apply safe watermarking text
      if (watermark) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((-30 * Math.PI) / 180);
        
        const fontSize = Math.max(14, Math.round(canvas.width * 0.035));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = "rgba(59, 130, 246, 0.18)";
        ctx.textAlign = "center";
        
        ctx.fillText("MASKED SECURE COPY", 0, -fontSize * 0.6);
        ctx.fillText("FOR KYC VERIFICATION ONLY", 0, fontSize * 0.8);
        ctx.restore();
      }

      const typeStr = exportFormat === "png" ? "image/png" : "image/jpeg";
      const finalUrl = canvas.toDataURL(typeStr, exportFormat === "jpg" ? 0.9 : undefined);
      
      setMaskedPreviewUrl(finalUrl);
      setDownloadSizeInfo(formatBytes(Math.round((finalUrl.length - 814) * 0.75)));
    } catch (e) {
      console.error("Failed to build secure preview:", e);
    }
  }, [
    activeImgElement,
    overlays,
    blurQR,
    watermark,
    rotation,
    exportFormat,
    imgNaturalWidth,
    imgNaturalHeight
  ]);

  // Sync edits to the preview rendering frame
  useEffect(() => {
    if (step === "editor" && activeImgElement) {
      const timeout = setTimeout(() => {
        compileMaskedPreview();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [
    step,
    activeImgElement,
    overlays,
    blurQR,
    watermark,
    rotation,
    exportFormat,
    compileMaskedPreview
  ]);

  // Load Image upload caching
  const loadSourceImage = (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const url = e.target?.result as string;
        setOriginalImgUrl(url);

        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        setActiveImgElement(img);
        await runAutoAadhaarDetection(url, img);
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse image dimensions.");
        setStep("upload");
      }
    };
    reader.readAsDataURL(file);
  };

  // Convert loaded PDF Page to Image
  const renderPdfPageToImage = async (doc: any, pageNum: number) => {
    try {
      setStep("scanning");
      setLoadingText(`Parsing PDF Page ${pageNum}...`);
      setProgress(10);

      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // High quality scaling for local OCR
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
        await runAutoAadhaarDetection(url, img);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to render PDF page.");
      setStep("upload");
    }
  };

  // Load PDF upload
  const loadSourcePdf = (file: File) => {
    if (!pdfjs) {
      toast.error("Rendering engine starting. Try again in a moment.");
      return;
    }

    setUploadedFile(file);
    setStep("scanning");
    setLoadingText("Initializing local PDF stream...");
    setProgress(5);

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

        // Pre-render a thumbnail preview for sidebar sorting if multi-page
        const previews: string[] = [];
        for (let i = 1; i <= Math.min(doc.numPages, 3); i++) {
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
        toast.error("Failed to open PDF document cache.");
        setStep("upload");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type;
      const name = file.name.toLowerCase();
      if (type === "application/pdf" || name.endsWith(".pdf")) {
        loadSourcePdf(file);
      } else if (type.startsWith("image/")) {
        loadSourceImage(file);
      } else {
        toast.error("Unsupported file format. Upload standard PNG, JPG, or PDF scans.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const type = file.type;
      const name = file.name.toLowerCase();
      if (type === "application/pdf" || name.endsWith(".pdf")) {
        loadSourcePdf(file);
      } else if (type.startsWith("image/")) {
        loadSourceImage(file);
      } else {
        toast.error("Unsupported file type.");
      }
    }
  };

  // Pointer interactions for manual crop drawing on top of preview
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!previewImgRef.current || step !== "editor") return;

    const rect = previewImgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentDrawRect({ x, y, w: 0, h: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !currentDrawRect || !previewImgRef.current) return;

    const rect = previewImgRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const currentY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const w = currentX - drawStart.x;
    const h = currentY - drawStart.y;

    setCurrentDrawRect({
      x: w < 0 ? currentX : drawStart.x,
      y: h < 0 ? currentY : drawStart.y,
      w: Math.abs(w),
      h: Math.abs(h)
    });
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentDrawRect || !previewImgRef.current) return;
    setIsDrawing(false);

    if (currentDrawRect.w > 8 && currentDrawRect.h > 8) {
      const rect = previewImgRef.current.getBoundingClientRect();
      
      const xPct = (currentDrawRect.x / rect.width) * 100;
      const yPct = (currentDrawRect.y / rect.height) * 100;
      const wPct = (currentDrawRect.w / rect.width) * 100;
      const hPct = (currentDrawRect.h / rect.height) * 100;

      const newOverlay: MaskOverlay = {
        id: `manual-${Date.now()}`,
        x: xPct,
        y: yPct,
        w: wPct,
        h: hPct,
        type: maskType,
        label: maskType === "redact" ? "Redaction Box" : "Blur Box"
      };

      setOverlays((prev) => [...prev, newOverlay]);
      toast.success("Manual mask region added.");
    }
    setCurrentDrawRect(null);
  };

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSliding(true);
  };

  const handleSliderTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsSliding(true);
  };

  useEffect(() => {
    if (!isSliding) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const val = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderVal(val);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const val = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderVal(val);
    };

    const handleMouseUp = () => {
      setIsSliding(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isSliding]);

  // Pre-load manual blur boxes
  const addManualBlurBox = () => {
    const newOverlay: MaskOverlay = {
      id: `manual-${Date.now()}`,
      x: 35,
      y: 35,
      w: 30,
      h: 30,
      type: "blur",
      label: "Custom Blur"
    };
    setOverlays((prev) => [...prev, newOverlay]);
    toast.info("Placed manual blur box. Click and drag on image to custom draw, or drag boundaries.");
  };

  const addManualRedactBox = () => {
    const newOverlay: MaskOverlay = {
      id: `manual-${Date.now()}`,
      x: 35,
      y: 35,
      w: 30,
      h: 30,
      type: "redact",
      label: "Redaction Box"
    };
    setOverlays((prev) => [...prev, newOverlay]);
    toast.info("Placed manual redaction box.");
  };

  // Undo last manual overlay action
  const handleUndoMask = () => {
    // Locate the last manual overlay in the array
    const manualIndices = overlays
      .map((o, idx) => (o.id.startsWith("manual-") ? idx : -1))
      .filter((idx) => idx !== -1);

    if (manualIndices.length > 0) {
      const lastManualIdx = manualIndices[manualIndices.length - 1];
      setOverlays((prev) => prev.filter((_, idx) => idx !== lastManualIdx));
      toast.success("Undid last manual mask box.");
    } else {
      // If no manual masks, undo the last auto mask
      if (overlays.length > 0) {
        setOverlays((prev) => prev.slice(0, -1));
        toast.success("Undid last mask box.");
      } else {
        toast.info("Workspace is empty.");
      }
    }
  };

  const deleteOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    toast.success("Mask region removed.");
  };

  const clearAllOverlays = () => {
    setOverlays([]);
    setBlurQR(false);
    toast.info("Cleared all workspace masks.");
  };

  const switchPdfPage = async (pageNum: number) => {
    if (!pdfDoc) return;
    setPdfCurrentPage(pageNum);
    await renderPdfPageToImage(pdfDoc, pageNum);
  };

  // Compile download exports
  const triggerDownload = () => {
    if (!maskedPreviewUrl || !uploadedFile) return;
    const rawName = uploadedFile.name.replace(/\.[^/.]+$/, "");

    if (exportFormat === "pdf") {
      const isRotated90 = rotation === 90 || rotation === 270;
      const finalW = isRotated90 ? imgNaturalHeight : imgNaturalWidth;
      const finalH = isRotated90 ? imgNaturalWidth : imgNaturalHeight;

      const pdf = new jsPDF({
        orientation: finalW > finalH ? "l" : "p",
        unit: "px",
        format: [finalW, finalH]
      });

      pdf.addImage(maskedPreviewUrl, "JPEG", 0, 0, finalW, finalH);
      pdf.save(`${rawName}_masked.pdf`);
      toast.success("Secure masked PDF document downloaded.");
    } else {
      const a = document.createElement("a");
      a.href = maskedPreviewUrl;
      a.download = `${rawName}_masked.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Secure masked card exported as ${exportFormat.toUpperCase()}.`);
    }
  };

  // Load a locally simulated mock Aadhaar Card for demonstration
  const handleLoadSampleAadhaar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering file select dialog
    setStep("scanning");
    setLoadingText("Generating sample Aadhaar card canvas...");
    setProgress(20);

    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 850;
      canvas.height = 540;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Card background body
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === "function") {
          (ctx as any).roundRect(15, 15, 820, 510, 24);
        } else {
          ctx.rect(15, 15, 820, 510);
        }
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#cbd5e1";
        ctx.stroke();

        // National Tricolor border stripe
        ctx.fillStyle = "#ff9933"; // saffron
        ctx.fillRect(15, 15, 820, 18);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(15, 33, 820, 18);
        ctx.fillStyle = "#128807"; // green
        ctx.fillRect(15, 51, 820, 18);

        // Ashoka Chakra wheel in the center white stripe
        ctx.strokeStyle = "#000088";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(425, 42, 14, 0, Math.PI * 2);
        ctx.stroke();
        for (let s = 0; s < 24; s++) {
          const angle = (s * 15 * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(425, 42);
          ctx.lineTo(425 + 14 * Math.cos(angle), 42 + 14 * Math.sin(angle));
          ctx.stroke();
        }

        // Header government tags
        ctx.fillStyle = "#e05300";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText("भारत सरकार", 50, 110);
        ctx.fillStyle = "#128807";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("GOVERNMENT OF INDIA", 50, 142);

        // Standard user portrait frame placeholder
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(50, 180, 175, 220);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 180, 175, 220);

        // Draw simple avatar silhouette
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(137, 250, 35, 0, Math.PI * 2); // head
        ctx.fill();
        ctx.beginPath();
        ctx.arc(137, 360, 68, Math.PI, 0); // body
        ctx.fill();

        // Fake user descriptors
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("नाम / Name : Rahul Kumar", 260, 225);
        ctx.fillText("जन्म तिथि / DOB : 15/08/1992", 260, 275);
        ctx.fillText("लिंग / Gender : पुरुष / Male", 260, 325);

        // Big Aadhaar Number block at bottom center
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 44px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("1234  5678  9012", 425, 435);

        // UIDAI slogan banner
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("आधार - आम आदमी का अधिकार", 425, 485);

        // QR Code mockup layout
        ctx.fillStyle = "#000000";
        ctx.fillRect(600, 180, 180, 180);
        
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(615, 195, 45, 45);
        ctx.fillRect(705, 195, 45, 45);
        ctx.fillRect(615, 285, 45, 45);

        ctx.fillStyle = "#000000";
        ctx.fillRect(625, 205, 25, 25);
        ctx.fillRect(715, 205, 25, 25);
        ctx.fillRect(625, 295, 25, 25);

        // Draw random QR code pixels
        for (let r = 0; r < 200; r++) {
          const qx = 600 + Math.floor(Math.random() * 180);
          const qy = 180 + Math.floor(Math.random() * 180);
          ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
          ctx.fillRect(qx, qy, 6, 6);
        }
      }

      // Convert to blob and load
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "sample_aadhaar_card.png", { type: "image/png" });
          setUploadedFile(file);
          const url = canvas.toDataURL("image/png");
          setOriginalImgUrl(url);

          const img = new Image();
          img.onload = async () => {
            setActiveImgElement(img);
            await runAutoAadhaarDetection(url, img);
          };
          img.src = url;
        }
      }, "image/png");
    }, 1500);
  };

  const resetAll = () => {
    setStep("upload");
    setUploadedFile(null);
    setOriginalImgUrl(null);
    setActiveImgElement(null);
    setPdfDoc(null);
    setPdfPreviews([]);
    setOverlays([]);
    setOcrWords([]);
    setRotation(0);
    setBlurQR(false);
    setWatermark(true);
    setDetectionSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-12">
      {/* Visual interactive workbench card */}
      <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Dynamic header summary banner */}
        <div className="p-8 sm:p-10 border-b border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shadow-lg">
              <Scissors className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h2>
              <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider mt-0.5">Secure Document Redaction</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {step === "editor" && (
              <button
                onClick={resetAll}
                className="px-4 py-2 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.02] hover:bg-slate-200/70 dark:hover:bg-white/[0.05] text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Upload another photo
              </button>
            )}
            <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-500/20 h-fit self-start shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">100% Client-Side</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic workspace router */}
        <div className="p-8 sm:p-10">
          <AnimatePresence mode="wait">
            {step === "upload" && (
              <motion.div
                key="upload-deck"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                {/* Upload box */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E6ECF5] dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/40 rounded-[1.125rem] py-8 sm:py-10 px-6 sm:px-8 text-center bg-[#FBFCFE] dark:bg-white/[0.01] hover:bg-[#F0F4FF] dark:hover:bg-white/[0.03] transition-all cursor-pointer group relative overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.03)]"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png, image/jpeg, image/webp, application/pdf"
                    className="hidden"
                  />
                  
                  {/* Visual glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-xl group-hover:scale-105 transition-transform duration-300">
                      <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">Drop Aadhaar Card scan or PDF here</h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-sm mx-auto">Supports JPG, PNG, WEBP, and PDF documents. Max size: 20MB.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                      <div className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        Browse Files
                      </div>
                      <button
                        onClick={handleLoadSampleAadhaar}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:border-blue-500/30 text-gray-300 hover:text-white hover:bg-blue-600/10 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                      >
                        ⚡ Try with Sample Image
                      </button>
                    </div>

                    <div className="flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 pt-3">
                      <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-amber-500" /> Secure Sandbox</span>
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Offline Processing</span>
                    </div>
                  </div>
                </div>

                {/* Upload Image Guidelines */}
                <div className="bg-[#FBFCFE] dark:bg-white/[0.02] p-8 rounded-3xl border border-[#E6ECF5] dark:border-white/5 space-y-6 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Aadhaar Upload Guidelines & Examples
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                      Please follow the visual examples below. Auto-scanner requires clean character contrast to run client-side OCR.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Good Scan */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-500/[0.01] p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:bg-emerald-500/[0.03] transition-all flex flex-col items-center space-y-4 shadow-sm">
                      <div className="relative h-28 w-full bg-slate-900/10 dark:bg-slate-950/60 rounded-xl flex items-center justify-center overflow-hidden border border-emerald-500/30">
                        {/* Miniature simulated Aadhaar card */}
                        <div className="w-[110px] h-[70px] bg-white rounded-md p-1.5 flex flex-col justify-between shadow-lg border border-emerald-500 relative select-none animate-pulse-slow">
                          {/* Tricolor top strip */}
                          <div className="h-1 w-full flex">
                            <div className="w-1/3 bg-[#FF9933]" />
                            <div className="w-1/3 bg-white" />
                            <div className="w-1/3 bg-[#128807]" />
                          </div>
                          
                          {/* Middle layout */}
                          <div className="flex gap-1 items-center flex-1 my-0.5 scale-90 origin-left">
                            {/* Avatar */}
                            <div className="w-5 h-7 bg-slate-200 rounded-sm flex items-center justify-center shrink-0">
                              <div className="w-3 h-3 rounded-full bg-slate-400" />
                            </div>
                            {/* Lines */}
                            <div className="flex flex-col gap-0.5 w-full">
                              <div className="h-0.5 bg-slate-300 w-3/4 rounded-sm" />
                              <div className="h-0.5 bg-slate-200 w-1/2 rounded-sm" />
                              <div className="h-0.5 bg-slate-200 w-2/3 rounded-sm" />
                            </div>
                          </div>
                          
                          {/* Card number */}
                          <div className="text-[6px] font-black tracking-wider text-slate-800 text-center leading-none">
                            1234 5678 9012
                          </div>
                        </div>
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-[8px] font-black text-white rounded uppercase tracking-wider">
                          ✓ Correct
                        </span>
                      </div>
                      <div className="text-center space-y-1">
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Clear & Straight</h5>
                        <p className="text-[10px] text-slate-600 dark:text-gray-500 leading-normal font-sans font-medium">
                          Numbers are sharp, card orientation is flat and horizontal.
                        </p>
                      </div>
                    </div>

                    {/* Blurry Scan */}
                    <div className="bg-red-50/40 dark:bg-red-500/[0.005] p-5 rounded-2xl border border-red-200 dark:border-red-500/10 hover:border-red-300 dark:hover:bg-red-500/[0.02] transition-all flex flex-col items-center space-y-4 shadow-sm">
                      <div className="relative h-28 w-full bg-slate-900/10 dark:bg-slate-950/60 rounded-xl flex items-center justify-center overflow-hidden border border-red-500/10">
                        {/* Miniature simulated Aadhaar card blurred */}
                        <div className="w-[110px] h-[70px] bg-white rounded-md p-1.5 flex flex-col justify-between shadow-lg border border-red-500/20 relative select-none blur-[1.2px]">
                          <div className="h-1 w-full flex">
                            <div className="w-1/3 bg-[#FF9933]" />
                            <div className="w-1/3 bg-white" />
                            <div className="w-1/3 bg-[#128807]" />
                          </div>
                          <div className="flex gap-1 items-center flex-1 my-0.5 scale-90 origin-left">
                            <div className="w-5 h-7 bg-slate-200 rounded-sm shrink-0" />
                            <div className="flex flex-col gap-0.5 w-full">
                              <div className="h-0.5 bg-slate-300 w-3/4 rounded-sm" />
                              <div className="h-0.5 bg-slate-200 w-1/2 rounded-sm" />
                            </div>
                          </div>
                          <div className="text-[6px] font-black tracking-wider text-slate-800 text-center leading-none">
                            1234 5678 9012
                          </div>
                        </div>
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-500 text-[8px] font-black text-white rounded uppercase tracking-wider">
                          ✗ Blurry
                        </span>
                      </div>
                      <div className="text-center space-y-1">
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Out of Focus</h5>
                        <p className="text-[10px] text-slate-600 dark:text-gray-500 leading-normal font-sans font-medium">
                          Low lighting or shaky camera results in fuzzy characters.
                        </p>
                      </div>
                    </div>

                    {/* Glare Scan */}
                    <div className="bg-red-50/40 dark:bg-red-500/[0.005] p-5 rounded-2xl border border-red-200 dark:border-red-500/10 hover:border-red-300 dark:hover:bg-red-500/[0.02] transition-all flex flex-col items-center space-y-4 shadow-sm">
                      <div className="relative h-28 w-full bg-slate-900/10 dark:bg-slate-950/60 rounded-xl flex items-center justify-center overflow-hidden border border-red-500/10">
                        {/* Miniature simulated Aadhaar card with glare */}
                        <div className="w-[110px] h-[70px] bg-white rounded-md p-1.5 flex flex-col justify-between shadow-lg border border-red-500/20 relative overflow-hidden select-none">
                          <div className="h-1 w-full flex">
                            <div className="w-1/3 bg-[#FF9933]" />
                            <div className="w-1/3 bg-white" />
                            <div className="w-1/3 bg-[#128807]" />
                          </div>
                          <div className="flex gap-1 items-center flex-1 my-0.5 scale-90 origin-left">
                            <div className="w-5 h-7 bg-slate-200 rounded-sm shrink-0" />
                            <div className="flex flex-col gap-0.5 w-full">
                              <div className="h-0.5 bg-slate-300 w-3/4 rounded-sm" />
                              <div className="h-0.5 bg-slate-200 w-1/2 rounded-sm" />
                            </div>
                          </div>
                          <div className="text-[6px] font-black tracking-wider text-slate-800 text-center leading-none">
                            1234 5678 9012
                          </div>
                          {/* Glare overlay */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0)_60%)] pointer-events-none" />
                        </div>
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-500 text-[8px] font-black text-white rounded uppercase tracking-wider">
                          ✗ Glare
                        </span>
                      </div>
                      <div className="text-center space-y-1">
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Reflections</h5>
                        <p className="text-[10px] text-slate-600 dark:text-gray-500 leading-normal font-sans font-medium">
                          Shiny card lamination or heavy light flash washes out digits.
                        </p>
                      </div>
                    </div>

                    {/* Tilted Scan */}
                    <div className="bg-red-50/40 dark:bg-red-500/[0.005] p-5 rounded-2xl border border-red-200 dark:border-red-500/10 hover:border-red-300 dark:hover:bg-red-500/[0.02] transition-all flex flex-col items-center space-y-4 shadow-sm">
                      <div className="relative h-28 w-full bg-slate-900/10 dark:bg-slate-950/60 rounded-xl flex items-center justify-center overflow-hidden border border-red-500/10">
                        {/* Miniature simulated Aadhaar card rotated */}
                        <div className="w-[110px] h-[70px] bg-white rounded-md p-1.5 flex flex-col justify-between shadow-lg border border-red-500/20 relative select-none transform rotate-[-15deg] translate-y-1.5">
                          <div className="h-1 w-full flex">
                            <div className="w-1/3 bg-[#FF9933]" />
                            <div className="w-1/3 bg-white" />
                            <div className="w-1/3 bg-[#128807]" />
                          </div>
                          <div className="flex gap-1 items-center flex-1 my-0.5 scale-90 origin-left">
                            <div className="w-5 h-7 bg-slate-200 rounded-sm shrink-0" />
                            <div className="flex flex-col gap-0.5 w-full">
                              <div className="h-0.5 bg-slate-300 w-3/4 rounded-sm" />
                              <div className="h-0.5 bg-slate-200 w-1/2 rounded-sm" />
                            </div>
                          </div>
                          <div className="text-[6px] font-black tracking-wider text-slate-800 text-center leading-none">
                            1234 5678 9012
                          </div>
                        </div>
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-500 text-[8px] font-black text-white rounded uppercase tracking-wider">
                          ✗ Tilted
                        </span>
                      </div>
                      <div className="text-center space-y-1">
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Tilted / Cropped</h5>
                        <p className="text-[10px] text-slate-600 dark:text-gray-500 leading-normal font-sans font-medium">
                          Sideways text or cropped bounds prevent standard layout scan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "scanning" && (
              <motion.div
                key="scanning-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 flex flex-col items-center justify-center text-center space-y-8 min-h-[400px]"
              >
                <div className="relative">
                  {/* Glowing neon backdrop */}
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                  <div className="relative h-20 w-20 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white shadow-[0_0_35px_rgba(37,99,235,0.5)]">
                    <Sparkles className="w-10 h-10 animate-spin-slow" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight animate-pulse">Running Secure Scan</h3>
                  <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto">{loadingText}</p>
                </div>

                <div className="w-full max-w-md bg-white/5 border border-white/5 h-2.5 rounded-full overflow-hidden relative shadow-inner">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-600 animate-pulse">
                  All character parsing happens locally inside your browser cache.
                </span>
              </motion.div>
            )}

            {step === "editor" && originalImgUrl && (
              <motion.div
                key="editor-deck"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Left panel: Preview & Canvas Interactions */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Before vs After interactive layout */}
                  <div className="bg-[#FBFCFE] dark:bg-black/30 border border-[#E6ECF5] dark:border-white/5 rounded-3xl p-5 shadow-sm flex-1 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden select-none">
                    
                    {/* Floating guide badges */}
                    <div className="absolute top-5 left-5 z-20 flex gap-2">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider select-none shadow-sm">
                        Before (Original)
                      </span>
                    </div>
                    <div className="absolute top-5 right-5 z-20 flex gap-2">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 rounded-lg text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider select-none shadow-sm">
                        After (Masked Preview)
                      </span>
                    </div>

                    <div className="w-full flex justify-center py-6">
                      <div 
                        ref={containerRef}
                        className="relative max-w-full border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl bg-slate-950 inline-flex items-center justify-center"
                        style={{ cursor: maskType === "redact" ? "crosshair" : "cell" }}
                      >
                        {/* 1. Original Source Image */}
                        <img
                          ref={previewImgRef}
                          src={originalImgUrl}
                          alt="Original View"
                          className="max-h-[420px] w-auto h-auto max-w-full rounded-lg pointer-events-none select-none block"
                          onLoad={() => {
                            compileMaskedPreview();
                          }}
                        />

                        {/* 2. Masked Preview Image Overlayed (Clipped from left using sliderVal%) */}
                        {maskedPreviewUrl && (
                          <div
                            className="absolute inset-0 pointer-events-none select-none transition-all duration-75"
                            style={{
                              clipPath: `inset(0 0 0 ${sliderVal}%)`
                            }}
                          >
                            <img
                              src={maskedPreviewUrl}
                              alt="Masked Preview"
                              className="w-full h-full rounded-lg block"
                            />
                          </div>
                        )}

                        {/* Drag and Draw Workspace Overlays */}
                        <div
                          className="absolute inset-0 z-10"
                          onPointerDown={handlePointerDown}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                        >
                          {/* Render Active Overlay Rectangles */}
                          {overlays.map((m) => (
                            <div
                              key={m.id}
                              className={`absolute border flex items-center justify-center group pointer-events-auto transition-all ${
                                m.type === "redact"
                                  ? "border-red-500/40 bg-red-500/10 hover:border-red-500/80"
                                  : "border-blue-500/40 bg-blue-500/10 hover:border-blue-500/80"
                              }`}
                              style={{
                                left: `${m.x}%`,
                                top: `${m.y}%`,
                                width: `${m.w}%`,
                                height: `${m.h}%`
                              }}
                              onClick={(e) => e.stopPropagation()} // Prevent clicking to draw new box
                            >
                              {!m.id.startsWith("auto-") && (
                                <span className="text-[8px] font-black uppercase text-white/45 bg-black/75 px-1 py-0.5 rounded pointer-events-none">
                                  {m.type === "redact" ? "Redact" : "Blur"}
                                </span>
                              )}
                              
                              {/* Delete button corner widget */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteOverlay(m.id);
                                }}
                                className="absolute -top-2 -right-2 h-5 w-5 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg border border-red-500 cursor-pointer scale-0 group-hover:scale-100 transition-transform"
                                title="Remove redaction"
                              >
                                ×
                              </button>
                            </div>
                          ))}

                          {/* Render current rectangle preview while drawing */}
                          {isDrawing && currentDrawRect && (
                            <div
                              className="absolute border border-dashed border-yellow-500 bg-yellow-500/10 pointer-events-none"
                              style={{
                                left: `${currentDrawRect.x}px`,
                                top: `${currentDrawRect.y}px`,
                                width: `${currentDrawRect.w}px`,
                                height: `${currentDrawRect.h}px`
                              }}
                            />
                          )}
                        </div>

                        {/* Interactive Slit Divider line overlay */}
                        <div 
                          className="absolute inset-y-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 z-20 cursor-ew-resize pointer-events-auto"
                          style={{ left: `${sliderVal}%` }}
                          onMouseDown={handleSliderMouseDown}
                          onTouchStart={handleSliderTouchStart}
                        >
                          {/* Draggable Circle Center Badge */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 border-2 border-blue-500 text-blue-400 rounded-full flex items-center justify-center text-xs font-black shadow-2xl select-none">
                            ↔
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full flex justify-between items-center text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider border-t border-[#E6ECF5] dark:border-white/5 pt-4 mt-2">
                      <span>Interactive Split Preview</span>
                      <span className="text-slate-600 dark:text-gray-400">Drag comparison slider left/right</span>
                    </div>
                  </div>

                  {/* Bottom Workspace Action Toolbar */}
                  <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start w-full sm:w-auto">
                      <span className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest mr-1 hidden md:inline">Mask Mode:</span>
                      <div className="flex bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-1 rounded-xl shrink-0">
                        <button
                          onClick={() => setMaskFullDigits(false)}
                          className={`py-1.5 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all ${
                            !maskFullDigits
                              ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                              : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                          title="Mask first 8 digits (XXXX XXXX 1234)"
                        >
                          8-Digit Mask
                        </button>
                        <button
                          onClick={() => setMaskFullDigits(true)}
                          className={`py-1.5 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all ${
                            maskFullDigits
                              ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                              : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                          title="Mask all 12 digits (XXXX XXXX XXXX)"
                        >
                          12-Digit Mask
                        </button>
                      </div>

                      <div className="w-px h-6 bg-slate-200 dark:bg-white/5 hidden md:block" />

                      <button
                        onClick={handleUndoMask}
                        disabled={overlays.length === 0}
                        className="h-9 px-4 border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200/70 text-slate-700 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Undo last mask box"
                      >
                        <Undo2 className="w-3.5 h-3.5 text-amber-500" />
                        Undo
                      </button>

                      <button
                        onClick={clearAllOverlays}
                        disabled={overlays.length === 0}
                        className="h-9 px-4 border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200/70 text-slate-700 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Remove all mask boxes"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        Clear All
                      </button>
                    </div>

                    <button
                      onClick={resetAll}
                      className="h-9 px-4 w-full sm:w-auto border border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 hover:bg-blue-100 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <UploadCloud className="w-3.5 h-3.5" /> Upload Another Photo
                    </button>
                  </div>

                  {/* Multi-page PDF page indicators */}
                  {pdfDoc && pdfPagesCount > 1 && (
                    <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl p-4 shadow-sm flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">PDF Page Viewer</span>
                      <div className="flex gap-2.5">
                        {Array.from({ length: pdfPagesCount }).map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => switchPdfPage(pageNum)}
                              className={`h-9 px-4 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                pdfCurrentPage === pageNum
                                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                              }`}
                            >
                              Page {pageNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right panel: Editor Workspace configurations */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Manual Redact additions */}
                  <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500 block">Workspace Actions</span>
                    
                    <div className="space-y-5">
                      {/* Mask Length Toggle options */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">Aadhaar Number Masking Option</label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-1 rounded-xl">
                          <button
                            onClick={() => setMaskFullDigits(false)}
                            className={`py-2 px-1 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all ${
                              !maskFullDigits
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            Hide First 8 Digits
                          </button>
                          <button
                            onClick={() => setMaskFullDigits(true)}
                            className={`py-2 px-1 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all ${
                              maskFullDigits
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            Hide All 12 Digits
                          </button>
                        </div>
                      </div>

                      {/* Manual drawing type toggle */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">Manual Drawing Mode</label>
                        <div className="grid grid-cols-2 gap-2.5 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-1 rounded-xl">
                          <button
                            onClick={() => setMaskType("redact")}
                            className={`py-2 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-colors ${
                              maskType === "redact"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            Redact (Hide)
                          </button>
                          <button
                            onClick={() => setMaskType("blur")}
                            className={`py-2 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-colors ${
                              maskType === "blur"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            Blur Area
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wide mt-1 leading-relaxed">
                          💡 Tip: Select a mode, then click and drag directly on the image to draw a custom mask box.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <button
                          onClick={addManualRedactBox}
                          className="py-3 px-4 bg-slate-100 hover:bg-slate-200/70 text-slate-700 border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-white/10 hover:border-blue-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
                          Redact Box
                        </button>
                        <button
                          onClick={addManualBlurBox}
                          className="py-3 px-4 bg-slate-100 hover:bg-slate-200/70 text-slate-700 border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-white/10 hover:border-blue-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
                          Blur Box
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleUndoMask}
                          disabled={overlays.length === 0}
                          className="py-3 px-4 border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200/70 text-slate-700 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] dark:text-gray-400 dark:hover:text-white disabled:opacity-40 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Undo2 className="w-3.5 h-3.5 text-amber-500" />
                          Undo Mask
                        </button>
                        <button
                          onClick={clearAllOverlays}
                          disabled={overlays.length === 0}
                          className="py-3 px-4 border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200/70 text-slate-700 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] dark:text-gray-400 dark:hover:text-white disabled:opacity-40 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          Clear All
                        </button>
                      </div>

                      <div className="h-px bg-[#E6ECF5] dark:bg-white/5 w-full" />

                      {/* Utilities controls */}
                      <div className="space-y-3.5">
                        {/* Blur QR */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-600 dark:text-gray-400 uppercase tracking-wider">Blur QR Code</span>
                          <input
                            type="checkbox"
                            checked={blurQR}
                            onChange={(e) => setBlurQR(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-blue-600 outline-none cursor-pointer focus:ring-0"
                            id="blur-qr-checkbox"
                          />
                        </div>

                        {/* Watermark */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-600 dark:text-gray-400 uppercase tracking-wider">Watermark Document</span>
                          <input
                            type="checkbox"
                            checked={watermark}
                            onChange={(e) => setWatermark(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-blue-600 outline-none cursor-pointer focus:ring-0"
                            id="watermark-checkbox"
                          />
                        </div>

                        {/* Rotate */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-600 dark:text-gray-400 uppercase tracking-wider">Rotate Document</span>
                          <button
                            onClick={() => setRotation((prev) => (prev + 90) % 360)}
                            className="p-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Rotate 90 deg"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{rotation}°</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results Section Verification Checklist */}
                  <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500 block">Redaction Audit</span>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-gray-400">Aadhaar Bbox Scanning</span>
                        {detectionSuccess === "success" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">✅ Detected</span>
                        ) : detectionSuccess === "none" ? (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">⚠️ Manual Mode</span>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-600">Idle</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-gray-400">Digit Redaction ({maskFullDigits ? "All 12" : "First 8"})</span>
                        {overlays.length > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            ✅ Masked {overlays.some((o) => o.id.startsWith("manual-")) ? "(Manual)" : "(Auto)"}
                          </span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                            ❌ Not Masked
                          </span>
                        )}
                      </div>
                      {overlays.length === 0 && (
                        <div className="text-[10px] text-amber-700 dark:text-amber-400/90 font-bold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-xl mt-2 leading-relaxed">
                          ⚠️ Auto-detection could not locate the Aadhaar number. Please use manual mode: select "Redact (Hide)" above, then click and drag directly on the image to mask the numbers.
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-gray-400">Client Sandbox Compliance</span>
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">✅ Protected</span>
                      </div>
                    </div>

                    <div className="h-px bg-[#E6ECF5] dark:bg-white/5 w-full" />
                    
                    <div className="flex justify-between items-center text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
                      <span>Verification checklist validated</span>
                    </div>
                  </div>

                  {/* Exporter widget */}
                  <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500 block">Export Parameters</span>
                    
                    <div className="space-y-4">
                      {/* Format toggle */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">Export Format</label>
                        <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-1 rounded-xl">
                          {(["png", "jpg", "pdf"] as const).map((fmt) => (
                            <button
                              key={fmt}
                              onClick={() => setExportFormat(fmt)}
                              className={`py-2 px-1 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-colors ${
                                exportFormat === fmt
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              {fmt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={triggerDownload}
                        className="w-full flex items-center justify-center gap-2.5 px-6 py-4.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(37,99,235,0.25)] active:scale-98 cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Download masked document
                      </button>

                      <div className="flex justify-between items-center text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider">
                        <span>Est size: <span className="text-slate-700 dark:text-gray-400">{downloadSizeInfo || "Calculating..."}</span></span>
                        <button
                          onClick={resetAll}
                          className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3 h-3" /> Reset Workspace
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Security Privacy Banner */}
        <div className="border-t border-[#E6ECF5] dark:border-white/5 p-6 bg-[#FBFCFE] dark:bg-white/[0.01]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Absolute Client-Side Document Security</h4>
              <p className="text-[10px] text-slate-600 dark:text-gray-500 font-semibold leading-relaxed">
                Your files never leave your device. All OCR character scanning, mask rendering, blurs, and PDF compilation are executed 100% locally in your web browser. Completely safe to use offline.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-5xl mx-auto border-t border-[#E6ECF5] dark:border-white/5 pt-20">
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="bg-[#FBFCFE] dark:bg-white/[0.02] p-7 rounded-3xl border border-[#E6ECF5] dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-12 h-12 text-slate-900 dark:text-white" />
            </div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Auto Aadhaar Detection</h4>
            <p className="text-xs text-slate-600 dark:text-gray-500 leading-relaxed font-semibold group-hover:text-slate-800 dark:group-hover:text-gray-400 transition-colors font-sans">
              Dynamic character scanning locates your 12-digit layout bounds and automatically masks numbers correctly.
            </p>
          </div>

          <div className="bg-[#FBFCFE] dark:bg-white/[0.02] p-7 rounded-3xl border border-[#E6ECF5] dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <Scissors className="w-12 h-12 text-slate-900 dark:text-white" />
            </div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Scissors className="w-5.5 h-5.5" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Custom Blurs & QR Hiding</h4>
            <p className="text-xs text-slate-600 dark:text-gray-500 leading-relaxed font-semibold group-hover:text-slate-800 dark:group-hover:text-gray-400 transition-colors font-sans">
              Draw custom regions to hide portrait images, addresses, or apply pixelated overlays on Aadhaar QR barcodes.
            </p>
          </div>

          <div className="bg-[#FBFCFE] dark:bg-white/[0.02] p-7 rounded-3xl border border-[#E6ECF5] dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-12 h-12 text-slate-900 dark:text-white" />
            </div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Watermark Protection</h4>
            <p className="text-xs text-slate-600 dark:text-gray-500 leading-relaxed font-semibold group-hover:text-slate-800 dark:group-hover:text-gray-400 transition-colors font-sans">
              Overlay diagonal semi-transparent secure indicators to identify your files for standard KYC verifications.
            </p>
          </div>
        </div>
      </div>

      {/* Trust badging center */}
      <div className="max-w-5xl mx-auto pt-10 border-t border-[#E6ECF5] dark:border-white/5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-2xl p-4 hover:border-blue-500/30 text-center flex flex-col items-center justify-center shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">100% Private</span>
          </div>
          <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-2xl p-4 hover:border-purple-500/30 text-center flex flex-col items-center justify-center shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">Browser Process</span>
          </div>
          <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-2xl p-4 hover:border-amber-500/30 text-center flex flex-col items-center justify-center shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">No Upload</span>
          </div>
          <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-2xl p-4 hover:border-emerald-500/30 text-center flex flex-col items-center justify-center shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">Secure Masking</span>
          </div>
          <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-2xl p-4 hover:border-sky-500/30 text-center flex flex-col items-center justify-center shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">Instant Process</span>
          </div>
        </div>
      </div>

      {/* Deep Dive SEO Guide Article container */}
      {seoArticle}
    </div>
  );
}

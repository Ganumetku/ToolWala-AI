"use client";

import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  FileText, Download, UploadCloud, Trash2,
  AlertCircle, CheckCircle, RefreshCw, Info,
  ChevronLeft, Type, Plus, Minus, Shield, X,
  ZoomIn, ZoomOut, Edit3, PlusCircle, Check, Undo2, Redo2,
  MousePointer, Image as ImageIcon, Paintbrush, Highlighter,
  Square, Circle, ArrowUpRight, CheckSquare, Settings,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Copy, Eye, Trash, Sparkles, Search, ChevronRight
} from 'lucide-react';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';
import SignatureModal from './SignatureModal';

const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 60, 72];
interface PageItem {
  id: string; // unique virtual page ID
  originalPageNum: number; // 1-based index mapping to PDF.js page
}

interface TextBoxInfo {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  originalPdfX: number;
  originalPdfY: number;
  originalPdfWidth: number;
  originalPdfHeight: number;
  originalPdfFontSize: number;
  replacedText?: string;
  replacedColor?: string;
}

// Utility: convert rgba string back to hex
const rgbaToHex = (rgbaStr: string): string => {
  try {
    const match = rgbaStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#fbbf24';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  } catch (e) {
    return '#fbbf24';
  }
};

// Utility: convert hex to rgb
const hexToRgb = (hex: string) => {
  try {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
    return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  } catch (e) {
    return rgb(0, 0, 0);
  }
};

// Utility: convert hex to rgba string for Fabric highlighter
const hexToRgbaStr = (hex: string, opacity: number) => {
  try {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return `rgba(${r || 0}, ${g || 0}, ${b || 0}, ${opacity})`;
  } catch (e) {
    return `rgba(0, 0, 0, ${opacity})`;
  }
};

// Text wrapping utility for pdf-lib text drawing
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

// Helper to extract text color from background canvas
const detectTextColorFromCanvas = (canvas: HTMLCanvasElement | null, box: any, scale: number): string => {
  if (!canvas) return '#0b2c8c';
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#0b2c8c';

    // Bounding box in canvas pixels
    const x = box.x * scale;
    const y = box.y * scale;
    const w = box.width * scale;
    const h = box.height * scale;

    // Sample a grid of pixels inside the box
    const samplePoints: { r: number; g: number; b: number; L: number }[] = [];
    const steps = 6;
    for (let i = 1; i < steps; i++) {
      for (let j = 1; j < steps; j++) {
        const px = x + (w * i) / steps;
        const py = y + (h * j) / steps;
        if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
          const imgData = ctx.getImageData(Math.floor(px), Math.floor(py), 1, 1).data;
          const r = imgData[0];
          const g = imgData[1];
          const b = imgData[2];
          const a = imgData[3];
          if (a > 0) {
            // Calculate luminance: 0.299R + 0.587G + 0.114B
            const L = 0.299 * r + 0.587 * g + 0.114 * b;
            samplePoints.push({ r, g, b, L });
          }
        }
      }
    }

    if (samplePoints.length === 0) return '#0b2c8c';

    // We want to find the text pixels (darker than the background).
    // Filter out pixels that are too close to white (L > 235) to avoid background pixels.
    const textPixels = samplePoints.filter(p => p.L < 235);
    if (textPixels.length === 0) {
      return '#0b2c8c'; // default navy
    }

    // Sort by luminance (darkest first)
    textPixels.sort((a, b) => a.L - b.L);
    const best = textPixels[0];

    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(best.r)}${toHex(best.g)}${toHex(best.b)}`;
  } catch (e) {
    console.error("Failed to detect text color from canvas", e);
    return '#0b2c8c';
  }
};

export default function EditPdfPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [fabricLib, setFabricLib] = useState<any>(null);

  // File States
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const pdfDocRef = useRef<any>(null);
  
  // Page lists & virtual page lists
  const [pageList, setPageList] = useState<PageItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<Record<number, { width: number; height: number }>>({});
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<number, string>>({});

  // Global Editor State
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<string>('select');
  const [zoomIndex, setZoomIndex] = useState<number>(2); // Default to 1.0 (ZOOM_LEVELS[2])
  
  // Formatting / Drawing Properties
  const [strokeColor, setStrokeColor] = useState<string>('#3b82f6'); // neon blue
  const [fillColor, setFillColor] = useState<string>('transparent');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [brushWidth, setBrushWidth] = useState<number>(5);
  const [fontFamily, setFontFamily] = useState<string>('Helvetica');
  const [fontSize, setFontSize] = useState<number>(16);

  // Canvas Instances & Saved States
  const canvasInstances = useRef<Record<string, any>>({});
  const [canvasStates, setCanvasStates] = useState<Record<string, any>>({});
  const [originalTexts, setOriginalTexts] = useState<Record<number, TextBoxInfo[]>>({});

  // History Manager
  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Modal / Signatures
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Selected Object Properties
  const [selectedObjectInfo, setSelectedObjectInfo] = useState<any | null>(null);

  // Search & Replace States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{
    pageId: string;
    originalPageNum: number;
    boxId: string;
    text: string;
    index: number;
  }[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'properties' | 'search'>('properties');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

  // UI state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const zoomScale = ZOOM_LEVELS[zoomIndex];

  // Dynamic Client-side loading
  useEffect(() => {
    setIsMounted(true);
    const initLibraries = async () => {
      try {
        const pLib = await import('pdfjs-dist');
        pLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pLib.version}/build/pdf.worker.min.mjs`;
        setPdfjs(pLib);

        const fLib = await import('fabric');
        setFabricLib(fLib.fabric);
      } catch (err) {
        console.error("Failed to load rendering engine libraries", err);
        setError("Failed to load PDF core rendering libraries.");
      }
    };
    initLibraries();
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Search logic
  useEffect(() => {
    if (!debouncedSearchQuery.trim() || pageList.length === 0) {
      setSearchResults([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const matches: any[] = [];
    const query = debouncedSearchQuery.toLowerCase();

    pageList.forEach((pageItem) => {
      // 1. Check if canvas state is already loaded/saved
      const state = canvasStates[pageItem.id];
      if (state && state.objects) {
        state.objects.forEach((obj: any) => {
          if ((obj.type === 'textbox' || obj.type === 'i-text') && obj.text) {
            const txt = obj.text.toLowerCase();
            let idx = txt.indexOf(query);
            while (idx !== -1) {
              matches.push({
                pageId: pageItem.id,
                originalPageNum: pageItem.originalPageNum,
                boxId: obj.id,
                text: obj.text,
                index: idx
              });
              idx = txt.indexOf(query, idx + 1);
            }
          }
        });
      } else {
        // 2. Check originalTexts
        const boxes = originalTexts[pageItem.originalPageNum] || [];
        boxes.forEach((box: any) => {
          const displayText = box.replacedText !== undefined ? box.replacedText : box.text;
          if (displayText) {
            const txt = displayText.toLowerCase();
            let idx = txt.indexOf(query);
            while (idx !== -1) {
              matches.push({
                pageId: pageItem.id,
                originalPageNum: pageItem.originalPageNum,
                boxId: box.id,
                text: displayText,
                index: idx
              });
              idx = txt.indexOf(query, idx + 1);
            }
          }
        });
      }
    });

    setSearchResults(matches);
    setCurrentMatchIndex(matches.length > 0 ? 0 : -1);
  }, [debouncedSearchQuery, canvasStates, originalTexts, pageList]);

  const focusMatch = (match: any) => {
    const { pageId, boxId } = match;
    handlePageThumbClick(pageId);

    setTimeout(() => {
      const canvas = canvasInstances.current[pageId];
      if (canvas) {
        const obj = canvas.getObjects().find((o: any) => o.id === boxId);
        if (obj) {
          canvas.setActiveObject(obj);
          canvas.requestRenderAll();
        }
      }
    }, 200);
  };

  const handleNextMatch = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchResults.length;
    setCurrentMatchIndex(nextIdx);
    focusMatch(searchResults[nextIdx]);
  };

  const handlePrevMatch = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentMatchIndex(prevIdx);
    focusMatch(searchResults[prevIdx]);
  };

  const handleReplace = () => {
    if (currentMatchIndex === -1 || searchResults.length === 0) return;
    const match = searchResults[currentMatchIndex];
    const { pageId, originalPageNum, boxId } = match;

    const regex = new RegExp(debouncedSearchQuery, 'i');
    const newText = match.text.replace(regex, replaceQuery);

    const canvas = canvasInstances.current[pageId];
    if (canvas) {
      const obj = canvas.getObjects().find((o: any) => o.id === boxId);
      if (obj) {
        obj.set('text', newText);
        if (obj.isOriginalText) {
          const detectedColor = obj.originalTextData?.detectedColor || '#0b2c8c';
          obj.set({
            fill: obj.fill === 'transparent' ? detectedColor : obj.fill,
            backgroundColor: 'transparent',
            stroke: 'transparent'
          });
        }
        canvas.requestRenderAll();
        canvas.fire('object:modified');
      }
    } else {
      const state = canvasStates[pageId];
      if (state && state.objects) {
        const updatedObjects = state.objects.map((obj: any) => {
          if (obj.id === boxId) {
            const isOriginal = obj.isOriginalText;
            const detectedColor = obj.originalTextData?.detectedColor || '#0b2c8c';
            return {
              ...obj,
              text: newText,
              fill: isOriginal ? (obj.fill === 'transparent' ? detectedColor : obj.fill) : obj.fill,
              backgroundColor: 'transparent'
            };
          }
          return obj;
        });
        const updatedState = { ...state, objects: updatedObjects };
        setCanvasStates((prev) => ({ ...prev, [pageId]: updatedState }));
      } else {
        setOriginalTexts((prev) => {
          const pageBoxes = prev[originalPageNum] || [];
          const updatedBoxes = pageBoxes.map((box: any) => {
            if (box.id === boxId) {
              return {
                ...box,
                replacedText: newText
              };
            }
            return box;
          });
          return { ...prev, [originalPageNum]: updatedBoxes };
        });
      }
    }

    setSuccess("Replaced match successfully.");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleReplaceAll = () => {
    if (searchResults.length === 0) return;
    setIsProcessing(true);
    setProcessingStatus('Performing replace all...');

    const query = debouncedSearchQuery.toLowerCase();
    const regex = new RegExp(debouncedSearchQuery, 'gi');

    const matchesByPage: Record<string, any[]> = {};
    searchResults.forEach((m) => {
      if (!matchesByPage[m.pageId]) matchesByPage[m.pageId] = [];
      matchesByPage[m.pageId].push(m);
    });

    setOriginalTexts((prevOriginal) => {
      const updatedOriginal = { ...prevOriginal };

      setCanvasStates((prevStates) => {
        const updatedStates = { ...prevStates };

        pageList.forEach((pageItem) => {
          const pageMatches = matchesByPage[pageItem.id];
          if (!pageMatches) return;

          const canvas = canvasInstances.current[pageItem.id];
          if (canvas) {
            let canvasModified = false;
            canvas.getObjects().forEach((obj: any) => {
              if ((obj.type === 'textbox' || obj.type === 'i-text') && obj.text) {
                if (obj.text.toLowerCase().includes(query)) {
                  const updatedText = obj.text.replace(regex, replaceQuery);
                  obj.set('text', updatedText);
                  if (obj.isOriginalText) {
                    const detectedColor = obj.originalTextData?.detectedColor || '#0b2c8c';
                    obj.set({
                      fill: obj.fill === 'transparent' ? detectedColor : obj.fill,
                      backgroundColor: 'transparent',
                      stroke: 'transparent'
                    });
                  }
                  canvasModified = true;
                }
              }
            });
            if (canvasModified) {
              canvas.requestRenderAll();
              const state = canvas.toJSON(['id', 'isOriginalText', 'originalTextData', 'isDeletedOriginal']);
              updatedStates[pageItem.id] = state;
            }
          } else {
            const state = updatedStates[pageItem.id];
            if (state && state.objects) {
              const updatedObjects = state.objects.map((obj: any) => {
                if ((obj.type === 'textbox' || obj.type === 'i-text') && obj.text && obj.text.toLowerCase().includes(query)) {
                  const isOriginal = obj.isOriginalText;
                  const detectedColor = obj.originalTextData?.detectedColor || '#0b2c8c';
                  return {
                    ...obj,
                    text: obj.text.replace(regex, replaceQuery),
                    fill: isOriginal ? (obj.fill === 'transparent' ? detectedColor : obj.fill) : obj.fill,
                    backgroundColor: 'transparent'
                  };
                }
                return obj;
              });
              updatedStates[pageItem.id] = { ...state, objects: updatedObjects };
            } else {
              const pageBoxes = updatedOriginal[pageItem.originalPageNum] || [];
              const updatedBoxes = pageBoxes.map((box: any) => {
                const textToCheck = box.replacedText !== undefined ? box.replacedText : box.text;
                if (textToCheck && textToCheck.toLowerCase().includes(query)) {
                  return {
                    ...box,
                    replacedText: textToCheck.replace(regex, replaceQuery)
                  };
                }
                return box;
              });
              updatedOriginal[pageItem.originalPageNum] = updatedBoxes;
            }
          }
        });

        return updatedStates;
      });

      return updatedOriginal;
    });

    setIsProcessing(false);
    setSuccess(`Successfully replaced all ${searchResults.length} occurrences.`);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleHighlightSelectedText = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const left = activeObj.left;
    const top = activeObj.top;
    const width = activeObj.width * (activeObj.scaleX || 1);
    const height = activeObj.height * (activeObj.scaleY || 1);
    const angle = activeObj.angle || 0;

    const highlightBox = new fabricLib.Rect({
      left: left,
      top: top,
      width: width,
      height: height,
      angle: angle,
      fill: hexToRgbaStr(strokeColor || '#fbbf24', 0.4),
      stroke: 'transparent',
      strokeWidth: 0,
      isHighlight: true,
      borderColor: '#3b82f6',
      cornerColor: '#3b82f6',
      cornerSize: 8,
      transparentCorners: false
    });

    canvas.add(highlightBox);
    highlightBox.sendToBack();
    canvas.discardActiveObject();
    canvas.setActiveObject(highlightBox);
    canvas.requestRenderAll();
    canvas.fire('object:modified');

    setSuccess("Selected text highlighted.");
    setTimeout(() => setSuccess(null), 3000);
  };

  // Global keyboard shortcuts (Undo, Redo, Delete)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey;

      // Cmd+Z / Ctrl+Z -> Undo
      if (modifierPressed && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Cmd+Shift+Z / Ctrl+Shift+Z or Cmd+Y / Ctrl+Y -> Redo
      if (
        (modifierPressed && e.key.toLowerCase() === 'z' && e.shiftKey) ||
        (modifierPressed && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }

      // Delete/Backspace -> Delete active object
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const canvas = getActiveCanvas();
        if (canvas && canvas.getActiveObject()) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [historyIndex, history, activePageId]);

  // Sync scroll left page highlighted thumb
  const handleWorkspaceScroll = () => {
    if (!workspaceRef.current || pageList.length === 0) return;
    const scrollContainer = workspaceRef.current;
    const containerTop = scrollContainer.getBoundingClientRect().top;
    const containerHeight = scrollContainer.clientHeight;
    const containerCenter = containerTop + containerHeight / 2;

    let closestPageId = activePageId;
    let minDistance = Infinity;

    pageList.forEach((item) => {
      const el = document.getElementById(`page-wrapper-${item.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const pageCenter = rect.top + rect.height / 2;
        const distance = Math.abs(pageCenter - containerCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestPageId = item.id;
        }
      }
    });

    if (closestPageId && closestPageId !== activePageId) {
      setActivePageId(closestPageId);
    }
  };

  const handlePageThumbClick = (pageId: string) => {
    const el = document.getElementById(`page-wrapper-${pageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setActivePageId(pageId);
  };

  // Setup PDF text detection
  const detectOriginalText = async (page: any, pageNum: number, viewport: any) => {
    try {
      const textContent = await page.getTextContent();
      if (textContent.items.length === 0) return [];

      const rawItems = textContent.items as any[];
      const validItems = rawItems
        .filter(item => item && typeof item.str === 'string' && item.str.trim().length > 0)
        .map(item => ({
          str: item.str,
          transform: item.transform,
          width: item.width || 0,
          height: item.height || item.transform[3] || 10
        }));

      if (validItems.length === 0) return [];

      // Merge baseline text items
      const merged: any[] = [];
      let current = { ...validItems[0] };

      for (let i = 1; i < validItems.length; i++) {
        const item = validItems[i];
        const currT = current.transform;
        const itemT = item.transform;
        
        const sameLine = Math.abs(currT[5] - itemT[5]) < 2;
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

      // Map to viewport
      return merged.map((item, idx) => {
        const tx = item.transform[4];
        const ty = item.transform[5];
        const fontSizePdf = item.transform[3];
        const widthPdf = item.width;

        // Viewport scale 1.0 translates
        const [vx, vy] = viewport.convertToViewportPoint(tx, ty);
        const boxHeight = fontSizePdf;
        const boxWidth = widthPdf > 0 ? widthPdf : (fontSizePdf * 0.55 * item.str.length);

        return {
          id: `orig_${pageNum}_${idx}_${Date.now()}`,
          text: item.str,
          x: vx,
          y: vy - boxHeight,
          width: boxWidth,
          height: boxHeight * 1.15,
          fontSize: fontSizePdf,
          originalPdfX: tx,
          originalPdfY: ty,
          originalPdfWidth: widthPdf > 0 ? widthPdf : (fontSizePdf * 0.55 * item.str.length),
          originalPdfHeight: fontSizePdf,
          originalPdfFontSize: fontSizePdf
        };
      });
    } catch (e) {
      console.error(`Text extraction failed for page ${pageNum}`, e);
      return [];
    }
  };

  // Thumbnail generation
  const generateThumbnails = async (doc: any) => {
    const thumbs: Record<number, string> = {};
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
          thumbs[i] = canvas.toDataURL();
        }
      } catch (err) {
        console.error(`Thumbnail failed for page ${i}`, err);
      }
    }
    setThumbnailUrls(thumbs);
  };

  // File loading
  const loadPdfFile = (file: File) => {
    setPdfFile(file);
    setIsProcessing(true);
    setProcessingStatus('Reading PDF file structure...');
    setError(null);
    setSuccess(null);
    setPageList([]);
    setPageDimensions({});
    setCanvasStates({});
    setHistory([]);
    setHistoryIndex(-1);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        setPdfBytes(bytes);

        const loadingTask = pdfjs.getDocument({ data: bytes.slice() });
        const doc = await loadingTask.promise;
        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);

        const dimensions: Record<number, { width: number; height: number }> = {};
        const textCache: Record<number, TextBoxInfo[]> = {};
        const initialPages: PageItem[] = [];

        for (let i = 1; i <= doc.numPages; i++) {
          setProcessingStatus(`Extracting page dimensions & text elements: ${i}/${doc.numPages}`);
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 1.0 });
          dimensions[i] = { width: viewport.width, height: viewport.height };
          initialPages.push({ id: `page_${i}_${Date.now()}`, originalPageNum: i });

          const textItems = await detectOriginalText(page, i, viewport);
          textCache[i] = textItems;
        }

        setPageDimensions(dimensions);
        setOriginalTexts(textCache);
        setPageList(initialPages);
        setActivePageId(initialPages[0].id);

        setProcessingStatus('Generating page list thumbnails...');
        await generateThumbnails(doc);
      } catch (err) {
        console.error(err);
        setError("Invalid PDF file or failed to read document contents.");
        setPdfFile(null);
        setPdfBytes(null);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Zoom Operations
  const handleZoomOut = () => {
    if (zoomIndex > 0) setZoomIndex(zoomIndex - 1);
  };
  const handleZoomIn = () => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) setZoomIndex(zoomIndex + 1);
  };

  // Object addition helpers
  const getActiveCanvas = () => {
    const pageId = activePageId || pageList[0]?.id;
    if (!pageId) return null;
    return canvasInstances.current[pageId];
  };

  const insertObjectOnActiveCanvas = (obj: any) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    // center positioning
    const center = canvas.getCenter();
    obj.set({
      left: center.left / zoomScale,
      top: center.top / zoomScale
    });
    
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    
    // trigger modified state save
    canvas.fire('object:modified');
  };

  const handleAddText = () => {
    if (!fabricLib) return;
    const text = new fabricLib.Textbox('Double click to edit text...', {
      width: 200,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: strokeColor === 'transparent' ? '#000000' : strokeColor,
      borderColor: '#3b82f6',
      cornerColor: '#3b82f6',
      cornerSize: 8,
      transparentCorners: false,
      lockScalingY: true
    });
    insertObjectOnActiveCanvas(text);
    setEditMode('select');
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fabricLib || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        fabricLib.Image.fromURL(event.target.result as string, (img: any) => {
          // Resize image to fit nicely
          const maxDim = 150;
          if (img.width > maxDim || img.height > maxDim) {
            img.scaleToWidth(maxDim);
          }
          img.set({
            borderColor: '#3b82f6',
            cornerColor: '#3b82f6',
            cornerSize: 8,
            transparentCorners: false
          });
          insertObjectOnActiveCanvas(img);
        });
      }
    };
    reader.readAsDataURL(file);
    if (imageUploadRef.current) imageUploadRef.current.value = '';
    setEditMode('select');
  };

  const handleAddShape = (shapeType: 'rect' | 'circle' | 'line' | 'arrow' | 'highlight') => {
    if (!fabricLib) return;
    let shape: any;
    
    const fill = fillColor === 'transparent' ? 'transparent' : fillColor;
    const stroke = strokeColor;
    
    if (shapeType === 'rect') {
      shape = new fabricLib.Rect({
        width: 100,
        height: 60,
        fill,
        stroke,
        strokeWidth,
        borderColor: '#3b82f6',
        cornerColor: '#3b82f6',
        cornerSize: 8,
        transparentCorners: false
      });
    } else if (shapeType === 'circle') {
      shape = new fabricLib.Circle({
        radius: 40,
        fill,
        stroke,
        strokeWidth,
        borderColor: '#3b82f6',
        cornerColor: '#3b82f6',
        cornerSize: 8,
        transparentCorners: false
      });
    } else if (shapeType === 'line') {
      shape = new fabricLib.Line([0, 0, 100, 0], {
        stroke,
        strokeWidth,
        borderColor: '#3b82f6',
        cornerColor: '#3b82f6',
        cornerSize: 8,
        transparentCorners: false
      });
    } else if (shapeType === 'arrow') {
      shape = new fabricLib.Path('M 0 0 L 80 0 M 80 0 L 65 -8 M 80 0 L 65 8', {
        stroke,
        strokeWidth,
        fill: 'transparent',
        borderColor: '#3b82f6',
        cornerColor: '#3b82f6',
        cornerSize: 8,
        transparentCorners: false
      });
    } else if (shapeType === 'highlight') {
      shape = new fabricLib.Rect({
        width: 120,
        height: 24,
        fill: hexToRgbaStr(strokeColor || '#fbbf24', 0.4),
        stroke: 'transparent',
        strokeWidth: 0,
        isHighlight: true,
        borderColor: '#3b82f6',
        cornerColor: '#3b82f6',
        cornerSize: 8,
        transparentCorners: false
      });
    }
    
    if (shape) {
      insertObjectOnActiveCanvas(shape);
      setEditMode('select');
    }
  };

  // Add signature image from modal
  const handleSaveSignature = (sigUrl: string) => {
    if (!fabricLib) return;
    fabricLib.Image.fromURL(sigUrl, (img: any) => {
      img.scaleToWidth(180);
      img.set({
        borderColor: '#3b82f6',
        cornerColor: '#3b82f6',
        cornerSize: 8,
        transparentCorners: false
      });
      insertObjectOnActiveCanvas(img);
    });
  };

  // History tracking state saves
  const handleCanvasStateUpdate = (pageId: string, stateJSON: any) => {
    setCanvasStates((prev) => {
      const updated = { ...prev, [pageId]: stateJSON };
      
      // Update global history
      setHistory((historyPrev) => {
        const nextHist = historyPrev.slice(0, historyIndex + 1);
        nextHist.push(updated);
        setHistoryIndex(nextHist.length - 1);
        return nextHist;
      });

      return updated;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const prevStates = history[prevIdx];
      setCanvasStates(prevStates);

      Object.entries(canvasInstances.current).forEach(([pageId, canvas]: [string, any]) => {
        const state = prevStates[pageId];
        if (state) {
          canvas.loadFromJSON(state, () => {
            canvas.renderAll();
          });
        } else {
          canvas.clear();
        }
      });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const nextStates = history[nextIdx];
      setCanvasStates(nextStates);

      Object.entries(canvasInstances.current).forEach(([pageId, canvas]: [string, any]) => {
        const state = nextStates[pageId];
        if (state) {
          canvas.loadFromJSON(state, () => {
            canvas.renderAll();
          });
        } else {
          canvas.clear();
        }
      });
    }
  };

  // Delete Object
  const handleDeleteSelected = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    if (activeObj.isOriginalText) {
      activeObj.set({ isDeletedOriginal: true, opacity: 0, selectable: false });
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      canvas.fire('object:modified');
    } else {
      canvas.remove(activeObj);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
    setSelectedObjectInfo(null);
  };

  // Property customizer functions
  const changeSelectedProperty = (key: string, value: any) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    if (key === 'fill' && activeObj.isHighlight) {
      const cleanHex = value.startsWith('#') ? value : '#fbbf24';
      let op = 0.4;
      if (activeObj.fill && activeObj.fill.startsWith('rgba')) {
        const match = activeObj.fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (match) op = parseFloat(match[4]);
      }
      activeObj.set(key, hexToRgbaStr(cleanHex, op));
    } else if (key === 'opacity' && activeObj.isHighlight) {
      activeObj.set('opacity', 1.0);
      if (activeObj.fill && activeObj.fill.startsWith('rgba')) {
        const match = activeObj.fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = match[1], g = match[2], b = match[3];
          activeObj.set('fill', `rgba(${r}, ${g}, ${b}, ${value})`);
        }
      } else {
        const hex = activeObj.fill || '#fbbf24';
        activeObj.set('fill', hexToRgbaStr(hex, value));
      }
    } else {
      activeObj.set(key, value);
    }
    canvas.requestRenderAll();
    canvas.fire('object:modified');

    setSelectedObjectInfo((prev: any) => ({ ...prev, [key]: value }));
  };

  // Send back/front layer adjustments
  const adjustLayer = (action: 'front' | 'back' | 'forward' | 'backward') => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    if (action === 'front') activeObj.bringToFront();
    else if (action === 'back') activeObj.sendToBack();
    else if (action === 'forward') activeObj.bringForward();
    else if (action === 'backward') activeObj.sendBackward();

    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  // Page Operations
  const handleDuplicatePage = (idx: number) => {
    setPageList((prev) => {
      const duplicated = [...prev];
      const sourcePage = duplicated[idx];
      const newPageItem = {
        id: `page_${sourcePage.originalPageNum}_dup_${Date.now()}`,
        originalPageNum: sourcePage.originalPageNum
      };
      
      // Copy Canvas State if it exists
      const sourceState = canvasStates[sourcePage.id];
      if (sourceState) {
        setCanvasStates((prevStates) => ({
          ...prevStates,
          [newPageItem.id]: JSON.parse(JSON.stringify(sourceState))
        }));
      }

      duplicated.splice(idx + 1, 0, newPageItem);
      return duplicated;
    });
    setSuccess("Page duplicated successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeletePage = (idx: number) => {
    if (pageList.length <= 1) {
      setError("Cannot delete the only page in the document.");
      setTimeout(() => setError(null), 3500);
      return;
    }

    setPageList((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      // set active page if deleted active
      if (activePageId === prev[idx].id) {
        setActivePageId(updated[Math.max(0, idx - 1)].id);
      }
      return updated;
    });
    setSuccess("Page deleted from workspace.");
    setTimeout(() => setSuccess(null), 3000);
  };

  // SVG coordinate projection helper
  const convertPathToPdfSpace = (obj: any, pdfPageHeight: number) => {
    const originX = obj.originX || 'left';
    const originY = obj.originY || 'top';
    const scaleX = obj.scaleX || 1;
    const scaleY = obj.scaleY || 1;
    const pathOffset = obj.pathOffset || { x: 0, y: 0 };
    const width = obj.width || 0;
    const height = obj.height || 0;

    const centerX = originX === 'left' ? obj.left + (width * scaleX) / 2 : obj.left;
    const centerY = originY === 'top' ? obj.top + (height * scaleY) / 2 : obj.top;

    const pdfPathSegments = obj.path.map((seg: any) => {
      const cmd = seg[0];
      if (cmd === 'M' || cmd === 'L') {
        const px = seg[1];
        const py = seg[2];
        const absX = centerX + (px - pathOffset.x) * scaleX;
        const absY = centerY + (py - pathOffset.y) * scaleY;
        return [cmd, absX, pdfPageHeight - absY];
      } else if (cmd === 'C') {
        const px1 = seg[1], py1 = seg[2];
        const px2 = seg[3], py2 = seg[4];
        const px3 = seg[5], py3 = seg[6];
        const absX1 = centerX + (px1 - pathOffset.x) * scaleX;
        const absY1 = centerY + (py1 - pathOffset.y) * scaleY;
        const absX2 = centerX + (px2 - pathOffset.x) * scaleX;
        const absY2 = centerY + (py2 - pathOffset.y) * scaleY;
        const absX3 = centerX + (px3 - pathOffset.x) * scaleX;
        const absY3 = centerY + (py3 - pathOffset.y) * scaleY;
        return [
          cmd, 
          absX1, pdfPageHeight - absY1, 
          absX2, pdfPageHeight - absY2, 
          absX3, pdfPageHeight - absY3
        ];
      } else if (cmd === 'Q') {
        const px1 = seg[1], py1 = seg[2];
        const px2 = seg[3], py2 = seg[4];
        const absX1 = centerX + (px1 - pathOffset.x) * scaleX;
        const absY1 = centerY + (py1 - pathOffset.y) * scaleY;
        const absX2 = centerX + (px2 - pathOffset.x) * scaleX;
        const absY2 = centerY + (py2 - pathOffset.y) * scaleY;
        return [
          cmd, 
          absX1, pdfPageHeight - absY1, 
          absX2, pdfPageHeight - absY2
        ];
      }
      return seg;
    });

    return pdfPathSegments.map((seg: any) => seg.join(' ')).join(' ');
  };

  // Rebuild and Download PDF via pdf-lib
  const handleExportPDF = async () => {
    if (!pdfBytes || pageList.length === 0 || !pdfjs || !fabricLib) return;

    setIsProcessing(true);
    setProcessingStatus('Starting high-resolution flattening export...');
    setError(null);
    setSuccess(null);

    // Helper to convert base64 DataURL to Uint8Array for pdf-lib
    const dataUrlToUint8Array = (dataUrl: string): Uint8Array => {
      const base64 = dataUrl.split(',')[1];
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    };

    try {
      const newDoc = await PDFDocument.create();
      // Load original PDF using pdf-lib to copy unedited pages
      const originalPdfDoc = await PDFDocument.load(pdfBytes);
      const doc = pdfDocRef.current;
      const renderScale = 2.0; // 144 DPI high-res scale factor (retina quality)

      for (let idx = 0; idx < pageList.length; idx++) {
        const pageItem = pageList[idx];
        setProcessingStatus(`Flattening page ${idx + 1} of ${pageList.length}...`);
        
        const dimensions = pageDimensions[pageItem.originalPageNum] || { width: 595, height: 842 };
        const width = dimensions.width;
        const height = dimensions.height;

        // Check if page actually has changes
        const liveCanvas = canvasInstances.current[pageItem.id];
        let state = canvasStates[pageItem.id];
        if (liveCanvas) {
          liveCanvas.discardActiveObject();
          liveCanvas.requestRenderAll();
          state = liveCanvas.toJSON(['id', 'isOriginalText', 'originalTextData', 'isDeletedOriginal']);
        }
        let hasChanges = false;
        if (state) {
          const objects = state.objects || [];
          for (const obj of objects) {
            if (obj.isOriginalText) {
              const isEdited = obj.isDeletedOriginal || 
                               obj.text !== obj.originalTextData.text ||
                               Math.abs(obj.left - obj.originalTextData.x) > 0.5 ||
                               Math.abs(obj.top - obj.originalTextData.y) > 0.5 ||
                               obj.fontSize !== obj.originalTextData.fontSize;
              if (isEdited) {
                hasChanges = true;
                break;
              }
            } else {
              // User-added drawings, shapes, text, or images are changes
              hasChanges = true;
              break;
            }
          }
        }

        // If page is unmodified, copy the original page to keep vector layout & small file size
        if (!hasChanges) {
          const [copiedPage] = await newDoc.copyPages(originalPdfDoc, [pageItem.originalPageNum - 1]);
          newDoc.addPage(copiedPage);
          continue;
        }

        // 1. Get original page background via PDF.js rendering
        const page = await doc.getPage(pageItem.originalPageNum);
        
        // 2. Render PDF page background on high-res temporary canvas in memory
        const tempPdfCanvas = document.createElement('canvas');
        tempPdfCanvas.width = width * renderScale;
        tempPdfCanvas.height = height * renderScale;
        const tempPdfCtx = tempPdfCanvas.getContext('2d');
        
        if (tempPdfCtx) {
          tempPdfCtx.fillStyle = '#ffffff';
          tempPdfCtx.fillRect(0, 0, tempPdfCanvas.width, tempPdfCanvas.height);
          
          const viewport = page.getViewport({ scale: renderScale });
          await page.render({
            canvasContext: tempPdfCtx,
            viewport: viewport,
          }).promise;
        }

        if (liveCanvas) {
          // 3a. Set correct visibility and styles for original text boxes on the live canvas
          liveCanvas.forEachObject((obj: any) => {
            if (obj.isOriginalText) {
              const isEdited = obj.isDeletedOriginal || 
                               obj.text !== obj.originalTextData.text ||
                               Math.abs(obj.left - obj.originalTextData.x) > 0.5 ||
                               Math.abs(obj.top - obj.originalTextData.y) > 0.5 ||
                               obj.fontSize !== obj.originalTextData.fontSize;
              if (obj.isDeletedOriginal) {
                obj.set({ opacity: 0 }); // hide completely
              } else if (isEdited) {
                obj.set({
                  fill: obj.fill === 'transparent' ? (obj.originalTextData?.detectedColor || '#0b2c8c') : obj.fill,
                  backgroundColor: 'transparent', // transparent because background is whited out
                  stroke: 'transparent'
                });
              } else {
                obj.set({
                  fill: 'transparent',
                  backgroundColor: 'transparent',
                  stroke: 'transparent'
                }); // unedited: invisible
              }
            }
          });
          liveCanvas.requestRenderAll();

          // 3b. Erase original text areas on the PDF canvas context directly first
          liveCanvas.forEachObject((obj: any) => {
            if (obj.isOriginalText) {
              const isEdited = obj.isDeletedOriginal || 
                               obj.text !== obj.originalTextData.text ||
                               Math.abs(obj.left - obj.originalTextData.x) > 0.5 ||
                               Math.abs(obj.top - obj.originalTextData.y) > 0.5 ||
                               obj.fontSize !== obj.originalTextData.fontSize;
              if (isEdited) {
                const orig = obj.originalTextData;
                const padX = 1; // horizontal padding
                const shrinkY = 1.5; // shrink vertically to prevent grid line erasure
                if (tempPdfCtx) {
                  tempPdfCtx.fillStyle = '#ffffff'; // erase with page background color (white)
                  tempPdfCtx.fillRect(
                    (orig.x - padX) * renderScale,
                    (orig.y + shrinkY) * renderScale,
                    (orig.width + padX * 2) * renderScale,
                    (orig.height - shrinkY * 2) * renderScale
                  );
                }
              }
            }
          });

          // 3c. Get high-resolution data URL of the Fabric overlay directly from liveCanvas
          const multiplier = renderScale / zoomScale;
          const overlayDataUrl = liveCanvas.toDataURL({
            format: 'png',
            multiplier: multiplier
          });

          // 3d. Draw the overlay onto the background canvas
          if (tempPdfCtx) {
            const overlayImg = await new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error("Failed to load overlay image"));
              img.src = overlayDataUrl;
            });
            tempPdfCtx.drawImage(overlayImg, 0, 0);
          }

          // 3e. Restore original texts transparent state in the editor UI
          liveCanvas.forEachObject((obj: any) => {
            if (obj.isOriginalText && !obj.isDeletedOriginal && obj.text === obj.originalTextData.text) {
              obj.set({
                fill: 'transparent',
                backgroundColor: 'rgba(255, 255, 255, 0.001)',
                stroke: 'transparent'
              });
            }
          });
          liveCanvas.requestRenderAll();
        }

        // 5. Convert to high-quality JPEG (95% quality) and add to PDF
        const imgData = tempPdfCanvas.toDataURL('image/jpeg', 0.95);
        const imgBytes = dataUrlToUint8Array(imgData);
        const embeddedImage = await newDoc.embedJpg(imgBytes);
        
        const newPage = newDoc.addPage([width, height]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width,
          height
        });
      }

      setProcessingStatus('Saving final file...');
      const finalBytes = await newDoc.save();

      // Download blob client-side
      const blob = new Blob([finalBytes as any], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `edited_${pdfFile?.name || 'document.pdf'}`;
      link.click();
      
      setSuccess("PDF flattened and exported successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error(err);
      setError("Failed to export PDF file. Error compiling pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPdfFile(null);
    setPdfBytes(null);
    pdfDocRef.current = null;
    setPageList([]);
    setPageDimensions({});
    setThumbnailUrls({});
    setCanvasStates({});
    setActivePageId(null);
    setSelectedObjectInfo(null);
    setZoomIndex(2); // 100%
    setError(null);
    setSuccess(null);
  };

  // Focus and Selection hooks from pages
  const handleFocusCanvas = (pageId: string, fbCanvas: any) => {
    setActivePageId(pageId);
    // Clear selection on all other canvases
    Object.entries(canvasInstances.current).forEach(([id, canvas]: [string, any]) => {
      if (id !== pageId && canvas) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    });
  };

  const handleObjectSelected = (pageId: string, activeObj: any) => {
    setActiveSidebarTab('properties');
    setSelectedObjectInfo({
      id: activeObj.id || 'annot',
      type: activeObj.type,
      text: activeObj.text || '',
      fontSize: activeObj.fontSize || fontSize,
      fontFamily: activeObj.fontFamily || fontFamily,
      fill: activeObj.fill || 'transparent',
      stroke: activeObj.stroke || '#000000',
      strokeWidth: activeObj.strokeWidth || 1,
      fontWeight: activeObj.fontWeight || 'normal',
      fontStyle: activeObj.fontStyle || 'normal',
      underline: activeObj.underline || false,
      textAlign: activeObj.textAlign || 'left',
      opacity: activeObj.opacity || 1,
      angle: activeObj.angle || 0,
      isOriginalText: activeObj.isOriginalText || false,
      isHighlight: activeObj.isHighlight || false,
      pageId
    });
  };

  const handleObjectCleared = () => {
    setSelectedObjectInfo(null);
  };

  if (!isMounted) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 font-bold font-sans">Initializing PDF Editor workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col font-sans select-none overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* 1. TOP APP BAR TOOLBAR */}
      <header className="h-16 border-b border-slate-900 px-6 flex items-center justify-between glass z-30 select-none">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link href="/tools/pdf-tools" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
            PDF Tools
          </Link>
          <div className="h-5 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="font-extrabold text-sm text-slate-200 truncate max-w-[200px] md:max-w-xs">
              {pdfFile ? pdfFile.name : "Professional PDF Editor"}
            </span>
          </div>
        </div>

        {/* Center Toolbar Tools (Only when PDF is uploaded) */}
        {pdfFile && (
          <div className="flex items-center gap-1 bg-slate-900/60 p-1.5 border border-slate-800 rounded-2xl shadow-inner max-w-xl overflow-x-auto">
            <button
              onClick={() => { setEditMode('select'); getActiveCanvas()?.discardActiveObject().requestRenderAll(); }}
              className={`p-2 rounded-xl transition-all ${editMode === 'select' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title="Select / Pointer Tool"
            >
              <MousePointer className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setEditMode('edit-text')}
              className={`p-2 rounded-xl transition-all ${editMode === 'edit-text' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title="Select & Edit PDF Text"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={handleAddText}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Add New Text Box"
            >
              <Type className="w-4 h-4" />
            </button>

            <button
              onClick={() => imageUploadRef.current?.click()}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
              <input type="file" ref={imageUploadRef} onChange={handleAddImage} accept="image/*" className="hidden" />
            </button>

            <button
              onClick={() => setEditMode('draw')}
              className={`p-2 rounded-xl transition-all ${editMode === 'draw' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title="Freehand Drawing Brush"
            >
              <Paintbrush className="w-4 h-4" />
            </button>

            <button
              onClick={() => setEditMode('highlight-free')}
              className={`p-2 rounded-xl transition-all ${editMode === 'highlight-free' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title="Freehand Highlighter"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleAddShape('highlight')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Highlight Box (Rectangle)"
            >
              <div className="relative">
                <Highlighter className="w-4 h-4 text-yellow-450" />
                <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-500 rounded-sm" />
              </div>
            </button>

            <div className="w-px h-5 bg-slate-800 mx-1" />

            {/* Shapes triggers */}
            <button
              onClick={() => handleAddShape('rect')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Insert Rectangle Shape"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAddShape('circle')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Insert Circle Shape"
            >
              <Circle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAddShape('arrow')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Insert Arrow Line"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-800 mx-1" />

            <button
              onClick={() => setIsSigModalOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-bold"
              title="Place digital signature"
            >
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              Sign
            </button>
          </div>
        )}

        {/* Right Section actions */}
        <div className="flex items-center gap-3">
          {pdfFile ? (
            <>
              {/* History Undo / Redo */}
              <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-xl p-0.5 mr-2">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition-all"
                  title="Undo last modification"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition-all"
                  title="Redo modification"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleReset}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-xs font-bold uppercase rounded-xl transition-all text-slate-400 hover:text-white"
              >
                Close
              </button>
              
              <button
                onClick={handleExportPDF}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-40"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Save Changes
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-900/50">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Client Processing</span>
            </div>
          )}
        </div>
      </header>

      {/* 2. CORE WORKSPACE */}
      {!pdfFile ? (
        // File Upload Panel
        <div className="flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto pt-16 bg-grid-pattern relative">
          
          <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-950/50 border border-blue-900/40 text-blue-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen PDF Workspace
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight text-gradient">
                Professional PDF Editor
              </h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Rebuild, annotate, and format documents fully client-side. Edit original text blocks, draw vector vectors, add images, and sign securely.
              </p>
            </div>

            {error && (
              <div className="bg-red-950/20 text-red-400 p-5 rounded-2xl flex items-start gap-4 border border-red-900/50 text-left">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file && file.type === 'application/pdf') loadPdfFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border border-slate-800 hover:border-blue-500/50 bg-slate-900/40 hover:bg-slate-900/60 rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 shadow-xl group relative glow-hover overflow-hidden"
            >
              <input type="file" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) loadPdfFile(file);
              }} accept="application/pdf" className="hidden" />
              
              <UploadCloud className="w-12 h-12 text-slate-600 group-hover:text-blue-500 mx-auto mb-4 transition-colors" />
              <h3 className="text-lg font-bold text-slate-200 mb-1">Upload PDF Document</h3>
              <p className="text-sm text-slate-500 mb-6">or drag and drop your document here</p>
              
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl text-xs uppercase tracking-widest shadow-md transition-all active:scale-95">
                Select File
              </button>
            </div>
          </div>

          {toolArticles['edit-pdf'] && (
            <div className="w-full max-w-5xl mt-20 rounded-3xl overflow-hidden border border-slate-900 shadow-2xl glass p-1">
              <ToolArticle {...toolArticles['edit-pdf']} />
            </div>
          )}
        </div>
      ) : (
        // Document Editor Panel
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT COLUMN: Page Thumbnails Panel */}
          <aside className="w-48 bg-slate-950 border-r border-slate-900 flex flex-col overflow-hidden select-none">
            <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-slate-900/20">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Pages</span>
              <span className="text-xs font-bold text-slate-400">{pageList.length} total</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 custom-scrollbar">
              {pageList.map((item, idx) => {
                const isActive = item.id === activePageId;
                const thumb = thumbnailUrls[item.originalPageNum];
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col items-center gap-2 p-2 rounded-2xl border transition-all relative group ${
                      isActive
                        ? 'bg-blue-950/20 border-blue-500/80 shadow-md shadow-blue-500/5'
                        : 'bg-slate-900/10 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    {/* Page thumbnail click */}
                    <div onClick={() => handlePageThumbClick(item.id)} className="cursor-pointer w-full flex justify-center">
                      {thumb ? (
                        <img src={thumb} alt={`Page ${idx + 1}`} className="w-28 h-auto shadow-md rounded-lg border border-slate-800 object-contain" />
                      ) : (
                        <div className="w-28 h-36 bg-slate-900 animate-pulse rounded-lg border border-slate-800 flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 text-slate-600 animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    {/* Page Actions */}
                    <div className="flex items-center justify-between w-full px-1">
                      <span className={`text-[10px] font-bold ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                        P. {idx + 1}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                        <button
                          onClick={() => handleDuplicatePage(idx)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                          title="Duplicate page"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeletePage(idx)}
                          className="p-1 hover:bg-red-950/30 rounded text-slate-400 hover:text-red-400"
                          title="Delete page"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* CENTER COLUMN: PDF Viewer Canvas Space */}
          <main
            ref={workspaceRef}
            onScroll={handleWorkspaceScroll}
            className={`flex-1 overflow-auto p-12 flex flex-col items-center justify-start custom-scrollbar bg-slate-900 bg-grid-pattern ${editMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
          >
            {/* Header elements alerts */}
            <div className="max-w-4xl w-full space-y-4 mb-6 select-none">
              {error && (
                <div className="bg-red-950/30 text-red-400 px-5 py-4 rounded-2xl flex items-center gap-3 border border-red-900/40 animate-fade-in shadow-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-xs font-bold leading-normal">{error}</p>
                  <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {success && (
                <div className="bg-emerald-950/30 text-emerald-400 px-5 py-4 rounded-2xl flex items-center gap-3 border border-emerald-900/40 animate-fade-in shadow-lg">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-xs font-bold leading-normal">{success}</p>
                  <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-450 hover:text-emerald-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Virtualized pages container */}
            <div className="flex flex-col gap-10 items-center justify-start pb-20">
              {pageList.map((item, idx) => {
                const dimensions = pageDimensions[item.originalPageNum] || { width: 595, height: 842 };
                const w = dimensions.width * zoomScale;
                const h = dimensions.height * zoomScale;
                const isActive = item.id === activePageId;

                return (
                  <div
                    key={item.id}
                    id={`page-wrapper-${item.id}`}
                    className={`relative rounded-2xl border transition-all ${
                      isActive 
                        ? 'border-blue-500 shadow-2xl shadow-blue-500/5 ring-1 ring-blue-500/20' 
                        : 'border-slate-900 shadow-xl'
                    }`}
                    style={{ width: `${w}px`, height: `${h}px` }}
                  >
                    {/* Lazy Loader Page Wrapper */}
                    <PDFPageWrapper
                      pageId={item.id}
                      pageNum={idx + 1}
                      originalPageNum={item.originalPageNum}
                      width={dimensions.width}
                      height={dimensions.height}
                      zoomScale={zoomScale}
                      editMode={editMode}
                      pdfDoc={pdfDocRef.current}
                      fabricLib={fabricLib}
                      canvasState={canvasStates[item.id]}
                      saveCanvasState={handleCanvasStateUpdate}
                      onFocusCanvas={handleFocusCanvas}
                      onObjectSelected={handleObjectSelected}
                      onObjectCleared={handleObjectCleared}
                      strokeColor={strokeColor}
                      fillColor={fillColor}
                      strokeWidth={strokeWidth}
                      brushWidth={brushWidth}
                      fontFamily={fontFamily}
                      fontSize={fontSize}
                      originalTexts={originalTexts}
                      registerCanvasInstance={(pId, canvas) => {
                        canvasInstances.current[pId] = canvas;
                      }}
                      unregisterCanvasInstance={(pId) => {
                        delete canvasInstances.current[pId];
                      }}
                    />

                    {/* Page tag helper */}
                    <div className="absolute top-2 -left-16 bg-slate-950 border border-slate-900 text-[9px] font-black tracking-widest uppercase text-slate-500 px-3 py-1.5 rounded-full select-none shadow">
                      P. {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* RIGHT COLUMN: Sidebar properties panel */}
          <aside className="w-80 bg-slate-950 border-l border-slate-900 flex flex-col overflow-hidden select-none z-20">
            <div className="flex bg-slate-950 border-b border-slate-900 p-1.5 bg-slate-900/10">
              <button
                onClick={() => setActiveSidebarTab('properties')}
                className={`flex-1 py-2.5 text-center text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
                  activeSidebarTab === 'properties' ? 'bg-slate-900 text-white shadow border border-slate-800' : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => setActiveSidebarTab('search')}
                className={`flex-1 py-2.5 text-center text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
                  activeSidebarTab === 'search' ? 'bg-slate-900 text-white shadow border border-slate-800' : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                Search & Replace
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeSidebarTab === 'search' ? (
                <div className="p-5 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Find Text</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search text in PDF..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-650 outline-none focus:border-blue-500 transition-colors"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-3.5" />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-600 hover:text-slate-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Replace With</label>
                      <input
                        type="text"
                        value={replaceQuery}
                        onChange={(e) => setReplaceQuery(e.target.value)}
                        placeholder="Replacement text..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {debouncedSearchQuery && (
                    <div className="space-y-4 pt-4 border-t border-slate-900">
                      {searchResults.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400">
                              {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'} found
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 font-bold">
                                {currentMatchIndex + 1} of {searchResults.length}
                              </span>
                              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                                <button
                                  onClick={handlePrevMatch}
                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                                  title="Previous Match"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={handleNextMatch}
                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                                  title="Next Match"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                              onClick={handleReplace}
                              className="py-2.5 bg-blue-600/10 hover:bg-blue-600/25 border border-blue-600/20 text-blue-400 text-xs font-bold uppercase rounded-xl transition-all"
                            >
                              Replace
                            </button>
                            <button
                              onClick={handleReplaceAll}
                              className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md shadow-blue-500/10"
                            >
                              Replace All
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-xs font-bold text-slate-500">No matches found</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!debouncedSearchQuery && (
                    <div className="text-center py-8 space-y-3">
                      <div className="bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center mx-auto border border-slate-800 text-slate-600">
                        <Search className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 leading-normal px-2">
                        Find and replace words in original text boxes or custom annotations.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 space-y-6">
                  {selectedObjectInfo ? (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Selected Object type indicator */}
                      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-900">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-0.5">Selection Type</span>
                        <span className="text-xs font-bold text-slate-300 capitalize">
                          {selectedObjectInfo.type === 'i-text' || selectedObjectInfo.type === 'textbox'
                            ? (selectedObjectInfo.isHighlight ? "Highlight Shape" : "Text Box")
                            : selectedObjectInfo.type}
                        </span>
                      </div>

                      {/* Text Properties controls */}
                      {(selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text') && (
                        <div className="space-y-4 border-t border-slate-900 pt-4">
                          {/* Quick Action Highlight */}
                          <button
                            onClick={handleHighlightSelectedText}
                            className="w-full flex items-center justify-center gap-2 bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-500/25 text-yellow-400 py-2.5 rounded-xl text-xs font-bold transition-all"
                          >
                            <Highlighter className="w-4 h-4 text-yellow-450" />
                            Highlight Text Box
                          </button>

                          {/* Font options */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Font Family</label>
                            <select
                              value={selectedObjectInfo.fontFamily}
                              onChange={(e) => changeSelectedProperty('fontFamily', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                            >
                              <option value="Helvetica">Helvetica (Sans-Serif)</option>
                              <option value="Times New Roman">Times New Roman (Serif)</option>
                              <option value="Courier">Courier (Monospace)</option>
                            </select>
                          </div>

                          {/* Font Size controls */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Font Size</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => changeSelectedProperty('fontSize', Math.max(6, selectedObjectInfo.fontSize - 1))}
                                className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              
                              <select
                                value={selectedObjectInfo.fontSize}
                                onChange={(e) => changeSelectedProperty('fontSize', parseInt(e.target.value))}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500 text-center"
                              >
                                {FONT_SIZES.map((sz) => (
                                  <option key={sz} value={sz}>{sz} px</option>
                                ))}
                              </select>

                              <button
                                onClick={() => changeSelectedProperty('fontSize', Math.min(100, selectedObjectInfo.fontSize + 1))}
                                className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Text Style toggles */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Text Style</label>
                            <div className="grid grid-cols-4 gap-1.5">
                              <button
                                onClick={() => changeSelectedProperty('fontWeight', selectedObjectInfo.fontWeight === 'bold' ? 'normal' : 'bold')}
                                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                                  selectedObjectInfo.fontWeight === 'bold' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                <Bold className="w-3.5 h-3.5 mx-auto" />
                              </button>
                              <button
                                onClick={() => changeSelectedProperty('fontStyle', selectedObjectInfo.fontStyle === 'italic' ? 'normal' : 'italic')}
                                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                                  selectedObjectInfo.fontStyle === 'italic' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                <Italic className="w-3.5 h-3.5 mx-auto" />
                              </button>
                              <button
                                onClick={() => changeSelectedProperty('underline', !selectedObjectInfo.underline)}
                                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                                  selectedObjectInfo.underline ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                <Underline className="w-3.5 h-3.5 mx-auto" />
                              </button>
                              <button
                                onClick={() => {
                                  const aligns = ['left', 'center', 'right'];
                                  const nextIdx = (aligns.indexOf(selectedObjectInfo.textAlign) + 1) % aligns.length;
                                  changeSelectedProperty('textAlign', aligns[nextIdx]);
                                }}
                                className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                              >
                                {selectedObjectInfo.textAlign === 'left' && <AlignLeft className="w-3.5 h-3.5 mx-auto" />}
                                {selectedObjectInfo.textAlign === 'center' && <AlignCenter className="w-3.5 h-3.5 mx-auto" />}
                                {selectedObjectInfo.textAlign === 'right' && <AlignRight className="w-3.5 h-3.5 mx-auto" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Colors parameters */}
                      <div className="space-y-3 border-t border-slate-900 pt-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          {selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text'
                            ? "Font Color"
                            : selectedObjectInfo.isHighlight
                            ? "Highlight Color"
                            : "Stroke Color"}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {/* Auto-Match Detected Color */}
                          {selectedObjectInfo.originalTextData?.detectedColor && (
                            <button
                              key="auto-match"
                              onClick={() => {
                                const detColor = selectedObjectInfo.originalTextData.detectedColor;
                                if (selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text' || selectedObjectInfo.isHighlight) {
                                  changeSelectedProperty('fill', detColor);
                                } else {
                                  changeSelectedProperty('stroke', detColor);
                                }
                              }}
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                                (selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text'
                                  ? selectedObjectInfo.fill
                                  : selectedObjectInfo.isHighlight
                                  ? (selectedObjectInfo.fill.startsWith('rgba') ? rgbaToHex(selectedObjectInfo.fill) : selectedObjectInfo.fill)
                                  : selectedObjectInfo.stroke) === selectedObjectInfo.originalTextData.detectedColor
                                  ? 'border-blue-500 scale-110 shadow-md shadow-blue-500/10'
                                  : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: selectedObjectInfo.originalTextData.detectedColor }}
                              title={`Auto-matched Color (${selectedObjectInfo.originalTextData.detectedColor})`}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-white mix-blend-difference" />
                            </button>
                          )}
                          {[
                            { hex: '#fbbf24', label: 'Yellow' },
                            { hex: '#22c55e', label: 'Green' },
                            { hex: '#3b82f6', label: 'Blue' },
                            { hex: '#ef4444', label: 'Red' },
                            { hex: '#000000', label: 'Black' },
                            { hex: '#ffffff', label: 'White' },
                          ].map((color) => (
                            <button
                              key={color.hex}
                              onClick={() => {
                                if (selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text' || selectedObjectInfo.isHighlight) {
                                  changeSelectedProperty('fill', color.hex);
                                } else {
                                  changeSelectedProperty('stroke', color.hex);
                                }
                              }}
                              className={`w-7 h-7 rounded-full border-2 transition-all ${
                                (selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text'
                                  ? selectedObjectInfo.fill
                                  : selectedObjectInfo.isHighlight
                                  ? (selectedObjectInfo.fill.startsWith('rgba') ? rgbaToHex(selectedObjectInfo.fill) : selectedObjectInfo.fill)
                                  : selectedObjectInfo.stroke) === color.hex
                                  ? 'border-blue-500 scale-110 shadow-md shadow-blue-500/10'
                                  : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.label}
                            />
                          ))}
                          {/* Native Custom Color Picker */}
                          <div className="relative w-7 h-7 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900 hover:bg-slate-800 cursor-pointer overflow-hidden transition-all hover:scale-105" title="Custom Eyedropper Color">
                            <Paintbrush className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <input
                              type="color"
                              value={
                                selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text'
                                  ? (selectedObjectInfo.fill === 'transparent' ? (selectedObjectInfo.originalTextData?.detectedColor || '#0b2c8c') : selectedObjectInfo.fill)
                                  : selectedObjectInfo.isHighlight
                                  ? (selectedObjectInfo.fill.startsWith('rgba') ? rgbaToHex(selectedObjectInfo.fill) : selectedObjectInfo.fill)
                                  : selectedObjectInfo.stroke
                              }
                              onChange={(e) => {
                                if (selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text' || selectedObjectInfo.isHighlight) {
                                  changeSelectedProperty('fill', e.target.value);
                                } else {
                                  changeSelectedProperty('stroke', e.target.value);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Shape parameters (Opacity and Thickness) */}
                      <div className="space-y-4 border-t border-slate-900 pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opacity</label>
                            <span className="text-[10px] font-bold text-slate-400">
                              {selectedObjectInfo.isHighlight
                                ? Math.round((selectedObjectInfo.fill.startsWith('rgba')
                                  ? parseFloat(selectedObjectInfo.fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)?.[4] || '0.4')
                                  : 1) * 100)
                                : Math.round(selectedObjectInfo.opacity * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={
                              selectedObjectInfo.isHighlight
                                ? parseFloat(selectedObjectInfo.fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)?.[4] || '0.4')
                                : selectedObjectInfo.opacity
                            }
                            onChange={(e) => changeSelectedProperty('opacity', parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>

                        {selectedObjectInfo.type !== 'textbox' && selectedObjectInfo.type !== 'i-text' && selectedObjectInfo.type !== 'image' && !selectedObjectInfo.isHighlight && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Border Thickness</label>
                              <span className="text-[10px] font-bold text-slate-400">{selectedObjectInfo.strokeWidth}px</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="15"
                              step="1"
                              value={selectedObjectInfo.strokeWidth}
                              onChange={(e) => changeSelectedProperty('strokeWidth', parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Layer controls */}
                      <div className="space-y-2 border-t border-slate-900 pt-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Layer Controls</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => adjustLayer('front')}
                        className="py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-[10px] font-bold uppercase rounded-xl transition-colors"
                      >
                        Bring Front
                      </button>
                      <button
                        onClick={() => adjustLayer('back')}
                        className="py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-[10px] font-bold uppercase rounded-xl transition-colors"
                      >
                        Send Back
                      </button>
                    </div>
                  </div>

                  {/* Delete control */}
                  <div className="pt-4">
                    <button
                      onClick={handleDeleteSelected}
                      className="w-full flex items-center justify-center gap-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Element
                    </button>
                  </div>
                </div>
              ) : (
                // Properties inspector empty
                <div className="py-20 text-center space-y-4">
                  <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-slate-800 text-slate-600 shadow-inner">
                    <Settings className="w-6 h-6 animate-pulse-slow" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-400">No Selection</h4>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed px-4">
                    Select an element on any page to custom-adjust its color, fonts, opacity, or layers.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

            {/* Quick helper Guide */}
            <div className="p-5 bg-slate-900/10 border-t border-slate-900 select-none">
              <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Shortcuts</h4>
              <ul className="text-[10px] text-slate-600 space-y-1.5 leading-normal">
                <li>Double-click text boxes to edit text.</li>
                <li>Hold Space + Drag to pan page views.</li>
                <li>Press Delete key to remove selected items.</li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      {/* Loading Skeletal screens Overlay */}
      {isProcessing && !pdfBytes && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center select-none">
          <div className="max-w-md w-full text-center space-y-4 p-8">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">{processingStatus || "Initializing file..."}</h3>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Signature Modals popup */}
      <SignatureModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onSave={handleSaveSignature}
      />
    </div>
  );
}

// -------------------------------------------------------------
// VIRTUALIZED PAGE CONTAINER WRAPPER USING INTERSECTION OBSERVER
// -------------------------------------------------------------
interface PageWrapperProps {
  pageId: string;
  pageNum: number;
  originalPageNum: number;
  width: number;
  height: number;
  zoomScale: number;
  editMode: string;
  pdfDoc: any;
  fabricLib: any;
  canvasState: any;
  saveCanvasState: (pageId: string, state: any) => void;
  onFocusCanvas: (pageId: string, fbCanvas: any) => void;
  onObjectSelected: (pageId: string, activeObj: any) => void;
  onObjectCleared: () => void;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  brushWidth: number;
  fontFamily: string;
  fontSize: number;
  originalTexts: Record<number, TextBoxInfo[]>;
  registerCanvasInstance?: (pageId: string, canvas: any) => void;
  unregisterCanvasInstance?: (pageId: string) => void;
}

const PDFPageWrapper = ({
  pageId,
  pageNum,
  originalPageNum,
  width,
  height,
  zoomScale,
  editMode,
  pdfDoc,
  fabricLib,
  canvasState,
  saveCanvasState,
  onFocusCanvas,
  onObjectSelected,
  onObjectCleared,
  strokeColor,
  fillColor,
  strokeWidth,
  brushWidth,
  fontFamily,
  fontSize,
  originalTexts,
  registerCanvasInstance,
  unregisterCanvasInstance
}: PageWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
        });
      },
      {
        root: null, // viewport
        rootMargin: '800px', // Pre-render pages 800px before they scroll into view
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-white relative rounded-2xl select-none">
      {isIntersecting ? (
        <PageRenderer
          pageId={pageId}
          pageNum={pageNum}
          originalPageNum={originalPageNum}
          width={width}
          height={height}
          zoomScale={zoomScale}
          editMode={editMode}
          pdfDoc={pdfDoc}
          fabricLib={fabricLib}
          canvasState={canvasState}
          saveCanvasState={saveCanvasState}
          onFocusCanvas={onFocusCanvas}
          onObjectSelected={onObjectSelected}
          onObjectCleared={onObjectCleared}
          strokeColor={strokeColor}
          fillColor={fillColor}
          strokeWidth={strokeWidth}
          brushWidth={brushWidth}
          fontFamily={fontFamily}
          fontSize={fontSize}
          originalTexts={originalTexts}
          registerCanvasInstance={registerCanvasInstance}
          unregisterCanvasInstance={unregisterCanvasInstance}
        />
      ) : (
        // skeleton placeholder
        <div className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center select-none pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 text-slate-700 animate-spin" />
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Loading page {pageNum}...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// DETAILED CANVAS LAYER & INTERACTION MANAGER
// -------------------------------------------------------------
const PageRenderer = ({
  pageId,
  pageNum,
  originalPageNum,
  width,
  height,
  zoomScale,
  editMode,
  pdfDoc,
  fabricLib,
  canvasState,
  saveCanvasState,
  onFocusCanvas,
  onObjectSelected,
  onObjectCleared,
  strokeColor,
  fillColor,
  strokeWidth,
  brushWidth,
  fontFamily,
  fontSize,
  originalTexts,
  registerCanvasInstance,
  unregisterCanvasInstance
}: any) => {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasInstance = useRef<any>(null);
  const [isBackgroundRendered, setIsBackgroundRendered] = useState(false);



  // 1. PDF.js background rendering
  useEffect(() => {
    let active = true;
    const renderPageBackground = async () => {
      if (!pdfDoc || !pdfCanvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(originalPageNum);
        const viewport = page.getViewport({ scale: zoomScale });
        
        if (!active || !pdfCanvasRef.current) return;
        const canvas = pdfCanvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;
          setIsBackgroundRendered(true);
        }
      } catch (e) {
        console.error(`PDF.js page ${originalPageNum} rendering failed`, e);
      }
    };

    renderPageBackground();
    return () => {
      active = false;
    };
  }, [pdfDoc, originalPageNum, zoomScale]);

  // 2. Fabric.js setup and overlays
  useEffect(() => {
    if (!fabricLib || !fabricCanvasRef.current || !isBackgroundRendered) return;

    // Create Fabric Canvas
    const fbCanvas = new fabricLib.Canvas(fabricCanvasRef.current, {
      width: width * zoomScale,
      height: height * zoomScale,
      backgroundColor: 'transparent',
      selection: editMode === 'select'
    });

    fabricCanvasInstance.current = fbCanvas;
    if (registerCanvasInstance) {
      registerCanvasInstance(pageId, fbCanvas);
    }

    // Apply zoom
    fbCanvas.setZoom(zoomScale);
    fbCanvas.setDimensions({
      width: width * zoomScale,
      height: height * zoomScale
    });

    // Smart Snapping implementation
    fbCanvas.on('object:moving', (options: any) => {
      const obj = options.target;
      if (!obj) return;
      const snapThreshold = 10;
      
      const cWidth = width;
      const cHeight = height;
      const cCenterX = cWidth / 2;
      const cCenterY = cHeight / 2;
      
      const objW = obj.width * obj.scaleX;
      const objH = obj.height * obj.scaleY;
      const objCenterX = obj.left + objW / 2;
      const objCenterY = obj.top + objH / 2;

      // Snap to Horizontal Center
      if (Math.abs(objCenterX - cCenterX) < snapThreshold) {
        obj.set({ left: cCenterX - objW / 2 });
      }
      // Snap to Vertical Center
      if (Math.abs(objCenterY - cCenterY) < snapThreshold) {
        obj.set({ top: cCenterY - objH / 2 });
      }
      // Snap to margins (20px border margins)
      if (Math.abs(obj.left - 20) < snapThreshold) {
        obj.set({ left: 20 });
      }
      if (Math.abs(obj.top - 20) < snapThreshold) {
        obj.set({ top: 20 });
      }
      if (Math.abs((obj.left + objW) - (cWidth - 20)) < snapThreshold) {
        obj.set({ left: cWidth - 20 - objW });
      }
    });

    // Populate state from history or original texts
    if (canvasState) {
      const stateCopy = JSON.parse(JSON.stringify(canvasState));
      stateCopy.viewportTransform = [zoomScale, 0, 0, zoomScale, 0, 0];
      fbCanvas.loadFromJSON(stateCopy, () => {
        fbCanvas.setZoom(zoomScale);
        fbCanvas.setDimensions({
          width: width * zoomScale,
          height: height * zoomScale
        });
        fbCanvas.renderAll();
      });
    } else {
      const textBoxesForPage = originalTexts[originalPageNum] || [];
      if (textBoxesForPage.length > 0) {
        textBoxesForPage.forEach((box: any) => {
          // Detect color from background canvas
          const detectedColor = detectTextColorFromCanvas(pdfCanvasRef.current, box, zoomScale);

          const isReplaced = box.replacedText !== undefined;
          const displayText = isReplaced ? box.replacedText : box.text;

          const textbox = new fabricLib.Textbox(displayText, {
            id: box.id,
            left: box.x,
            top: box.y,
            width: box.width,
            height: box.height,
            fontSize: box.fontSize,
            fontFamily: 'Helvetica',
            fill: isReplaced ? (box.replacedColor || detectedColor) : 'transparent',
            backgroundColor: isReplaced ? 'transparent' : 'rgba(255, 255, 255, 0.001)', // invisible but registers clicks perfectly
            isOriginalText: true,
            originalTextData: {
              text: box.text,
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              fontSize: box.fontSize,
              detectedColor: detectedColor
            },
            selectable: true,
            editable: true,
            evented: true,
            hasControls: true,
            lockScalingY: true,
            borderColor: '#3b82f6',
            cornerColor: '#3b82f6',
            cornerSize: 8,
            transparentCorners: false,
            hasRotatingPoint: true,
            stroke: 'transparent',
            strokeWidth: 1
          });

          // Revert back to transparent if losing focus and unchanged
          textbox.on('deselected', () => {
            if (textbox.text === textbox.originalTextData.text && !textbox.isDeletedOriginal) {
              textbox.set({
                fill: 'transparent',
                backgroundColor: 'rgba(255, 255, 255, 0.001)',
                stroke: 'transparent'
              });
              fbCanvas.requestRenderAll();
            }
          });

          fbCanvas.add(textbox);
        });
        fbCanvas.renderAll();
        // save initial state
        const state = fbCanvas.toJSON(['id', 'isOriginalText', 'originalTextData', 'isDeletedOriginal']);
        saveCanvasState(pageId, state);
      }
    }

    // Custom render loop hook to paint whiteout masks underneath textboxes on screen
    fbCanvas.on('before:render', () => {
      const ctx = fbCanvas.getContext();
      ctx.save();
      const v = fbCanvas.viewportTransform;
      if (v) {
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      }
      
      fbCanvas.forEachObject((obj: any) => {
        if (obj.isOriginalText) {
          const isActive = fbCanvas.getActiveObject() === obj;
          const isEdited = obj.isDeletedOriginal || 
                           obj.text !== obj.originalTextData.text ||
                           Math.abs(obj.left - obj.originalTextData.x) > 0.5 ||
                           Math.abs(obj.top - obj.originalTextData.y) > 0.5 ||
                           obj.fontSize !== obj.originalTextData.fontSize;
          if (isEdited || isActive) {
            const orig = obj.originalTextData;
            const padX = 1;
            const shrinkY = 1.5; // shrink vertically to prevent grid line erasure
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
              orig.x - padX,
              orig.y + shrinkY,
              orig.width + padX * 2,
              orig.height - shrinkY * 2
            );
          }
        }
      });
      ctx.restore();
    });

    // Brush Setup
    setupBrushes(fbCanvas);

    // Event hooks selection
    const handleSelection = () => {
      const activeObj = fbCanvas.getActiveObject();
      if (activeObj) {
        onObjectSelected(pageId, activeObj);
        
        // Single-click to select all and type instantly
        if ((activeObj.type === 'textbox' || activeObj.type === 'i-text') && (editMode === 'edit-text' || editMode === 'select')) {
          const detectedColor = activeObj.originalTextData?.detectedColor || '#0b2c8c';
          activeObj.set({
            fill: activeObj.fill === 'transparent' ? detectedColor : activeObj.fill,
            backgroundColor: 'transparent', // Transparent background
            stroke: 'transparent'
          });
          fbCanvas.requestRenderAll();

          setTimeout(() => {
            activeObj.enterEditing();
            activeObj.selectAll();
            fbCanvas.requestRenderAll();
          }, 50);
        }
      } else {
        onObjectCleared();
      }
    };

    fbCanvas.on('selection:created', handleSelection);
    fbCanvas.on('selection:updated', handleSelection);
    fbCanvas.on('selection:cleared', () => {
      fbCanvas.forEachObject((obj: any) => {
        if (obj.isOriginalText && obj.text === obj.originalTextData.text && !obj.isDeletedOriginal) {
          obj.set({
            fill: 'transparent',
            backgroundColor: 'rgba(255, 255, 255, 0.001)',
            stroke: 'transparent'
          });
        }
      });
      fbCanvas.requestRenderAll();
      onObjectCleared();
    });

    fbCanvas.on('editing:entered', (options: any) => {
      const obj = options.target;
      if (obj && obj.isOriginalText) {
        const detectedColor = obj.originalTextData?.detectedColor || '#0b2c8c';
        obj.set({
          fill: obj.fill === 'transparent' ? detectedColor : obj.fill,
          backgroundColor: 'transparent', // Transparent background
          stroke: 'transparent'
        });
        fbCanvas.requestRenderAll();
      }
    });

    fbCanvas.on('editing:exited', (options: any) => {
      const obj = options.target;
      if (obj && obj.isOriginalText) {
        if (obj.text === obj.originalTextData.text && !obj.isDeletedOriginal) {
          obj.set({
            fill: 'transparent',
            backgroundColor: 'rgba(255, 255, 255, 0.001)'
          });
          fbCanvas.requestRenderAll();
        }
      }
    });

    // Hover bounding box outlines for guides
    fbCanvas.on('mouse:over', (e: any) => {
      const obj = e.target;
      if (obj && obj.isOriginalText && editMode === 'edit-text') {
        // Only show dashed border if transparent/unedited
        if (obj.fill === 'transparent') {
          obj.set({
            stroke: '#3b82f6',
            strokeDashArray: [4, 4],
            strokeWidth: 1.5
          });
          fbCanvas.requestRenderAll();
        }
      }
    });

    fbCanvas.on('mouse:out', (e: any) => {
      const obj = e.target;
      if (obj && obj.isOriginalText && editMode === 'edit-text') {
        if (obj.fill === 'transparent') {
          obj.set({
            stroke: 'transparent'
          });
          fbCanvas.requestRenderAll();
        }
      }
    });

    // MouseDown focus
    fbCanvas.on('mouse:down', () => {
      onFocusCanvas(pageId, fbCanvas);
    });

    // Auto save JSON
    const handleSaveState = () => {
      const state = fbCanvas.toJSON(['id', 'isOriginalText', 'originalTextData', 'isDeletedOriginal']);
      saveCanvasState(pageId, state);
    };

    const handleTextChanged = (e: any) => {
      const obj = e.target;
      if (obj && obj.isOriginalText && (obj.type === 'textbox' || obj.type === 'i-text')) {
        const origWidth = obj.originalTextData?.width || obj.width || 0;
        obj.set({ width: 9999 });
        let maxLineWidth = 0;
        const linesList = obj.text.split('\n');
        for (let i = 0; i < linesList.length; i++) {
          const lineWidth = obj.measureLine(i).width || 0;
          if (lineWidth > maxLineWidth) {
            maxLineWidth = lineWidth;
          }
        }
        const newWidth = Math.max(origWidth, maxLineWidth + 10);
        obj.set({ width: newWidth });
        fbCanvas.requestRenderAll();
      }
      handleSaveState();
    };

    fbCanvas.on('object:added', handleSaveState);
    fbCanvas.on('object:modified', handleSaveState);
    fbCanvas.on('object:removed', handleSaveState);
    fbCanvas.on('path:created', handleSaveState);
    fbCanvas.on('text:changed', handleTextChanged);
    fbCanvas.on('editing:exited', handleSaveState);

    return () => {
      fbCanvas.off('selection:created', handleSelection);
      fbCanvas.off('selection:updated', handleSelection);
      fbCanvas.off('object:added', handleSaveState);
      fbCanvas.off('object:modified', handleSaveState);
      fbCanvas.off('object:removed', handleSaveState);
      fbCanvas.off('path:created', handleSaveState);
      fbCanvas.off('text:changed', handleTextChanged);
      fbCanvas.off('editing:exited', handleSaveState);
      if (unregisterCanvasInstance) {
        unregisterCanvasInstance(pageId);
      }
      fbCanvas.dispose();
      fabricCanvasInstance.current = null;
    };
  }, [fabricLib, isBackgroundRendered, zoomScale]);

  // Sync mode changes to active canvas options
  useEffect(() => {
    const fbCanvas = fabricCanvasInstance.current;
    if (!fbCanvas) return;

    fbCanvas.isDrawingMode = false;
    fbCanvas.selection = editMode === 'select';

    fbCanvas.forEachObject((obj: any) => {
      if (obj.isOriginalText) {
        obj.selectable = editMode === 'edit-text' || editMode === 'select';
        obj.editable = editMode === 'edit-text';
      } else {
        obj.selectable = editMode === 'select';
      }
    });

    if (editMode === 'draw' || editMode === 'highlight-free') {
      fbCanvas.isDrawingMode = true;
      setupBrushes(fbCanvas);
    }

    fbCanvas.requestRenderAll();
  }, [editMode]);

  const setupBrushes = (fbCanvas: any) => {
    if (!fbCanvas.freeDrawingBrush) return;

    if (editMode === 'draw') {
      fbCanvas.freeDrawingBrush.color = strokeColor;
      fbCanvas.freeDrawingBrush.width = brushWidth;
    } else if (editMode === 'highlight-free') {
      fbCanvas.freeDrawingBrush.color = hexToRgbaStr(strokeColor, 0.4);
      fbCanvas.freeDrawingBrush.width = 25; // Highlighter thick brush
    }
  };

  // Brush changes
  useEffect(() => {
    const fbCanvas = fabricCanvasInstance.current;
    if (fbCanvas) setupBrushes(fbCanvas);
  }, [strokeColor, brushWidth]);

  return (
    <div className="absolute inset-0 w-full h-full select-none rounded-2xl">
      <canvas ref={pdfCanvasRef} className="absolute inset-0 pointer-events-none rounded-2xl bg-white" />
      <div className="absolute inset-0 z-10 rounded-2xl">
        <canvas ref={fabricCanvasRef} />
      </div>
    </div>
  );
};

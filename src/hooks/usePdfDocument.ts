'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { loadPdfLibraries } from '@/lib/twpdf/core';
import { detectOriginalText } from '@/lib/twpdf/parser';
import { generateThumbnails } from '@/lib/twpdf/renderer';
import type { PageDimensions, PageItem, TextBoxInfo } from '@/types/pdf';

export function usePdfDocument() {
  const [isMounted, setIsMounted] = useState(false);
  const [pdfjs, setPdfjs] = useState<typeof import('pdfjs-dist') | null>(null);
  const [fabricLib, setFabricLib] = useState<typeof import('fabric').fabric | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const pdfDocRef = useRef<unknown>(null);

  const [pageList, setPageList] = useState<PageItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<Record<number, PageDimensions>>({});
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<number, string>>({});
  const [originalTexts, setOriginalTexts] = useState<Record<number, TextBoxInfo[]>>({});

  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const initLibraries = async () => {
      try {
        const { pdfjs: pLib, fabricLib: fLib } = await loadPdfLibraries();
        setPdfjs(pLib);
        setFabricLib(fLib);
      } catch (err) {
        console.error('Failed to load rendering engine libraries', err);
        setError('Failed to load PDF core rendering libraries.');
      }
    };
    initLibraries();
  }, []);

  const loadPdfFile = useCallback(
    (file: File) => {
      if (!pdfjs) return;

      setPdfFile(file);
      setIsProcessing(true);
      setProcessingStatus('Reading PDF file structure...');
      setError(null);
      setSuccess(null);
      setPageList([]);
      setPageDimensions({});
      setOriginalTexts({});

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

          const dimensions: Record<number, PageDimensions> = {};
          const textCache: Record<number, TextBoxInfo[]> = {};
          const initialPages: PageItem[] = [];

          for (let i = 1; i <= doc.numPages; i++) {
            setProcessingStatus(`Extracting page dimensions & text elements: ${i}/${doc.numPages}`);
            const page = await doc.getPage(i);
            const viewport = page.getViewport({ scale: 1.0 });
            dimensions[i] = { width: viewport.width, height: viewport.height };
            initialPages.push({ id: `page_${i}_${Date.now()}`, originalPageNum: i });

            const textItems = await detectOriginalText(page, i, viewport, bytes);
            textCache[i] = textItems;
          }

          setPageDimensions(dimensions);
          setOriginalTexts(textCache);
          setPageList(initialPages);
          setActivePageId(initialPages[0].id);

          setProcessingStatus('Generating page list thumbnails...');
          const thumbs = await generateThumbnails(doc);
          setThumbnailUrls(thumbs);
        } catch (err) {
          console.error(err);
          setError('Invalid PDF file or failed to read document contents.');
          setPdfFile(null);
          setPdfBytes(null);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [pdfjs]
  );

  const resetDocument = useCallback(() => {
    setPdfFile(null);
    setPdfBytes(null);
    pdfDocRef.current = null;
    setPageList([]);
    setPageDimensions({});
    setThumbnailUrls({});
    setOriginalTexts({});
    setActivePageId(null);
    setError(null);
    setSuccess(null);
  }, []);

  const handlePageThumbClick = useCallback((pageId: string) => {
    const el = document.getElementById(`page-wrapper-${pageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setActivePageId(pageId);
  }, []);

  return {
    isMounted,
    pdfjs,
    fabricLib,
    pdfFile,
    pdfBytes,
    pdfDocRef,
    pageList,
    setPageList,
    totalPages,
    pageDimensions,
    thumbnailUrls,
    originalTexts,
    setOriginalTexts,
    activePageId,
    setActivePageId,
    isProcessing,
    setIsProcessing,
    processingStatus,
    setProcessingStatus,
    error,
    setError,
    success,
    setSuccess,
    loadPdfFile,
    resetDocument,
    handlePageThumbClick,
  };
}

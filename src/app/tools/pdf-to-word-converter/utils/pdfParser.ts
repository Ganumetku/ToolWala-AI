import { ExtractedPage, ExtractedTextItem, ExtractedLine, ConversionMode } from '../types';

/**
 * Validates a PDF file by reading metadata and checking for empty/password protected states.
 * Also checks if the PDF is scanned by looking at text content length.
 */
export async function validatePdf(
  pdfjs: any,
  arrayBuffer: ArrayBuffer,
  onProgress?: (progress: number) => void
): Promise<{
  totalPages: number;
  isScanned: boolean;
  isEmpty: boolean;
}> {
  // Safe ArrayBuffer handling - create a clean clone
  const safeBuffer = arrayBuffer.slice(0);
  const loadingTask = pdfjs.getDocument({ data: safeBuffer });
  const doc = await loadingTask.promise;
  const totalPages = doc.numPages;

  if (totalPages === 0) {
    return { totalPages, isScanned: false, isEmpty: true };
  }

  // Scan detection: Read first 3 pages and count characters
  let totalChars = 0;
  const pagesToCheck = Math.min(3, totalPages);
  
  for (let i = 1; i <= pagesToCheck; i++) {
    onProgress?.(Math.round((i / pagesToCheck) * 100));
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    totalChars += textContent.items.map((item: any) => item.str).join('').length;
  }

  const isScanned = totalChars < 15 * pagesToCheck;

  return {
    totalPages,
    isScanned,
    isEmpty: totalChars === 0 && totalPages > 0
  };
}

/**
 * Parses PDF text content with coordinates and dimensions.
 * Optionally renders each page to PNG data URI for visual mode.
 */
export async function parsePdf(
  pdfjs: any,
  arrayBuffer: ArrayBuffer,
  mode: ConversionMode,
  onProgress: (progress: number) => void
): Promise<ExtractedPage[]> {
  const safeBuffer = arrayBuffer.slice(0);
  const loadingTask = pdfjs.getDocument({ data: safeBuffer });
  const doc = await loadingTask.promise;
  const numPages = doc.numPages;
  const pagesData: ExtractedPage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    // Report progress: 0% to 100%
    onProgress(Math.round(((pageNum - 0.5) / numPages) * 100));

    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const pageWidth = viewport.width;
    const pageHeight = viewport.height;

    // Phase 1: Extract Text Content Items
    const textContent = await page.getTextContent();
    const rawItems: ExtractedTextItem[] = textContent.items.map((item: any) => {
      // Bold detection by fontName matching patterns
      const internalFontName = item.fontName || '';
      const isBold = internalFontName.toLowerCase().includes('bold') ||
                     internalFontName.toLowerCase().includes('bld') ||
                     internalFontName.toLowerCase().includes('bd') ||
                     internalFontName.toLowerCase().includes('black') ||
                     internalFontName.toLowerCase().includes('heavy');

      // Font size is typically the scale factor in transform[3] or item.height
      const fontSize = Math.abs(item.transform[3]) || item.height || 10;

      return {
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        fontSize,
        width: item.width || 0,
        height: item.height || fontSize,
        bold: isBold,
        fontName: internalFontName
      };
    });

    // Sort items: Y coordinate descending (top of page to bottom), then X ascending (left to right)
    rawItems.sort((a, b) => {
      // If Y coordinates are extremely close (less than 3 points), sort by X
      if (Math.abs(a.y - b.y) > 3) {
        return b.y - a.y; // Y descending
      }
      return a.x - b.x; // X ascending
    });

    // Phase 2: Group text items into lines based on Y coordinates
    const lines: ExtractedLine[] = [];
    for (const item of rawItems) {
      // Skip empty spaces
      if (!item.text.trim() && item.text !== ' ') continue;

      const threshold = Math.max(item.height * 0.45, 4);
      let addedToLine = false;

      for (const line of lines) {
        // Check if item falls on the same line (approx same Y coord)
        if (Math.abs(item.y - line.y) <= threshold) {
          line.items.push(item);
          addedToLine = true;
          break;
        }
      }

      if (!addedToLine) {
        lines.push({
          text: '',
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          bold: item.bold,
          items: [item]
        });
      }
    }

    // Sort lines from top to bottom (Y descending)
    lines.sort((a, b) => b.y - a.y);

    // Phase 3: Finalize lines, sort items horizontally inside each line, and detect spacing
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x);

      line.x = Math.min(...line.items.map(i => i.x));
      const rightEdge = Math.max(...line.items.map(i => i.x + i.width));
      line.width = rightEdge - line.x;
      line.height = Math.max(...line.items.map(i => i.height));
      line.fontSize = Math.max(...line.items.map(i => i.fontSize));
      line.bold = line.items.some(i => i.bold);

      // Concatenate text, detecting gaps between words
      let lineText = '';
      for (let i = 0; i < line.items.length; i++) {
        const item = line.items[i];
        if (i === 0) {
          lineText += item.text;
        } else {
          const prevItem = line.items[i - 1];
          const xGap = item.x - (prevItem.x + prevItem.width);
          const spaceThreshold = prevItem.fontSize * 0.22; // spacing gap threshold

          // If there is an physical gap and no space character exists in strings
          if (xGap >= spaceThreshold && !prevItem.text.endsWith(' ') && !item.text.startsWith(' ')) {
            lineText += ' ';
          }
          lineText += item.text;
        }
      }
      line.text = lineText;
    }

    // Phase 4: Handle Visual Image Rendering if Mode is Visual
    let imageData: string | undefined;
    if (mode === 'visual') {
      try {
        const scale = 2.0; // Render at high definition
        const renderViewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = renderViewport.width;
        canvas.height = renderViewport.height;

        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: context,
            viewport: renderViewport
          }).promise;

          imageData = canvas.toDataURL('image/png');
        }
      } catch (renderErr) {
        console.error(`Failed to render page ${pageNum} to canvas image:`, renderErr);
      }
    }

    pagesData.push({
      pageNum,
      pageWidth,
      pageHeight,
      items: rawItems,
      lines,
      imageData
    });

    onProgress(Math.round((pageNum / numPages) * 100));
    // Yield thread to prevent UI freezing
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return pagesData;
}

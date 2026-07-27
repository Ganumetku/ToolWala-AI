import {
  ExtractedCell,
  ExtractedRow,
  EditableSheet,
  AdvancedSettings,
  ExtractionMode,
  OcrLanguage,
  DocClassification
} from '../types';

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
}

/**
 * Parses data type and formatting for cell values
 */
export function parseCellTypeAndValue(
  rawText: string,
  settings: AdvancedSettings
): { dataType: ExtractedCell['dataType']; rawValue: string | number | Date; align: ExtractedCell['align'] } {
  const text = rawText.trim();
  if (!text) {
    return { dataType: 'string', rawValue: '', align: 'left' };
  }

  // Currency
  if (settings.detectCurrency) {
    const currencyRegex = /^[\$₹€£]\s*[\d,]+(\.\d+)?$/;
    const cleanCurrency = text.replace(/[\$₹€£,\s]/g, '');
    if (currencyRegex.test(text) && !isNaN(Number(cleanCurrency))) {
      return { dataType: 'currency', rawValue: text, align: 'right' };
    }
  }

  // Percentage
  if (settings.detectPercentages) {
    if (/^-?[\d,]+(\.\d+)?\s*%$/.test(text)) {
      const numVal = parseFloat(text.replace(/[%,\s]/g, ''));
      if (!isNaN(numVal)) {
        return { dataType: 'percentage', rawValue: `${numVal}%`, align: 'right' };
      }
    }
  }

  // Date
  if (settings.detectDates) {
    const dateRegex = /^(\d{4}[-/]\d{1,2}[-/]\d{1,2})|(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})$/i;
    if (dateRegex.test(text)) {
      const parsedDate = new Date(text);
      if (!isNaN(parsedDate.getTime())) {
        return { dataType: 'date', rawValue: text, align: 'center' };
      }
    }
  }

  // Number
  if (settings.keepNumberFormatting) {
    const cleanNum = text.replace(/,/g, '');
    if (/^-?\d+(\.\d+)?$/.test(cleanNum)) {
      const num = Number(cleanNum);
      if (!isNaN(num)) {
        return { dataType: 'number', rawValue: num, align: 'right' };
      }
    }
  }

  return { dataType: 'string', rawValue: text, align: 'left' };
}

/**
 * Mode 2: Sentence-preserving text paragraph extraction
 */
function extractParagraphTextAsSheets(
  pageTextItems: TextItem[][],
  totalPages: number,
  advancedSettings: AdvancedSettings
): EditableSheet[] {
  const sheets: EditableSheet[] = [];

  for (let p = 0; p < totalPages; p++) {
    const items = pageTextItems[p];
    if (!items || items.length === 0) continue;

    // Group text items by line
    const yTolerance = 5;
    const sortedByY = [...items].sort((a, b) => b.y - a.y);
    const lineMap: { y: number; items: TextItem[] }[] = [];

    for (const item of sortedByY) {
      let matchedLine = lineMap.find(l => Math.abs(l.y - item.y) <= yTolerance);
      if (!matchedLine) {
        matchedLine = { y: item.y, items: [] };
        lineMap.push(matchedLine);
      }
      matchedLine.items.push(item);
    }

    // Assemble paragraphs from consecutive lines
    const rows: ExtractedRow[] = [];
    let currentParagraph = '';
    let isHeading = false;

    for (let i = 0; i < lineMap.length; i++) {
      const line = lineMap[i];
      line.items.sort((a, b) => a.x - b.x);
      const lineText = line.items.map(it => it.str).join(' ').trim();

      if (!lineText) continue;

      // Check if line looks like a title or heading (short, all caps, or isolated)
      const isShortHeading = lineText.length < 50 && (lineText === lineText.toUpperCase() || line.items.some(it => (it.height || 0) > 14));

      if (isShortHeading || currentParagraph === '') {
        if (currentParagraph) {
          const parsed = parseCellTypeAndValue(currentParagraph, advancedSettings);
          rows.push({
            cells: [{ text: currentParagraph, isHeader: isHeading, dataType: parsed.dataType, rawValue: parsed.rawValue, align: 'left' }],
            isHeader: isHeading
          });
        }
        currentParagraph = lineText;
        isHeading = isShortHeading;
      } else {
        // Append line to current paragraph with sentence preservation space
        currentParagraph += ' ' + lineText;
      }
    }

    if (currentParagraph) {
      const parsed = parseCellTypeAndValue(currentParagraph, advancedSettings);
      rows.push({
        cells: [{ text: currentParagraph, isHeader: isHeading, dataType: parsed.dataType, rawValue: parsed.rawValue, align: 'left' }],
        isHeader: isHeading
      });
    }

    if (rows.length > 0) {
      sheets.push({
        id: `text-p${p + 1}`,
        name: `Text (Page ${p + 1})`,
        pageNumber: p + 1,
        rows,
        headers: ['Extracted Text'],
        columnCount: 1,
        rowCount: rows.length
      });
    }
  }

  return sheets;
}

/**
 * Main Extraction Routine supporting Modes 1, 2, 3 and multi-language OCR
 */
export async function extractPdfToExcelSheets(
  pdfDoc: any,
  pdfjs: any,
  mode: ExtractionMode,
  classification: DocClassification,
  advancedSettings: AdvancedSettings,
  enableOcr: boolean = false,
  ocrLanguage: OcrLanguage = 'eng',
  onProgress?: (stepMsg: string, progressPct: number) => void
): Promise<EditableSheet[]> {
  const totalPages = pdfDoc.numPages;
  const sheets: EditableSheet[] = [];

  onProgress?.('Parsing layout structure...', 15);

  const pageTextItems: TextItem[][] = [];
  let totalTextCount = 0;

  for (let p = 1; p <= totalPages; p++) {
    onProgress?.(`Reading page text (${p}/${totalPages})...`, 15 + Math.floor((p / totalPages) * 30));
    const page = await pdfDoc.getPage(p);
    const textContent = await page.getTextContent();

    const items: TextItem[] = (textContent.items || [])
      .map((item: any) => ({
        str: item.str || '',
        x: Math.round((item.transform ? item.transform[4] : 0) * 10) / 10,
        y: Math.round((item.transform ? item.transform[5] : 0) * 10) / 10,
        width: Math.round((item.width || 0) * 10) / 10,
        height: Math.round((item.height || 0) * 10) / 10,
        fontName: item.fontName
      }))
      .filter((i: TextItem) => i.str.trim().length > 0);

    totalTextCount += items.length;
    pageTextItems.push(items);
  }

  const isScanned = (totalTextCount / totalPages) < 8 || enableOcr;

  // Decide effective extraction mode for Smart AI Mode
  let effectiveMode = mode;
  if (mode === 'smart') {
    effectiveMode = classification.hasTables || classification.hasInvoices || classification.hasBankStatements ? 'tables' : 'text';
  }

  // Handle OCR for Scanned PDFs
  if (isScanned) {
    onProgress?.(`Initializing OCR engine (${ocrLanguage})...`, 50);
    try {
      const { createWorker } = await import('tesseract.js');
      // Language selection mapping
      let langCode = 'eng';
      if (ocrLanguage === 'hin') langCode = 'hin';
      else if (ocrLanguage === 'mar') langCode = 'mar';
      else if (ocrLanguage === 'auto') langCode = 'eng+hin';

      const worker = await createWorker(langCode);

      for (let p = 1; p <= totalPages; p++) {
        onProgress?.(`Running OCR on scanned page ${p} of ${totalPages}...`, 50 + Math.floor((p / totalPages) * 35));
        const page = await pdfDoc.getPage(p);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const { data } = await worker.recognize(canvas);

          const lines = data.text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          const ocrRows: ExtractedRow[] = [];

          for (let lIndex = 0; lIndex < lines.length; lIndex++) {
            const line = lines[lIndex];
            const parts = line.split(/\s{2,}|\t|\|/).map(pt => pt.trim()).filter(Boolean);

            if (parts.length > 0) {
              const cells: ExtractedCell[] = parts.map(pt => {
                const parsed = parseCellTypeAndValue(pt, advancedSettings);
                return {
                  text: pt,
                  isHeader: lIndex === 0,
                  dataType: parsed.dataType,
                  rawValue: parsed.rawValue,
                  align: parsed.align
                };
              });
              ocrRows.push({ cells, isHeader: lIndex === 0 });
            }
          }

          if (ocrRows.length > 0) {
            const maxCols = Math.max(...ocrRows.map(r => r.cells.length));
            const headers = ocrRows[0].cells.map(c => c.text);
            sheets.push({
              id: `ocr-sheet-p${p}`,
              name: `OCR Table (Page ${p})`,
              pageNumber: p,
              rows: ocrRows,
              headers,
              columnCount: maxCols,
              rowCount: ocrRows.length
            });
          }
        }
      }
      await worker.terminate();
    } catch (err) {
      console.warn("OCR engine notice:", err);
    }
  }

  // If Text Mode requested
  if (effectiveMode === 'text' && sheets.length === 0) {
    onProgress?.('Extracting text paragraphs into spreadsheet rows...', 75);
    const textSheets = extractParagraphTextAsSheets(pageTextItems, totalPages, advancedSettings);
    sheets.push(...textSheets);
  }

  // Mode 1: Table Extraction (Spatial clustering inspired by Camelot/Tabula)
  if (effectiveMode === 'tables' && sheets.length === 0) {
    onProgress?.('Running Camelot/Tabula spatial table extraction...', 75);

    for (let p = 0; p < totalPages; p++) {
      const items = pageTextItems[p];
      if (!items || items.length === 0) continue;

      const yTolerance = 4;
      const sortedByY = [...items].sort((a, b) => b.y - a.y);
      const lineMap: { y: number; items: TextItem[] }[] = [];

      for (const item of sortedByY) {
        let matchedLine = lineMap.find(l => Math.abs(l.y - item.y) <= yTolerance);
        if (!matchedLine) {
          matchedLine = { y: item.y, items: [] };
          lineMap.push(matchedLine);
        }
        matchedLine.items.push(item);
      }

      for (const line of lineMap) {
        line.items.sort((a, b) => a.x - b.x);
      }

      const potentialRows = lineMap.map(l => l.items).filter(rowItems => rowItems.length >= 2);
      if (potentialRows.length < 2) continue;

      const xPositions: number[] = [];
      for (const rowItems of potentialRows) {
        for (const item of rowItems) {
          const existingX = xPositions.find(x => Math.abs(x - item.x) <= 25);
          if (existingX === undefined) {
            xPositions.push(item.x);
          }
        }
      }
      xPositions.sort((a, b) => a - b);

      if (xPositions.length < 2) continue;

      const extractedRows: ExtractedRow[] = [];

      for (let rIndex = 0; rIndex < potentialRows.length; rIndex++) {
        const rowItems = potentialRows[rIndex];
        const cells: ExtractedCell[] = [];

        for (let cIndex = 0; cIndex < xPositions.length; cIndex++) {
          const colX = xPositions[cIndex];
          const nextColX = cIndex < xPositions.length - 1 ? xPositions[cIndex + 1] : Infinity;

          const item = rowItems.find(it => it.x >= colX - 15 && it.x < nextColX - 10);
          const rawText = item ? item.str.trim() : '';

          if (!rawText && !advancedSettings.preserveEmptyCells) {
            continue;
          }

          const isHeader = rIndex === 0;
          const parsed = parseCellTypeAndValue(rawText, advancedSettings);

          cells.push({
            text: rawText,
            isHeader,
            dataType: parsed.dataType,
            rawValue: parsed.rawValue,
            align: parsed.align
          });
        }

        if (cells.some(c => c.text.length > 0)) {
          extractedRows.push({
            cells,
            isHeader: rIndex === 0
          });
        }
      }

      if (extractedRows.length >= 2) {
        const headers = extractedRows[0].cells.map(c => c.text || `Column`);
        const maxCols = Math.max(...extractedRows.map(r => r.cells.length));

        let sheetTitle = `Table (Page ${p + 1})`;
        if (classification.docType === 'Invoice') sheetTitle = `Invoice Table (P${p + 1})`;
        else if (classification.docType === 'Bank Statement') sheetTitle = `Statement (P${p + 1})`;
        else if (classification.docType === 'Student Record') sheetTitle = `Student List (P${p + 1})`;

        sheets.push({
          id: `table-p${p + 1}`,
          name: sheetTitle,
          pageNumber: p + 1,
          rows: extractedRows,
          headers,
          columnCount: maxCols,
          rowCount: extractedRows.length
        });
      }
    }
  }

  // Fallback to text extraction if no tables were detected
  if (sheets.length === 0 && totalTextCount > 5) {
    const textSheets = extractParagraphTextAsSheets(pageTextItems, totalPages, advancedSettings);
    sheets.push(...textSheets);
  }

  onProgress?.('Extraction finalized.', 95);
  return sheets;
}

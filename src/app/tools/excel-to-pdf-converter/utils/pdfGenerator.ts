import { jsPDF } from 'jspdf';
import { ParsedSheet, PdfOptions, ExcelToPdfResult } from '../types';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function generatePdfFromSheets(
  sheets: ParsedSheet[],
  options: PdfOptions,
  outputFileName: string
): Promise<ExcelToPdfResult> {
  const startTime = performance.now();
  const activeSheets = sheets.filter(s => s.isSelected);

  if (activeSheets.length === 0) {
    throw new Error("No worksheets selected for PDF conversion.");
  }

  // Margin spacing (in mm)
  let marginMm = 15; // normal
  if (options.margins === 'narrow') marginMm = 8;
  if (options.margins === 'wide') marginMm = 25;

  const doc = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: options.pageSize
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const printableWidth = pageWidth - (marginMm * 2);

  let totalPagesCount = 0;
  let totalRowsCount = 0;
  let maxColsCount = 0;

  activeSheets.forEach((sheet, sheetIndex) => {
    if (sheetIndex > 0) {
      doc.addPage();
    }

    totalPagesCount++;
    let currentY = marginMm;

    // Sheet Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59); // Slate-800
    const titleText = options.customTitle ? `${options.customTitle} - ${sheet.name}` : sheet.name;
    doc.text(titleText, marginMm, currentY);
    currentY += 8;

    // Calculate column widths
    const colCount = Math.max(...sheet.rows.map(r => r.cells.length), 1);
    if (colCount > maxColsCount) maxColsCount = colCount;

    const colWidths: number[] = new Array(colCount).fill(10);
    sheet.rows.forEach(row => {
      totalRowsCount++;
      row.cells.forEach((cell, cIdx) => {
        const len = cell.text.length;
        if (len > colWidths[cIdx]) colWidths[cIdx] = len;
      });
    });

    const sumWidths = colWidths.reduce((a, b) => a + b, 0);
    const scaledColWidths = colWidths.map(w => {
      if (options.fitToWidth) {
        return Math.max(12, (w / sumWidths) * printableWidth);
      }
      return Math.min(60, Math.max(16, w * 2.5));
    });

    const rowHeight = 7;

    // Render Rows
    sheet.rows.forEach((row, rIdx) => {
      // Check for Page Break
      if (currentY + rowHeight > pageHeight - marginMm - 10) {
        // Page number footer
        if (options.showPageNumbers) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Page ${totalPagesCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        }

        doc.addPage();
        totalPagesCount++;
        currentY = marginMm;

        // Re-render Header Row on new page if enabled
        if (options.highlightHeaders && sheet.rows[0]) {
          doc.setFillColor(238, 242, 255); // Indigo-50
          doc.rect(marginMm, currentY, printableWidth, rowHeight, 'F');
          let xHeaderPos = marginMm;
          sheet.rows[0].cells.forEach((headerCell, cIdx) => {
            const cWidth = scaledColWidths[cIdx] || 20;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(30, 58, 138);
            doc.text(headerCell.text.substring(0, 20), xHeaderPos + 2, currentY + 5);
            xHeaderPos += cWidth;
          });
          currentY += rowHeight;
        }
      }

      // Render Row background for header
      if (rIdx === 0 && options.highlightHeaders) {
        doc.setFillColor(238, 242, 255);
        doc.rect(marginMm, currentY, printableWidth, rowHeight, 'F');
      }

      let currentX = marginMm;

      row.cells.forEach((cell, cIdx) => {
        const colW = scaledColWidths[cIdx] || 20;

        // Render Cell Border / Gridlines
        if (options.includeGridlines) {
          doc.setDrawColor(226, 232, 240); // Slate-200
          doc.setLineWidth(0.1);
          doc.rect(currentX, currentY, colW, rowHeight);
        }

        // Cell Text Formatting
        doc.setFont("helvetica", rIdx === 0 && options.highlightHeaders ? "bold" : "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);

        const truncateLen = Math.floor(colW / 2.2);
        const cellStr = cell.text.length > truncateLen ? cell.text.substring(0, truncateLen - 1) + '…' : cell.text;

        const posX = cell.align === 'right' ? currentX + colW - 2 : currentX + 2;
        const alignOpt = cell.align === 'right' ? 'right' : 'left';

        doc.text(cellStr, posX, currentY + 4.8, { align: alignOpt as any });

        currentX += colW;
      });

      currentY += rowHeight;
    });

    // Page number footer for last page of sheet
    if (options.showPageNumbers) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${totalPagesCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    }
  });

  const pdfArrayBuffer = doc.output('arraybuffer');
  const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });

  const endTime = performance.now();
  const processingTimeMs = Math.round(endTime - startTime);
  const cleanFileName = outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`;

  return {
    pagesGenerated: totalPagesCount,
    sheetsConverted: activeSheets.length,
    totalRows: totalRowsCount,
    totalColumns: maxColsCount,
    processingTimeMs,
    outputFileSizeFormatted: formatBytes(blob.size),
    blob,
    fileName: cleanFileName
  };
}

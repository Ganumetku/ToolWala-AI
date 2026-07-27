export interface ParsedSheetCell {
  text: string;
  rawValue?: any;
  align?: 'left' | 'center' | 'right';
  isHeader?: boolean;
}

export interface ParsedSheetRow {
  cells: ParsedSheetCell[];
  isHeader?: boolean;
}

export interface ParsedSheet {
  id: string;
  name: string;
  rows: ParsedSheetRow[];
  headers: string[];
  columnCount: number;
  rowCount: number;
  isSelected: boolean;
}

export type PdfOrientation = 'portrait' | 'landscape';
export type PdfPageSize = 'a4' | 'letter' | 'legal' | 'a3';
export type PdfMargins = 'normal' | 'narrow' | 'wide';

export interface PdfOptions {
  orientation: PdfOrientation;
  pageSize: PdfPageSize;
  margins: PdfMargins;
  fitToWidth: boolean;
  includeGridlines: boolean;
  highlightHeaders: boolean;
  showPageNumbers: boolean;
  customTitle: string;
}

export interface ConversionStepStatus {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

export interface ExcelToPdfResult {
  pagesGenerated: number;
  sheetsConverted: number;
  totalRows: number;
  totalColumns: number;
  processingTimeMs: number;
  outputFileSizeFormatted: string;
  blob: Blob;
  fileName: string;
}

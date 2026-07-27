export type ExtractionMode = 'tables' | 'text' | 'smart';

export type DocType = 
  | 'Invoice'
  | 'Bank Statement'
  | 'Form'
  | 'Student Record'
  | 'Medical Report'
  | 'Business Report'
  | 'General Document';

export interface DocClassification {
  isTextBased: boolean;
  isScanned: boolean;
  hasTables: boolean;
  hasForms: boolean;
  hasInvoices: boolean;
  hasBankStatements: boolean;
  ocrRequired: boolean;
  docType: DocType;
  confidenceScore: number; // e.g. 98 or 85
  pageCount: number;
  tablesDetectedCount: number;
}

export interface ExtractedCell {
  text: string;
  isHeader?: boolean;
  colSpan?: number;
  rowSpan?: number;
  dataType?: 'string' | 'number' | 'date' | 'currency' | 'percentage';
  rawValue?: string | number | Date;
  align?: 'left' | 'center' | 'right';
}

export interface ExtractedRow {
  cells: ExtractedCell[];
  isHeader?: boolean;
}

export interface EditableSheet {
  id: string;
  name: string;
  pageNumber: number;
  rows: ExtractedRow[];
  headers: string[];
  columnCount: number;
  rowCount: number;
  isDeleted?: boolean;
}

export type ExportMode = 'entire' | 'selected';
export type TableSelectionMode = 'all' | 'selected';

export interface AdvancedSettings {
  preserveFormatting: boolean;
  preserveEmptyCells: boolean;
  detectMergedCells: boolean;
  autoFormatColumns: boolean;
  keepNumberFormatting: boolean;
  detectDates: boolean;
  detectCurrency: boolean;
  detectPercentages: boolean;
  keepEmptyRows: boolean;
  detectHeaders: boolean;
}

export interface ExportOptions {
  outputFormat: 'xlsx';
  extractionMode: ExtractionMode;
  exportMode: ExportMode;
  pageRange: string;
  tableSelection: TableSelectionMode;
  selectedTableIds: string[];
}

export type OcrLanguage = 'eng' | 'hin' | 'mar' | 'auto';

export interface ConversionStepStatus {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

export interface ConversionResult {
  pagesConverted: number;
  tablesExtracted: number;
  totalRows: number;
  totalColumns: number;
  ocrConfidence: number;
  processingTimeMs: number;
  outputFileSizeFormatted: string;
  blob: Blob;
  fileName: string;
}

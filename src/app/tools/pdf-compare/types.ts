export type DiffViewMode = 'side-by-side' | 'unified';

export interface DiffWordPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface SideBySideRow {
  leftLineNum?: number;
  rightLineNum?: number;
  leftText?: string;
  rightText?: string;
  leftWords?: DiffWordPart[];
  rightWords?: DiffWordPart[];
  type: 'unchanged' | 'modified' | 'added' | 'removed';
}

export interface UnifiedRow {
  type: 'unchanged' | 'added' | 'removed';
  lineNumLeft?: number;
  lineNumRight?: number;
  text: string;
  words?: DiffWordPart[];
}

export interface PageTextData {
  pageNum: number;
  rawText: string;
  lines: string[];
  charCount: number;
  wordCount: number;
}

export interface ExtractedPdfDocument {
  name: string;
  size: number;
  totalPages: number;
  pages: PageTextData[];
  isScanned: boolean;
  isEncrypted?: boolean;
}

export interface PageDiffResult {
  pageNum: number;
  hasFileA: boolean;
  hasFileB: boolean;
  sideBySideRows: SideBySideRow[];
  unifiedRows: UnifiedRow[];
  inlineWords: DiffWordPart[];
  addedWordsCount: number;
  removedWordsCount: number;
  unchangedWordsCount: number;
  differencesCount: number;
  similarity: number; // 0 - 100%
  status: 'identical' | 'modified' | 'added_page' | 'removed_page';
}

export interface ComparisonSummary {
  totalPagesCompared: number;
  fileAPages: number;
  fileBPages: number;
  totalDifferences: number;
  similarityPercentage: number;
  addedWordsTotal: number;
  removedWordsTotal: number;
  unchangedWordsTotal: number;
  pageResults: PageDiffResult[];
}

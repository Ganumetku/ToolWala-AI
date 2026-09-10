/* eslint-disable @typescript-eslint/no-explicit-any */
import { diffWordsWithSpace, diffLines } from 'diff';
import {
  ExtractedPdfDocument,
  PageTextData,
  PageDiffResult,
  ComparisonSummary,
  SideBySideRow,
  UnifiedRow,
  DiffWordPart,
  DiffViewMode,
} from '../types';

/**
 * Extracts text page-by-page from a PDF file using PDF.js.
 * Properly calculates text flow, word spaces, and detects scanned/empty documents.
 */
export async function extractPdfText(
  pdfjs: any,
  file: File,
  onProgress?: (percent: number, currentAction: string) => void
): Promise<ExtractedPdfDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const safeBuffer = arrayBuffer.slice(0);

  let doc: any;
  try {
    const loadingTask = pdfjs.getDocument({ data: safeBuffer });
    doc = await loadingTask.promise;
  } catch (err: any) {
    if (
      err?.name === 'PasswordException' ||
      err?.message?.toLowerCase().includes('password') ||
      err?.message?.toLowerCase().includes('encrypted')
    ) {
      const customErr = new Error('PASSWORD_PROTECTED');
      customErr.name = 'PasswordProtectedError';
      throw customErr;
    }
    throw err;
  }

  const totalPages = doc.numPages;
  const pages: PageTextData[] = [];
  let totalChars = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.(
      Math.round(((pageNum - 0.5) / totalPages) * 100),
      `Extracting text from page ${pageNum} of ${totalPages}...`
    );

    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Map and normalize text items
    const rawItems = textContent.items.map((item: any) => ({
      text: item.str || '',
      x: item.transform[4] || 0,
      y: item.transform[5] || 0,
      width: item.width || 0,
      height: item.height || Math.abs(item.transform[3]) || 10,
      fontSize: Math.abs(item.transform[3]) || item.height || 10,
    }));

    // Sort items: Y descending (top to bottom), X ascending (left to right)
    rawItems.sort((a: any, b: any) => {
      if (Math.abs(a.y - b.y) > 3) {
        return b.y - a.y;
      }
      return a.x - b.x;
    });

    // Group items into lines based on Y coordinates
    interface LineBucket {
      y: number;
      items: typeof rawItems;
    }
    const lineBuckets: LineBucket[] = [];

    for (const item of rawItems) {
      if (!item.text.trim() && item.text !== ' ') continue;

      const threshold = Math.max(item.height * 0.45, 4);
      let foundBucket = false;

      for (const bucket of lineBuckets) {
        if (Math.abs(item.y - bucket.y) <= threshold) {
          bucket.items.push(item);
          foundBucket = true;
          break;
        }
      }

      if (!foundBucket) {
        lineBuckets.push({
          y: item.y,
          items: [item],
        });
      }
    }

    // Sort lines top to bottom
    lineBuckets.sort((a, b) => b.y - a.y);

    const assembledLines: string[] = [];

    for (const bucket of lineBuckets) {
      // Sort items horizontally
      bucket.items.sort((a: any, b: any) => a.x - b.x);

      let lineText = '';
      for (let i = 0; i < bucket.items.length; i++) {
        const item = bucket.items[i];
        if (i === 0) {
          lineText += item.text;
        } else {
          const prev = bucket.items[i - 1];
          const xGap = item.x - (prev.x + prev.width);
          const spaceThreshold = prev.fontSize * 0.22;

          if (xGap >= spaceThreshold && !prev.text.endsWith(' ') && !item.text.startsWith(' ')) {
            lineText += ' ';
          }
          lineText += item.text;
        }
      }

      const trimmed = lineText.trim();
      if (trimmed.length > 0) {
        assembledLines.push(trimmed);
      }
    }

    const fullPageText = assembledLines.join('\n');
    const pageChars = fullPageText.replace(/\s+/g, '').length;
    totalChars += pageChars;

    const words = fullPageText.trim().length > 0 ? fullPageText.trim().split(/\s+/) : [];

    pages.push({
      pageNum,
      rawText: fullPageText,
      lines: assembledLines,
      charCount: pageChars,
      wordCount: words.length,
    });
  }

  // Scanned PDF detection heuristic: less than 15 alphanumeric/printable characters per page
  const isScanned = totalPages > 0 && totalChars < 15 * totalPages;

  onProgress?.(100, 'Text extraction complete.');

  return {
    name: file.name,
    size: file.size,
    totalPages,
    pages,
    isScanned,
  };
}

/**
 * Computes difference between two pages of text
 */
export function computePageDiff(
  pageA: PageTextData | null,
  pageB: PageTextData | null,
  pageNum: number
): PageDiffResult {
  // Case 1: Page added in File B (File A ended earlier)
  if (!pageA && pageB) {
    const lines = pageB.lines.length > 0 ? pageB.lines : [''];
    const sideBySideRows: SideBySideRow[] = lines.map((line, idx) => ({
      rightLineNum: idx + 1,
      rightText: line,
      rightWords: [{ value: line, added: true }],
      type: 'added',
    }));

    const unifiedRows: UnifiedRow[] = lines.map((line, idx) => ({
      type: 'added',
      lineNumRight: idx + 1,
      text: line,
      words: [{ value: line, added: true }],
    }));

    return {
      pageNum,
      hasFileA: false,
      hasFileB: true,
      sideBySideRows,
      unifiedRows,
      inlineWords: [{ value: pageB.rawText, added: true }],
      addedWordsCount: pageB.wordCount,
      removedWordsCount: 0,
      unchangedWordsCount: 0,
      differencesCount: 1,
      similarity: 0,
      status: 'added_page',
    };
  }

  // Case 2: Page removed in File B (File B ended earlier)
  if (pageA && !pageB) {
    const lines = pageA.lines.length > 0 ? pageA.lines : [''];
    const sideBySideRows: SideBySideRow[] = lines.map((line, idx) => ({
      leftLineNum: idx + 1,
      leftText: line,
      leftWords: [{ value: line, removed: true }],
      type: 'removed',
    }));

    const unifiedRows: UnifiedRow[] = lines.map((line, idx) => ({
      type: 'removed',
      lineNumLeft: idx + 1,
      text: line,
      words: [{ value: line, removed: true }],
    }));

    return {
      pageNum,
      hasFileA: true,
      hasFileB: false,
      sideBySideRows,
      unifiedRows,
      inlineWords: [{ value: pageA.rawText, removed: true }],
      addedWordsCount: 0,
      removedWordsCount: pageA.wordCount,
      unchangedWordsCount: 0,
      differencesCount: 1,
      similarity: 0,
      status: 'removed_page',
    };
  }

  // Case 3: Both pages exist
  const textA = pageA?.rawText || '';
  const textB = pageB?.rawText || '';

  // Identical check
  if (textA === textB) {
    const lines = pageA?.lines || [];
    const sideBySideRows: SideBySideRow[] = lines.map((line, idx) => ({
      leftLineNum: idx + 1,
      rightLineNum: idx + 1,
      leftText: line,
      rightText: line,
      leftWords: [{ value: line }],
      rightWords: [{ value: line }],
      type: 'unchanged',
    }));

    const unifiedRows: UnifiedRow[] = lines.map((line, idx) => ({
      type: 'unchanged',
      lineNumLeft: idx + 1,
      lineNumRight: idx + 1,
      text: line,
      words: [{ value: line }],
    }));

    const wordCount = pageA?.wordCount || 0;

    return {
      pageNum,
      hasFileA: true,
      hasFileB: true,
      sideBySideRows,
      unifiedRows,
      inlineWords: [{ value: textA }],
      addedWordsCount: 0,
      removedWordsCount: 0,
      unchangedWordsCount: wordCount,
      differencesCount: 0,
      similarity: 100,
      status: 'identical',
    };
  }

  // Detailed Word Diff
  const wordDiffResults = diffWordsWithSpace(textA, textB);
  let addedWordsCount = 0;
  let removedWordsCount = 0;
  let unchangedWordsCount = 0;
  let diffChunksCount = 0;

  const inlineWords: DiffWordPart[] = wordDiffResults.map((part) => {
    const wordList = part.value.trim().length > 0 ? part.value.trim().split(/\s+/) : [];
    if (part.added) {
      addedWordsCount += wordList.length;
      diffChunksCount++;
    } else if (part.removed) {
      removedWordsCount += wordList.length;
      diffChunksCount++;
    } else {
      unchangedWordsCount += wordList.length;
    }
    return {
      value: part.value,
      added: part.added,
      removed: part.removed,
    };
  });

  const totalWords = unchangedWordsCount + addedWordsCount + removedWordsCount;
  const similarity =
    totalWords === 0
      ? 100
      : Math.max(0, Math.min(100, Math.round((unchangedWordsCount / totalWords) * 100)));

  // Line-level diff alignment for Side-by-Side and Unified views
  const lineDiffResults = diffLines(textA, textB);
  const sideBySideRows: SideBySideRow[] = [];
  const unifiedRows: UnifiedRow[] = [];

  let lineLeft = 1;
  let lineRight = 1;

  for (let i = 0; i < lineDiffResults.length; i++) {
    const chunk = lineDiffResults[i];
    const chunkLines = chunk.value.endsWith('\n')
      ? chunk.value.slice(0, -1).split('\n')
      : chunk.value.split('\n');

    if (!chunk.added && !chunk.removed) {
      // Unchanged lines on both sides
      for (const line of chunkLines) {
        sideBySideRows.push({
          leftLineNum: lineLeft,
          rightLineNum: lineRight,
          leftText: line,
          rightText: line,
          leftWords: [{ value: line }],
          rightWords: [{ value: line }],
          type: 'unchanged',
        });

        unifiedRows.push({
          type: 'unchanged',
          lineNumLeft: lineLeft,
          lineNumRight: lineRight,
          text: line,
          words: [{ value: line }],
        });

        lineLeft++;
        lineRight++;
      }
    } else if (chunk.removed) {
      // Check if next chunk is added — pair them as modified lines!
      const nextChunk = lineDiffResults[i + 1];
      if (nextChunk && nextChunk.added) {
        i++; // Consume next chunk
        const nextLines = nextChunk.value.endsWith('\n')
          ? nextChunk.value.slice(0, -1).split('\n')
          : nextChunk.value.split('\n');

        const maxLen = Math.max(chunkLines.length, nextLines.length);

        for (let j = 0; j < maxLen; j++) {
          const leftStr = chunkLines[j];
          const rightStr = nextLines[j];

          const currentLeftNum = leftStr !== undefined ? lineLeft++ : undefined;
          const currentRightNum = rightStr !== undefined ? lineRight++ : undefined;

          // Intra-line word diff if both exist
          let leftWords: DiffWordPart[] | undefined;
          let rightWords: DiffWordPart[] | undefined;

          if (leftStr !== undefined && rightStr !== undefined) {
            const intraWordDiff = diffWordsWithSpace(leftStr, rightStr);
            leftWords = intraWordDiff
              .filter((p) => !p.added)
              .map((p) => ({ value: p.value, removed: p.removed }));
            rightWords = intraWordDiff
              .filter((p) => !p.removed)
              .map((p) => ({ value: p.value, added: p.added }));
          } else if (leftStr !== undefined) {
            leftWords = [{ value: leftStr, removed: true }];
          } else if (rightStr !== undefined) {
            rightWords = [{ value: rightStr, added: true }];
          }

          sideBySideRows.push({
            leftLineNum: currentLeftNum,
            rightLineNum: currentRightNum,
            leftText: leftStr,
            rightText: rightStr,
            leftWords,
            rightWords,
            type: 'modified',
          });

          // Unified view adds deletion then addition
          if (leftStr !== undefined) {
            unifiedRows.push({
              type: 'removed',
              lineNumLeft: currentLeftNum,
              text: leftStr,
              words: leftWords,
            });
          }
          if (rightStr !== undefined) {
            unifiedRows.push({
              type: 'added',
              lineNumRight: currentRightNum,
              text: rightStr,
              words: rightWords,
            });
          }
        }
      } else {
        // Pure removals
        for (const line of chunkLines) {
          sideBySideRows.push({
            leftLineNum: lineLeft,
            leftText: line,
            leftWords: [{ value: line, removed: true }],
            type: 'removed',
          });

          unifiedRows.push({
            type: 'removed',
            lineNumLeft: lineLeft,
            text: line,
            words: [{ value: line, removed: true }],
          });

          lineLeft++;
        }
      }
    } else if (chunk.added) {
      // Pure additions
      for (const line of chunkLines) {
        sideBySideRows.push({
          rightLineNum: lineRight,
          rightText: line,
          rightWords: [{ value: line, added: true }],
          type: 'added',
        });

        unifiedRows.push({
          type: 'added',
          lineNumRight: lineRight,
          text: line,
          words: [{ value: line, added: true }],
        });

        lineRight++;
      }
    }
  }

  return {
    pageNum,
    hasFileA: true,
    hasFileB: true,
    sideBySideRows,
    unifiedRows,
    inlineWords,
    addedWordsCount,
    removedWordsCount,
    unchangedWordsCount,
    differencesCount: diffChunksCount,
    similarity,
    status: 'modified',
  };
}

/**
 * Compares two extracted PDF documents
 */
export function comparePdfDocuments(
  docA: ExtractedPdfDocument,
  docB: ExtractedPdfDocument
): ComparisonSummary {
  const maxPages = Math.max(docA.totalPages, docB.totalPages);
  const pageResults: PageDiffResult[] = [];

  let totalDiffs = 0;
  let totalAdded = 0;
  let totalRemoved = 0;
  let totalUnchanged = 0;

  for (let p = 1; p <= maxPages; p++) {
    const pageA = docA.pages.find((pg) => pg.pageNum === p) || null;
    const pageB = docB.pages.find((pg) => pg.pageNum === p) || null;

    const result = computePageDiff(pageA, pageB, p);
    pageResults.push(result);

    totalDiffs += result.differencesCount;
    totalAdded += result.addedWordsCount;
    totalRemoved += result.removedWordsCount;
    totalUnchanged += result.unchangedWordsCount;
  }

  const grandTotalWords = totalUnchanged + totalAdded + totalRemoved;
  const overallSimilarity =
    grandTotalWords === 0
      ? 100
      : Math.max(0, Math.min(100, Math.round((totalUnchanged / grandTotalWords) * 100)));

  return {
    totalPagesCompared: maxPages,
    fileAPages: docA.totalPages,
    fileBPages: docB.totalPages,
    totalDifferences: totalDiffs,
    similarityPercentage: overallSimilarity,
    addedWordsTotal: totalAdded,
    removedWordsTotal: totalRemoved,
    unchangedWordsTotal: totalUnchanged,
    pageResults,
  };
}

/**
 * Escapes HTML characters for safe report generation
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates an offline, self-contained HTML Comparison Report with modern styles
 */
export function generateComparisonReportHtml(
  docA: ExtractedPdfDocument,
  docB: ExtractedPdfDocument,
  summary: ComparisonSummary,
  viewMode: DiffViewMode
): string {
  const generatedDate = new Date().toLocaleString();

  let diffContentHtml = '';

  for (const page of summary.pageResults) {
    diffContentHtml += `
      <div class="page-container">
        <div class="page-header">
          <h3>Page ${page.pageNum}</h3>
          <span class="page-badge badge-${page.status}">
            ${
              page.status === 'identical'
                ? 'Identical'
                : page.status === 'added_page'
                ? '+ Added Page in Document B'
                : page.status === 'removed_page'
                ? '- Missing in Document B'
                : `${page.differencesCount} differences (${page.similarity}% similarity)`
            }
          </span>
        </div>
    `;

    if (viewMode === 'side-by-side') {
      diffContentHtml += `
        <div class="side-by-side-table">
          <div class="column-header">
            <span class="file-label">Original: ${escapeHtml(docA.name)}</span>
          </div>
          <div class="column-header">
            <span class="file-label">Modified: ${escapeHtml(docB.name)}</span>
          </div>
      `;

      for (const row of page.sideBySideRows) {
        // Left Cell
        let leftContent = '';
        if (row.leftWords) {
          leftContent = row.leftWords
            .map((w) =>
              w.removed
                ? `<span class="diff-removed">${escapeHtml(w.value)}</span>`
                : escapeHtml(w.value)
            )
            .join('');
        } else {
          leftContent = escapeHtml(row.leftText || '');
        }

        // Right Cell
        let rightContent = '';
        if (row.rightWords) {
          rightContent = row.rightWords
            .map((w) =>
              w.added
                ? `<span class="diff-added">${escapeHtml(w.value)}</span>`
                : escapeHtml(w.value)
            )
            .join('');
        } else {
          rightContent = escapeHtml(row.rightText || '');
        }

        diffContentHtml += `
          <div class="row-left row-${row.type}">
            <span class="line-num">${row.leftLineNum || ''}</span>
            <span class="line-text">${leftContent || '&nbsp;'}</span>
          </div>
          <div class="row-right row-${row.type}">
            <span class="line-num">${row.rightLineNum || ''}</span>
            <span class="line-text">${rightContent || '&nbsp;'}</span>
          </div>
        `;
      }

      diffContentHtml += `</div>`;
    } else {
      // Unified view
      diffContentHtml += `<div class="unified-table">`;
      for (const row of page.unifiedRows) {
        let content = '';
        if (row.words) {
          content = row.words
            .map((w) => {
              if (w.added) return `<span class="diff-added">${escapeHtml(w.value)}</span>`;
              if (w.removed) return `<span class="diff-removed">${escapeHtml(w.value)}</span>`;
              return escapeHtml(w.value);
            })
            .join('');
        } else {
          content = escapeHtml(row.text);
        }

        const symbol = row.type === 'added' ? '+' : row.type === 'removed' ? '-' : ' ';
        diffContentHtml += `
          <div class="unified-row row-${row.type}">
            <span class="line-num">${row.lineNumLeft || ''}</span>
            <span class="line-num">${row.lineNumRight || ''}</span>
            <span class="line-symbol">${symbol}</span>
            <span class="line-text">${content || '&nbsp;'}</span>
          </div>
        `;
      }
      diffContentHtml += `</div>`;
    }

    diffContentHtml += `</div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PDF Comparison Report | ToolWala AI</title>
  <style>
    :root {
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --text: #0F172A;
      --text-muted: #64748B;
      --border: #E2E8F0;
      --green-bg: #DCFCE7;
      --green-text: #166534;
      --green-border: #86EFAC;
      --red-bg: #FEE2E2;
      --red-text: #991B1B;
      --red-border: #FCA5A5;
      --blue: #2563EB;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #090D16;
        --card-bg: #111827;
        --text: #F1F5F9;
        --text-muted: #94A3B8;
        --border: #1F2937;
        --green-bg: #064E3B;
        --green-text: #6EE7B7;
        --green-border: #047857;
        --red-bg: #7F1D1D;
        --red-text: #FCA5A5;
        --red-border: #B91C1C;
        --blue: #3B82F6;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      padding: 30px 20px;
      line-height: 1.5;
    }
    .report-wrapper { max-width: 1100px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--border);
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .brand { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
    .brand span { color: var(--blue); }
    .timestamp { font-size: 12px; color: var(--text-muted); }
    .title-section h1 { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
    .files-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
      margin-bottom: 25px;
    }
    .file-box {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 18px;
    }
    .file-box-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; }
    .file-box-name { font-size: 14px; font-weight: 700; word-break: break-all; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .stat-val { font-size: 24px; font-weight: 900; margin-bottom: 2px; }
    .stat-val.sim { color: var(--blue); }
    .stat-val.add { color: #10B981; }
    .stat-val.rem { color: #EF4444; }
    .stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
    .page-container {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      margin-bottom: 24px;
      overflow: hidden;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0,0,0,0.02);
      border-bottom: 1px solid var(--border);
      padding: 12px 18px;
    }
    .page-header h3 { font-size: 15px; font-weight: 800; }
    .page-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-identical { background: var(--green-bg); color: var(--green-text); }
    .badge-modified { background: #FEF3C7; color: #92400E; }
    .badge-added_page { background: var(--green-bg); color: var(--green-text); }
    .badge-removed_page { background: var(--red-bg); color: var(--red-text); }

    .side-by-side-table {
      display: grid;
      grid-template-columns: 1fr 1fr;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
    }
    .column-header {
      background: rgba(0,0,0,0.03);
      padding: 8px 14px;
      font-weight: 800;
      font-size: 11px;
      border-bottom: 1px solid var(--border);
    }
    .column-header:first-child { border-right: 1px solid var(--border); }
    .row-left, .row-right {
      display: flex;
      padding: 4px 10px;
      min-height: 24px;
      align-items: flex-start;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .row-left { border-right: 1px solid var(--border); }
    .line-num {
      width: 32px;
      flex-shrink: 0;
      font-size: 10px;
      color: var(--text-muted);
      user-select: none;
    }
    .line-text {
      flex: 1;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .row-removed { background-color: rgba(239, 68, 68, 0.08); }
    .row-added { background-color: rgba(16, 185, 129, 0.08); }
    .diff-added {
      background-color: var(--green-bg);
      color: var(--green-text);
      border-radius: 3px;
      padding: 1px 3px;
      font-weight: bold;
    }
    .diff-removed {
      background-color: var(--red-bg);
      color: var(--red-text);
      text-decoration: line-through;
      border-radius: 3px;
      padding: 1px 3px;
      font-weight: bold;
    }

    .unified-table {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
    }
    .unified-row {
      display: flex;
      padding: 4px 10px;
      min-height: 24px;
      align-items: flex-start;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .line-symbol {
      width: 20px;
      font-weight: bold;
      flex-shrink: 0;
      user-select: none;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 12px;
      color: var(--text-muted);
    }
    @media print {
      body { background: white; color: black; padding: 0; }
      .page-container { break-inside: avoid; border: 1px solid #ccc; margin-bottom: 20px; }
      .brand span { color: #000; }
    }
  </style>
</head>
<body>
  <div class="report-wrapper">
    <div class="header">
      <div class="brand">ToolWala <span>AI</span></div>
      <div class="timestamp">Generated on ${generatedDate}</div>
    </div>

    <div class="title-section">
      <h1>PDF Comparison Report</h1>
      <p style="color: var(--text-muted); font-size: 14px;">100% Client-Side In-Browser Text Diff Inspection</p>
    </div>

    <div class="files-meta">
      <div class="file-box">
        <div class="file-box-title">Document A (Original)</div>
        <div class="file-box-name">${escapeHtml(docA.name)}</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${docA.totalPages} Page(s)</div>
      </div>
      <div class="file-box">
        <div class="file-box-title">Document B (Modified)</div>
        <div class="file-box-name">${escapeHtml(docB.name)}</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${docB.totalPages} Page(s)</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-val sim">${summary.similarityPercentage}%</div>
        <div class="stat-label">Similarity</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${summary.totalDifferences}</div>
        <div class="stat-label">Differences</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${summary.totalPagesCompared}</div>
        <div class="stat-label">Pages Checked</div>
      </div>
      <div class="stat-card">
        <div class="stat-val add">+${summary.addedWordsTotal}</div>
        <div class="stat-label">Words Added</div>
      </div>
      <div class="stat-card">
        <div class="stat-val rem">-${summary.removedWordsTotal}</div>
        <div class="stat-label">Words Removed</div>
      </div>
    </div>

    ${diffContentHtml}

    <div class="footer">
      Generated locally with ToolWala AI &bull; Zero Server Uploads &bull; Private & Secure
    </div>
  </div>
</body>
</html>`;
}

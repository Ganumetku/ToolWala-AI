import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

/**
 * Word → PDF conversion.
 *
 * Previous implementation unzipped document.xml, extracted a subset of runs,
 * and rebuilt an A4 Helvetica PDF with jsPDF. That discards fonts, page size,
 * margins, styles.xml, numbering, headers/footers, and real table geometry.
 *
 * This engine renders the DOCX with docx-preview (OOXML → paginated HTML that
 * keeps Word page size, margins, styles, tables, headers/footers, and images),
 * then captures each page into the PDF. Visual match is the goal; the PDF pages
 * are rasterized, so text is not selectable.
 */

export type ConvertProgress = {
  page: number;
  total: number;
  phase: 'render' | 'capture';
};

type ConvertOptions = {
  onProgress?: (progress: ConvertProgress) => void;
};

const CSS_PX_TO_PT = 72 / 96;
const HOST_ID = 'toolwala-docx-pdf-host';
const CAPTURE_SCALE = 2;

const FONT_FALLBACK_CSS = `
@font-face { font-family: 'Calibri'; src: local('Calibri'), local('Carlito'), local('Liberation Sans'), local('Arial'); }
@font-face { font-family: 'Calibri Light'; src: local('Calibri Light'), local('Carlito'), local('Arial'); }
@font-face { font-family: 'Cambria'; src: local('Cambria'), local('Liberation Serif'), local('Georgia'), local('Times New Roman'); }
@font-face { font-family: 'Cambria Math'; src: local('Cambria Math'), local('Cambria'), local('Times New Roman'); }
@font-face { font-family: 'Times New Roman'; src: local('Times New Roman'), local('Times'), local('Liberation Serif'); }
@font-face { font-family: 'Arial'; src: local('Arial'), local('Helvetica'), local('Liberation Sans'); }
@font-face { font-family: 'Arial Black'; src: local('Arial Black'), local('Arial'); }
@font-face { font-family: 'Georgia'; src: local('Georgia'), local('Cambria'), local('Times New Roman'); }
@font-face { font-family: 'Courier New'; src: local('Courier New'), local('Courier'), local('Liberation Mono'); }
@font-face { font-family: 'Verdana'; src: local('Verdana'), local('Geneva'), local('Arial'); }
@font-face { font-family: 'Tahoma'; src: local('Tahoma'), local('Verdana'), local('Arial'); }
@font-face { font-family: 'Comic Sans MS'; src: local('Comic Sans MS'), local('Comic Sans'), local('Chalkboard SE'); }
@font-face { font-family: 'Trebuchet MS'; src: local('Trebuchet MS'), local('Trebuchet'), local('Arial'); }
@font-face { font-family: 'Garamond'; src: local('Garamond'), local('EB Garamond'), local('Times New Roman'); }
@font-face { font-family: 'Palatino Linotype'; src: local('Palatino Linotype'), local('Palatino'), local('Book Antiqua'); }
`;

const HOST_RESET_CSS = `
.toolwala-docx-pdf-host { color-scheme: light; }
.toolwala-docx-pdf-host, .toolwala-docx-pdf-host * { box-sizing: border-box; }
.toolwala-docx-pdf-host img { max-width: none !important; max-height: none !important; display: inline-block; }
.toolwala-docx-pdf-host section.docx { box-shadow: none !important; margin: 0 0 24px !important; background: #fff !important; }
.toolwala-docx-pdf-host .docx-wrapper { background: #ffffff !important; padding: 0 !important; gap: 0 !important; }
.toolwala-docx-pdf-host table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}
.toolwala-docx-pdf-host table.layout-table,
.toolwala-docx-pdf-host table.layout-table td,
.toolwala-docx-pdf-host table.layout-table th {
  border: none !important;
  border-width: 0 !important;
  outline: none !important;
}
`;

function collectPages(root: ParentNode): HTMLElement[] {
  const sections = Array.from(root.querySelectorAll('section.docx')) as HTMLElement[];
  if (sections.length > 0) return sections;

  const wrapperPages = Array.from(
    root.querySelectorAll('.docx-wrapper > section, .docx-wrapper > article')
  ) as HTMLElement[];
  if (wrapperPages.length > 0) return wrapperPages;

  return Array.from(root.querySelectorAll('.docx-wrapper > *')) as HTMLElement[];
}

function isOneColumnTable(table: HTMLTableElement): boolean {
  if (table.rows.length === 0) return false;
  return Array.from(table.rows).every((row) => row.cells.length <= 1);
}

function stripCellBorders(el: HTMLElement) {
  el.style.border = 'none';
  el.style.borderWidth = '0';
  el.style.borderStyle = 'none';
  el.style.outline = 'none';
  el.style.boxShadow = 'none';
}

function neutralizeLayoutTables(root: ParentNode) {
  const tables = Array.from(root.querySelectorAll('table')) as HTMLTableElement[];
  for (const table of tables) {
    table.style.borderCollapse = 'separate';
    table.style.borderSpacing = '0';

    if (!isOneColumnTable(table)) continue;

    table.classList.add('layout-table');
    stripCellBorders(table);
    for (const cell of Array.from(table.querySelectorAll('td, th')) as HTMLElement[]) {
      stripCellBorders(cell);
    }
  }
}

function pageTargetHeight(page: HTMLElement): number {
  const style = getComputedStyle(page);
  return parseFloat(style.minHeight) || parseFloat(style.height) || 0;
}

function paginateOverflowingPages(root: ParentNode) {
  const pages = collectPages(root);
  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];
    const targetHeight = pageTargetHeight(page);
    if (!targetHeight) continue;

    page.style.height = `${targetHeight}px`;
    page.style.minHeight = `${targetHeight}px`;
    page.style.overflow = 'hidden';

    let article = page.querySelector(':scope > article') as HTMLElement | null;
    if (!article || article.childElementCount < 2) continue;

    const header = page.querySelector(':scope > header') as HTMLElement | null;
    const footer = page.querySelector(':scope > footer') as HTMLElement | null;
    const reserved = (header?.offsetHeight || 0) + (footer?.offsetHeight || 0);
    const available = Math.max(80, targetHeight - reserved - 8);

    let guard = 0;
    while (guard++ < 40) {
      const kids = Array.from(article.children) as HTMLElement[];
      if (kids.length < 2) break;

      let splitAt = -1;
      for (let k = 0; k < kids.length; k++) {
        const bottom = kids[k].offsetTop + kids[k].offsetHeight;
        if (bottom > available) {
          splitAt = k === 0 ? 1 : k;
          break;
        }
      }
      if (splitAt < 0 || splitAt >= kids.length) break;

      const overflow = kids.slice(splitAt);
      const nextPage = page.cloneNode(true) as HTMLElement;
      const nextArticle = nextPage.querySelector(':scope > article');
      if (!nextArticle) break;

      nextArticle.innerHTML = '';
      for (const node of overflow) {
        nextArticle.appendChild(node);
      }

      nextPage.style.height = `${targetHeight}px`;
      nextPage.style.minHeight = `${targetHeight}px`;
      nextPage.style.overflow = 'hidden';
      page.after(nextPage);
      pages.splice(i + 1, 0, nextPage);
      page = nextPage;
      article = nextArticle;
    }
  }
}

async function waitForResources(root: ParentNode & { defaultView?: Window | null }, doc: Document) {
  const images = Array.from(doc.images);
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        })
    )
  );

  try {
    if (doc.fonts?.ready) {
      await Promise.race([
        doc.fonts.ready,
        new Promise<void>((resolve) => setTimeout(resolve, 3000)),
      ]);
    }
  } catch {
    // Font loading is best-effort; system fallbacks still apply.
  }

  void root;
}

function pageSizePt(page: HTMLElement): { widthPt: number; heightPt: number } {
  const style = getComputedStyle(page);
  const widthPx = parseFloat(style.width) || page.offsetWidth || page.scrollWidth;
  const heightPx =
    parseFloat(style.minHeight) ||
    parseFloat(style.height) ||
    page.offsetHeight ||
    page.scrollHeight;

  return {
    widthPt: Math.max(1, widthPx * CSS_PX_TO_PT),
    heightPt: Math.max(1, heightPx * CSS_PX_TO_PT),
  };
}

export async function convertDocxToPdf(
  arrayBuffer: ArrayBuffer,
  options: ConvertOptions = {}
): Promise<Blob> {
  if (typeof document === 'undefined') {
    throw new Error('Word to PDF conversion must run in the browser.');
  }

  const source = arrayBuffer.slice(0);
  const zip = await JSZip.loadAsync(source);
  if (!zip.file('word/document.xml')) {
    throw new Error('Invalid DOCX: missing word/document.xml. Legacy .doc files are not supported.');
  }

  options.onProgress?.({ page: 0, total: 1, phase: 'render' });

  const { renderAsync } = await import('docx-preview');
  const html2canvas = (await import('html2canvas')).default;

  const host = document.createElement('div');
  host.id = `${HOST_ID}-${Date.now()}`;
  host.className = 'toolwala-docx-pdf-host';
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    'z-index:-1',
    'pointer-events:none',
    'background:#ffffff',
  ].join(';');

  const resetStyle = document.createElement('style');
  resetStyle.textContent = `${FONT_FALLBACK_CSS}\n${HOST_RESET_CSS}`;
  host.appendChild(resetStyle);

  const bodyMount = document.createElement('div');
  const styleMount = document.createElement('div');
  host.appendChild(styleMount);
  host.appendChild(bodyMount);
  document.body.appendChild(host);

  try {
    await renderAsync(source, bodyMount, styleMount, {
      className: 'docx',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      ignoreLastRenderedPageBreak: false,
      experimental: true,
      useBase64URL: true,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      renderEndnotes: true,
      renderComments: false,
      renderAltChunks: true,
    });

    await waitForResources(host, document);
    neutralizeLayoutTables(bodyMount);
    paginateOverflowingPages(bodyMount);

    const pages = collectPages(bodyMount);
    if (pages.length === 0) {
      throw new Error('No pages could be rendered from this Word document.');
    }

    options.onProgress?.({ page: 0, total: pages.length, phase: 'capture' });

    let pdf: jsPDF | null = null;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      page.style.boxShadow = 'none';
      page.style.margin = '0';
      page.style.background = '#ffffff';

      const { widthPt, heightPt } = pageSizePt(page);
      const widthPx = page.offsetWidth || Math.round(widthPt / CSS_PX_TO_PT);
      const heightPx = page.offsetHeight || Math.round(heightPt / CSS_PX_TO_PT);
      const orientation = widthPt > heightPt ? 'landscape' : 'portrait';

      const canvas = await html2canvas(page, {
        scale: CAPTURE_SCALE,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 8000,
        windowWidth: Math.max(widthPx, 1),
        windowHeight: Math.max(heightPx, 1),
        width: Math.max(widthPx, 1),
        height: Math.max(heightPx, 1),
        onclone: (_clonedDoc, clonedEl) => {
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.margin = '0';
          clonedEl.style.background = '#ffffff';
          neutralizeLayoutTables(clonedEl);
        },
      });

      if (!pdf) {
        pdf = new jsPDF({
          orientation,
          unit: 'pt',
          format: [widthPt, heightPt],
          compress: true,
        });
      } else {
        pdf.addPage([widthPt, heightPt], orientation);
      }

      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imageData, 'JPEG', 0, 0, widthPt, heightPt, undefined, 'FAST');
      canvas.width = 0;
      canvas.height = 0;

      options.onProgress?.({ page: i + 1, total: pages.length, phase: 'capture' });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    if (!pdf) {
      throw new Error('PDF generation failed.');
    }

    return pdf.output('blob');
  } finally {
    host.remove();
  }
}

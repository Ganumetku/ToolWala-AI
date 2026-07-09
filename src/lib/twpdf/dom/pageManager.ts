import type { TWPDFDocument, TWPDFPage } from '@/types/twpdf';
import { findPage, nowTimestamp } from './utils';
import type { DocumentSetter } from './objectManager';

export class PageManager {
  constructor(private update: DocumentSetter) {}

  getPage(doc: TWPDFDocument, pageId: string): TWPDFPage | null {
    return findPage(doc.pages, pageId) ?? null;
  }

  getCurrentPage(doc: TWPDFDocument): TWPDFPage | null {
    if (!doc.currentPageId) return doc.pages[0] ?? null;
    return this.getPage(doc, doc.currentPageId);
  }

  setCurrentPage(pageId: string): void {
    this.update((doc) => {
      const page = findPage(doc.pages, pageId);
      if (!page) return doc;

      return {
        ...doc,
        currentPageId: pageId,
        metadata: { ...doc.metadata, updatedAt: nowTimestamp() },
      };
    });
  }

  nextPage(doc: TWPDFDocument): string | null {
    if (!doc.currentPageId) return null;
    const idx = doc.pages.findIndex((p) => p.id === doc.currentPageId);
    if (idx === -1 || idx >= doc.pages.length - 1) return null;

    const nextId = doc.pages[idx + 1].id;
    this.setCurrentPage(nextId);
    return nextId;
  }

  previousPage(doc: TWPDFDocument): string | null {
    if (!doc.currentPageId) return null;
    const idx = doc.pages.findIndex((p) => p.id === doc.currentPageId);
    if (idx <= 0) return null;

    const prevId = doc.pages[idx - 1].id;
    this.setCurrentPage(prevId);
    return prevId;
  }

  getPageByNumber(doc: TWPDFDocument, pageNumber: number): TWPDFPage | null {
    return doc.pages.find((p) => p.pageNumber === pageNumber) ?? null;
  }
}

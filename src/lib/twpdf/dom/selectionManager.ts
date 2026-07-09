import type { TWPDFDocument } from '@/types/twpdf';
import { nowTimestamp } from './utils';
import type { DocumentSetter } from './objectManager';

export class SelectionManager {
  constructor(private update: DocumentSetter) {}

  select(pageId: string, objectId: string): void {
    this.update((doc) => {
      const pages = doc.pages.map((page) => ({
        ...page,
        objects: page.objects.map((obj) => ({
          ...obj,
          selected: page.id === pageId && obj.id === objectId,
        })),
      }));

      return {
        ...doc,
        pages,
        selectedObjectId: objectId,
        metadata: { ...doc.metadata, updatedAt: nowTimestamp() },
      };
    });
  }

  deselect(): void {
    this.update((doc) => ({
      ...doc,
      pages: doc.pages.map((page) => ({
        ...page,
        objects: page.objects.map((obj) => ({ ...obj, selected: false })),
      })),
      selectedObjectId: null,
      metadata: { ...doc.metadata, updatedAt: nowTimestamp() },
    }));
  }

  clearSelection(): void {
    this.deselect();
  }

  getSelectedObject(doc: TWPDFDocument): { pageId: string; objectId: string } | null {
    if (!doc.selectedObjectId) return null;

    for (const page of doc.pages) {
      const obj = page.objects.find((o) => o.id === doc.selectedObjectId);
      if (obj) return { pageId: page.id, objectId: obj.id };
    }
    return null;
  }
}

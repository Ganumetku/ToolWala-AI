import type { TWPDFDocument, TWPDFObject } from '@/types/twpdf';
import { findPage, findPageIndex, nowTimestamp } from './utils';

export type DocumentSetter = (updater: (doc: TWPDFDocument) => TWPDFDocument) => void;

export class ObjectManager {
  constructor(private update: DocumentSetter) {}

  private mutate(
    pageId: string,
    mutator: (objects: TWPDFObject[]) => TWPDFObject[]
  ): void {
    this.update((doc) => {
      const pageIdx = findPageIndex(doc, pageId);
      if (pageIdx === -1) return doc;

      const page = doc.pages[pageIdx];
      const pages = [...doc.pages];
      pages[pageIdx] = {
        ...page,
        objects: mutator(page.objects),
      };

      return {
        ...doc,
        pages,
        metadata: { ...doc.metadata, updatedAt: nowTimestamp() },
      };
    });
  }

  getObjectById(doc: TWPDFDocument, pageId: string, objectId: string): TWPDFObject | null {
    const page = findPage(doc.pages, pageId);
    if (!page) return null;
    return page.objects.find((o) => o.id === objectId) ?? null;
  }

  addObject(pageId: string, object: TWPDFObject): void {
    this.mutate(pageId, (objects) => {
      const maxZ = objects.reduce((max, o) => Math.max(max, o.zIndex), -1);
      const ts = nowTimestamp();
      return [...objects, { ...object, zIndex: maxZ + 1, createdAt: ts, updatedAt: ts }];
    });
  }

  removeObject(pageId: string, objectId: string): void {
    this.mutate(pageId, (objects) => objects.filter((o) => o.id !== objectId));
  }

  updateObject(pageId: string, objectId: string, patch: Partial<TWPDFObject>): void {
    this.mutate(pageId, (objects) =>
      objects.map((o) =>
        o.id === objectId
          ? ({ ...o, ...patch, updatedAt: nowTimestamp() } as TWPDFObject)
          : o
      )
    );
  }

  duplicateObject(pageId: string, objectId: string, newId: string): void {
    this.mutate(pageId, (objects) => {
      const source = objects.find((o) => o.id === objectId);
      if (!source) return objects;
      const maxZ = objects.reduce((max, o) => Math.max(max, o.zIndex), -1);
      const ts = nowTimestamp();
      const duplicate: TWPDFObject = {
        ...JSON.parse(JSON.stringify(source)),
        id: newId,
        x: source.x + 10,
        y: source.y + 10,
        selected: false,
        zIndex: maxZ + 1,
        createdAt: ts,
        updatedAt: ts,
      };
      return [...objects, duplicate];
    });
  }

  moveObject(pageId: string, objectId: string, x: number, y: number): void {
    this.updateObject(pageId, objectId, { x, y });
  }

  lockObject(pageId: string, objectId: string): void {
    this.updateObject(pageId, objectId, { locked: true });
  }

  unlockObject(pageId: string, objectId: string): void {
    this.updateObject(pageId, objectId, { locked: false });
  }

  bringForward(pageId: string, objectId: string): void {
    this.mutate(pageId, (objects) => {
      const idx = objects.findIndex((o) => o.id === objectId);
      if (idx === -1 || idx === objects.length - 1) return objects;
      const sorted = [...objects].sort((a, b) => a.zIndex - b.zIndex);
      const objIdx = sorted.findIndex((o) => o.id === objectId);
      if (objIdx === -1 || objIdx === sorted.length - 1) return objects;
      const next = sorted[objIdx + 1];
      return objects.map((o) => {
        if (o.id === objectId) return { ...o, zIndex: next.zIndex, updatedAt: nowTimestamp() };
        if (o.id === next.id) return { ...o, zIndex: sorted[objIdx].zIndex, updatedAt: nowTimestamp() };
        return o;
      });
    });
  }

  sendBackward(pageId: string, objectId: string): void {
    this.mutate(pageId, (objects) => {
      const sorted = [...objects].sort((a, b) => a.zIndex - b.zIndex);
      const objIdx = sorted.findIndex((o) => o.id === objectId);
      if (objIdx <= 0) return objects;
      const prev = sorted[objIdx - 1];
      return objects.map((o) => {
        if (o.id === objectId) return { ...o, zIndex: prev.zIndex, updatedAt: nowTimestamp() };
        if (o.id === prev.id) return { ...o, zIndex: sorted[objIdx].zIndex, updatedAt: nowTimestamp() };
        return o;
      });
    });
  }

  bringToFront(pageId: string, objectId: string): void {
    this.mutate(pageId, (objects) => {
      const maxZ = objects.reduce((max, o) => Math.max(max, o.zIndex), 0);
      return objects.map((o) =>
        o.id === objectId ? { ...o, zIndex: maxZ + 1, updatedAt: nowTimestamp() } : o
      );
    });
  }

  sendToBack(pageId: string, objectId: string): void {
    this.mutate(pageId, (objects) => {
      const minZ = objects.reduce((min, o) => Math.min(min, o.zIndex), 0);
      return objects.map((o) =>
        o.id === objectId ? { ...o, zIndex: minZ - 1, updatedAt: nowTimestamp() } : o
      );
    });
  }
}

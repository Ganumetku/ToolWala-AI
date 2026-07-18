import type { TWPDFDocument, TWPDFObject, TWPDFPage } from '@/types/twpdf';
import { findPageIndex, generateObjectId, nowTimestamp } from '@/lib/twpdf/dom/utils';

function updatePageObjects(
  doc: TWPDFDocument,
  pageId: string,
  mutator: (objects: TWPDFObject[]) => TWPDFObject[]
): TWPDFDocument {
  const pageIdx = findPageIndex(doc, pageId);
  if (pageIdx === -1) return doc;

  const page = doc.pages[pageIdx];
  const pages = [...doc.pages];
  pages[pageIdx] = { ...page, objects: mutator(page.objects) };

  return {
    ...doc,
    pages,
    metadata: { ...doc.metadata, updatedAt: nowTimestamp() },
  };
}

export function getObjectById(
  doc: TWPDFDocument,
  pageId: string,
  objectId: string
): TWPDFObject | null {
  const page = doc.pages.find((p) => p.id === pageId);
  if (!page) return null;
  return page.objects.find((o) => o.id === objectId) ?? null;
}

export function addObjectToDocument(
  doc: TWPDFDocument,
  pageId: string,
  object: TWPDFObject
): TWPDFDocument {
  return updatePageObjects(doc, pageId, (objects) => {
    const maxZ = objects.reduce((max, o) => Math.max(max, o.zIndex), -1);
    const ts = nowTimestamp();
    return [...objects, { ...object, zIndex: maxZ + 1, createdAt: ts, updatedAt: ts }];
  });
}

export function removeObjectFromDocument(
  doc: TWPDFDocument,
  pageId: string,
  objectId: string
): TWPDFDocument {
  return updatePageObjects(doc, pageId, (objects) => objects.filter((o) => o.id !== objectId));
}

export function updateObjectInDocument(
  doc: TWPDFDocument,
  pageId: string,
  objectId: string,
  patch: Partial<TWPDFObject>
): TWPDFDocument {
  // Print runtime verification
  const page = doc.pages.find((p) => p.id === pageId);
  const obj = page?.objects.find((o) => o.id === objectId);
  if (obj && obj.type === 'text') {
    const textObj = obj as any;
    const pdfObj = textObj.pdfObject;
    if (pdfObj) {
      console.log(`[Verification] Text Object Edited (Frontend Document Model):`, {
        'Object Number': pdfObj.objectNumber ?? 'N/A',
        'Content Stream': pdfObj.contentStreamObject ?? 'N/A',
        'Operator Type': pdfObj.operatorType ?? 'N/A',
        'Operator Index': pdfObj.operatorIndex ?? 'N/A',
        'Original Text': pdfObj.originalText ?? 'N/A',
        'Current Text': (patch as any).text !== undefined ? (patch as any).text : textObj.text,
        'Original Font': pdfObj.fontName ?? 'N/A',
        'Original Matrix': pdfObj.originalTextMatrix ?? 'N/A',
      });
    }
  }

  return updatePageObjects(doc, pageId, (objects) =>
    objects.map((o) =>
      o.id === objectId ? ({ ...o, ...patch, updatedAt: nowTimestamp() } as TWPDFObject) : o
    )
  );
}

export function duplicateObjectInDocument(
  doc: TWPDFDocument,
  pageId: string,
  objectId: string,
  newId?: string
): { doc: TWPDFDocument; newObjectId: string | null } {
  const page = doc.pages.find((p) => p.id === pageId);
  const source = page?.objects.find((o) => o.id === objectId);
  if (!source) return { doc, newObjectId: null };

  const duplicateId = newId ?? generateObjectId('dup');
  const ts = nowTimestamp();
  const maxZ = page!.objects.reduce((max, o) => Math.max(max, o.zIndex), -1);

  const duplicate: TWPDFObject = {
    ...JSON.parse(JSON.stringify(source)),
    id: duplicateId,
    x: source.x + 10,
    y: source.y + 10,
    selected: false,
    zIndex: maxZ + 1,
    createdAt: ts,
    updatedAt: ts,
  };

  const nextDoc = addObjectToDocument(doc, pageId, duplicate);
  return { doc: nextDoc, newObjectId: duplicateId };
}

export function setPageObjects(
  doc: TWPDFDocument,
  pageId: string,
  objects: TWPDFObject[]
): TWPDFDocument {
  return updatePageObjects(doc, pageId, () => objects);
}

export function getPageFromDocument(doc: TWPDFDocument, pageId: string): TWPDFPage | null {
  return doc.pages.find((p) => p.id === pageId) ?? null;
}

export function setSelectionInDocument(
  doc: TWPDFDocument,
  pageId: string | null,
  objectId: string | null
): TWPDFDocument {
  const pages = doc.pages.map((page) => ({
    ...page,
    objects: page.objects.map((obj) => ({
      ...obj,
      selected: pageId === page.id && obj.id === objectId,
    })),
  }));

  return {
    ...doc,
    pages,
    selectedObjectId: objectId,
    metadata: { ...doc.metadata, updatedAt: nowTimestamp() },
  };
}

export function bringObjectForward(
  doc: TWPDFDocument,
  pageId: string,
  objectId: string
): TWPDFDocument {
  return updatePageObjects(doc, pageId, (objects) => {
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

export function sendObjectBackward(
  doc: TWPDFDocument,
  pageId: string,
  objectId: string
): TWPDFDocument {
  return updatePageObjects(doc, pageId, (objects) => {
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

export function bringObjectToFront(
  doc: TWPDFDocument,
  pageId: string,
  objectId: string
): TWPDFDocument {
  return updatePageObjects(doc, pageId, (objects) => {
    const maxZ = objects.reduce((max, o) => Math.max(max, o.zIndex), 0);
    return objects.map((o) =>
      o.id === objectId ? { ...o, zIndex: maxZ + 1, updatedAt: nowTimestamp() } : o
    );
  });
}

export function sendObjectToBack(
  doc: TWPDFDocument,
  pageId: string,
  objectId: string
): TWPDFDocument {
  return updatePageObjects(doc, pageId, (objects) => {
    const minZ = objects.reduce((min, o) => Math.min(min, o.zIndex), 0);
    return objects.map((o) =>
      o.id === objectId ? { ...o, zIndex: minZ - 1, updatedAt: nowTimestamp() } : o
    );
  });
}

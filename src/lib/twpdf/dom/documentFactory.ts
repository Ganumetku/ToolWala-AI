import type { CreateDocumentInput, TWPDFDocument, TWPDFPage, TWPDFTextObject } from '@/types/twpdf';
import { generateDocumentId, generateObjectId, nowTimestamp } from './utils';

function textBoxToObject(
  box: NonNullable<CreateDocumentInput['originalTexts']>[number][number],
  zIndex: number
): TWPDFTextObject {
  const ts = nowTimestamp();
  const isReplaced = box.replacedText !== undefined;

  return {
    id: box.id,
    type: 'text',
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    rotation: box.angle ?? 0,
    locked: false,
    visible: true,
    selected: false,
    createdAt: ts,
    updatedAt: ts,
    zIndex,
    text: isReplaced ? (box.replacedText ?? box.text) : box.text,
    fontFamily: box.fontFamily ?? 'Helvetica',
    fontSize: box.fontSize,
    fontWeight: box.fontWeight ?? 'normal',
    fontStyle: box.fontStyle ?? 'normal',
    color: isReplaced ? (box.replacedColor ?? '#0b2c8c') : 'transparent',
    alignment: 'left',
    lineHeight: 1.0,
    isOriginalText: true,
    isDeletedOriginal: false,
    originalTextData: {
      text: box.text,
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      fontSize: box.fontSize,
      angle: box.angle ?? 0,
      fontWeight: box.fontWeight ?? 'normal',
      fontStyle: box.fontStyle ?? 'normal',
      fontFamily: box.fontFamily ?? 'Helvetica',
    },
  };
}

export function createDocument(input: CreateDocumentInput): TWPDFDocument {
  const ts = nowTimestamp();
  const pages: TWPDFPage[] = input.pages.map((p, idx) => {
    const textBoxes = input.originalTexts?.[p.originalPageNum] ?? [];
    const objects = textBoxes.map((box, objIdx) => textBoxToObject(box, objIdx));

    return {
      id: p.id,
      pageNumber: idx + 1,
      originalPageNum: p.originalPageNum,
      width: p.width,
      height: p.height,
      rotation: 0,
      objects,
    };
  });

  return {
    id: generateDocumentId(),
    fileName: input.fileName,
    pageCount: pages.length,
    metadata: {
      createdAt: ts,
      updatedAt: ts,
      originalPageCount: pages.length,
    },
    pages,
    currentPageId: pages[0]?.id ?? null,
    selectedObjectId: null,
  };
}

export function createEmptyPage(
  id: string,
  pageNumber: number,
  originalPageNum: number,
  width: number,
  height: number
): TWPDFPage {
  return {
    id,
    pageNumber,
    originalPageNum,
    width,
    height,
    rotation: 0,
    objects: [],
  };
}

export function duplicatePageInDocument(
  doc: TWPDFDocument,
  sourcePageId: string,
  newPageId: string,
  insertAfterIndex: number
): TWPDFDocument {
  const sourceIdx = doc.pages.findIndex((p) => p.id === sourcePageId);
  if (sourceIdx === -1) return doc;

  const source = doc.pages[sourceIdx];
  const ts = nowTimestamp();
  const duplicated: TWPDFPage = {
    ...JSON.parse(JSON.stringify(source)),
    id: newPageId,
    objects: source.objects.map((obj) => ({
      ...obj,
      id: generateObjectId('dup'),
      selected: false,
      createdAt: ts,
      updatedAt: ts,
    })),
  };

  const pages = [...doc.pages];
  pages.splice(insertAfterIndex + 1, 0, duplicated);

  const renumbered = pages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));

  return {
    ...doc,
    pageCount: renumbered.length,
    pages: renumbered,
    metadata: { ...doc.metadata, updatedAt: ts },
  };
}

export function removePageFromDocument(doc: TWPDFDocument, pageId: string): TWPDFDocument {
  const pages = doc.pages.filter((p) => p.id !== pageId);
  const renumbered = pages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));

  let currentPageId = doc.currentPageId;
  if (currentPageId === pageId) {
    const deletedIdx = doc.pages.findIndex((p) => p.id === pageId);
    currentPageId = pages[Math.max(0, deletedIdx - 1)]?.id ?? null;
  }

  return {
    ...doc,
    pageCount: renumbered.length,
    pages: renumbered,
    currentPageId,
    selectedObjectId: doc.selectedObjectId,
    metadata: { ...doc.metadata, updatedAt: nowTimestamp() },
  };
}

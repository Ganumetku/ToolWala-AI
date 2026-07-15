import type {
  TWPDFDocument,
  TWPDFHighlightObject,
  TWPDFImageObject,
  TWPDFObject,
  TWPDFShapeKind,
  TWPDFShapeObject,
  TWPDFSignatureObject,
  TWPDFTextAlignment,
  TWPDFTextObject,
  TWPDFAnnotationObject,
} from '@/types/twpdf';
import { generateObjectId, nowTimestamp } from './utils';

interface FabricObjectJson {
  id?: string;
  type?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  visible?: boolean;
  selectable?: boolean;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  textAlign?: string;
  lineHeight?: number;
  underline?: boolean;
  src?: string;
  isOriginalText?: boolean;
  isDeletedOriginal?: boolean;
  isHighlight?: boolean;
  originalTextData?: TWPDFTextObject['originalTextData'];
  path?: Array<[string, ...number[]]>;
  baseline?: number;
  ascent?: number;
  descent?: number;
  pdfFontName?: string;
  fontName?: string;
  originalBBox?: { x: number; y: number; width: number; height: number };
}

function baseFromFabric(obj: FabricObjectJson, zIndex: number): Omit<TWPDFObject, 'type'> & { type: TWPDFObject['type'] } {
  const ts = nowTimestamp();
  const scaleX = obj.scaleX ?? 1;
  const scaleY = obj.scaleY ?? 1;

  return {
    id: obj.id ?? generateObjectId('fabric'),
    type: 'annotation' as TWPDFObject['type'],
    x: obj.left ?? 0,
    y: obj.top ?? 0,
    width: (obj.width ?? 0) * scaleX,
    height: (obj.height ?? 0) * scaleY,
    rotation: obj.angle ?? 0,
    locked: obj.selectable === false,
    visible: obj.visible !== false && obj.opacity !== 0,
    selected: false,
    createdAt: ts,
    updatedAt: ts,
    zIndex,
  };
}

function fabricToText(obj: FabricObjectJson, zIndex: number): TWPDFTextObject {
  const base = baseFromFabric(obj, zIndex);
  return {
    ...base,
    type: 'text',
    text: obj.text ?? '',
    fontFamily: obj.fontFamily ?? 'Helvetica',
    fontSize: obj.fontSize ?? 16,
    fontWeight: obj.fontWeight ?? 'normal',
    fontStyle: obj.fontStyle ?? 'normal',
    color: obj.fill ?? '#000000',
    alignment: (obj.textAlign as TWPDFTextAlignment) ?? 'left',
    lineHeight: obj.lineHeight ?? 1.0,
    underline: obj.underline ?? false,
    opacity: obj.opacity ?? 1,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth,
    isOriginalText: obj.isOriginalText ?? false,
    isDeletedOriginal: obj.isDeletedOriginal ?? false,
    originalTextData: obj.originalTextData,
    visible: base.visible && !obj.isDeletedOriginal,
    baseline: obj.baseline,
    ascent: obj.ascent,
    descent: obj.descent,
    pdfFontName: obj.pdfFontName,
    fontName: obj.fontName,
    originalBBox: obj.originalBBox,
  };
}

function fabricToImage(obj: FabricObjectJson, zIndex: number, isSignature = false): TWPDFImageObject | TWPDFSignatureObject {
  const base = baseFromFabric(obj, zIndex);
  if (isSignature) {
    return {
      ...base,
      type: 'signature',
      src: obj.src ?? '',
      opacity: obj.opacity ?? 1,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
    };
  }
  return {
    ...base,
    type: 'image',
    src: obj.src ?? '',
    opacity: obj.opacity ?? 1,
    scaleX: obj.scaleX,
    scaleY: obj.scaleY,
  };
}

function detectShapeKind(obj: FabricObjectJson): TWPDFShapeKind {
  if (obj.type === 'circle') return 'circle';
  if (obj.type === 'line') return 'line';
  if (obj.type === 'path') {
    const pathStr = JSON.stringify(obj.path ?? '');
    if (pathStr.includes('L 65 -8') || pathStr.includes('L 80 0')) return 'arrow';
    return 'line';
  }
  return 'rectangle';
}

function fabricToShape(obj: FabricObjectJson, zIndex: number): TWPDFShapeObject {
  const base = baseFromFabric(obj, zIndex);
  return {
    ...base,
    type: 'shape',
    shapeKind: detectShapeKind(obj),
    fill: obj.fill ?? 'transparent',
    stroke: obj.stroke ?? '#000000',
    strokeWidth: obj.strokeWidth ?? 1,
    opacity: obj.opacity ?? 1,
    scaleX: obj.scaleX,
    scaleY: obj.scaleY,
  };
}

function fabricToHighlight(obj: FabricObjectJson, zIndex: number): TWPDFHighlightObject {
  const base = baseFromFabric(obj, zIndex);
  return {
    ...base,
    type: 'highlight',
    color: obj.fill ?? 'rgba(251, 191, 36, 0.4)',
    opacity: obj.opacity ?? 1,
  };
}

function fabricToAnnotation(obj: FabricObjectJson, zIndex: number): TWPDFAnnotationObject {
  const base = baseFromFabric(obj, zIndex);
  const pathSegments = obj.path?.map((seg) => seg.join(' ')).join(' ') ?? '';
  return {
    ...base,
    type: 'annotation',
    pathData: pathSegments,
    stroke: obj.stroke ?? '#000000',
    strokeWidth: obj.strokeWidth ?? 1,
    fill: obj.fill ?? 'transparent',
    opacity: obj.opacity ?? 1,
    isFreehand: true,
    isHighlighter: false,
  };
}

export function fabricObjectToTWPDF(obj: FabricObjectJson, zIndex: number): TWPDFObject | null {
  if (!obj || !obj.type) return null;

  if (obj.isDeletedOriginal) {
    return fabricToText(obj, zIndex);
  }

  if (obj.type === 'textbox' || obj.type === 'i-text') {
    return fabricToText(obj, zIndex);
  }

  if (obj.type === 'image') {
    return fabricToImage(obj, zIndex, false);
  }

  if (obj.isHighlight || (obj.type === 'rect' && typeof obj.fill === 'string' && obj.fill.startsWith('rgba'))) {
    return fabricToHighlight(obj, zIndex);
  }

  if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'line') {
    return fabricToShape(obj, zIndex);
  }

  if (obj.type === 'path') {
    if (obj.stroke && !obj.fill?.startsWith('rgba')) {
      const shape = fabricToShape(obj, zIndex);
      if (shape.shapeKind === 'arrow') return shape;
    }
    return fabricToAnnotation(obj, zIndex);
  }

  if (obj.type === 'group') {
    return fabricToAnnotation(obj, zIndex);
  }

  return fabricToAnnotation(obj, zIndex);
}

export function fabricStateToObjects(fabricState: unknown): TWPDFObject[] {
  if (!fabricState || typeof fabricState !== 'object') return [];

  const state = fabricState as { objects?: FabricObjectJson[] };
  const fabricObjects = state.objects ?? [];

  return fabricObjects
    .map((obj, idx) => fabricObjectToTWPDF(obj, idx))
    .filter((obj): obj is TWPDFObject => obj !== null);
}

export function syncPageObjectsFromFabric(
  page: { objects: TWPDFObject[] },
  fabricState: unknown
): TWPDFObject[] {
  const existingMap = new Map(page.objects.map((o) => [o.id, o]));
  const synced = fabricStateToObjects(fabricState);
  const ts = nowTimestamp();

  return synced.map((obj, zIndex) => {
    const existing = existingMap.get(obj.id);
    if (existing) {
      return {
        ...obj,
        createdAt: existing.createdAt,
        updatedAt: ts,
        zIndex,
      };
    }
    return { ...obj, zIndex, updatedAt: ts };
  });
}

export function syncAllPagesFromCanvasStates(
  doc: TWPDFDocument,
  canvasStates: Record<string, unknown>
): TWPDFDocument {
  const ts = nowTimestamp();
  const pages = doc.pages.map((page) => {
    const fabricState = canvasStates[page.id];
    if (!fabricState) return page;

    return {
      ...page,
      objects: syncPageObjectsFromFabric(page, fabricState),
    };
  });

  return {
    ...doc,
    pages,
    metadata: { ...doc.metadata, updatedAt: ts },
  };
}

export function syncPageFromFabricState(
  doc: TWPDFDocument,
  pageId: string,
  fabricState: unknown
): TWPDFDocument {
  const pageIdx = doc.pages.findIndex((p) => p.id === pageId);
  if (pageIdx === -1) return doc;

  const page = doc.pages[pageIdx];
  const pages = [...doc.pages];
  pages[pageIdx] = {
    ...page,
    objects: syncPageObjectsFromFabric(page, fabricState),
  };

  return {
    ...doc,
    pages,
    metadata: { ...doc.metadata, updatedAt: nowTimestamp() },
  };
}

import type {
  TWPDFAnnotationObject,
  TWPDFHighlightObject,
  TWPDFImageObject,
  TWPDFShapeKind,
  TWPDFShapeObject,
  TWPDFSignatureObject,
  TWPDFTextObject,
} from '@/types/twpdf';
import { generateObjectId, nowTimestamp } from '@/lib/twpdf/dom/utils';
import { hexToRgbaStr } from '@/lib/twpdf/utils';

interface BuildContext {
  centerX?: number;
  centerY?: number;
}

export function buildTextObject(
  opts: {
    fontSize: number;
    fontFamily: string;
    strokeColor: string;
    text?: string;
  },
  ctx?: BuildContext
): TWPDFTextObject {
  const ts = nowTimestamp();
  return {
    id: generateObjectId('text'),
    type: 'text',
    x: ctx?.centerX ?? 100,
    y: ctx?.centerY ?? 100,
    width: 200,
    height: opts.fontSize * 1.2,
    rotation: 0,
    locked: false,
    visible: true,
    selected: false,
    createdAt: ts,
    updatedAt: ts,
    zIndex: 0,
    text: opts.text ?? 'Double click to edit text...',
    fontFamily: opts.fontFamily,
    fontSize: opts.fontSize,
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: opts.strokeColor === 'transparent' ? '#000000' : opts.strokeColor,
    alignment: 'left',
    lineHeight: 1.0,
  };
}

export function buildShapeObject(
  shapeKind: TWPDFShapeKind,
  opts: { strokeColor: string; fillColor: string; strokeWidth: number },
  ctx?: BuildContext
): TWPDFShapeObject {
  const ts = nowTimestamp();
  const fill = opts.fillColor === 'transparent' ? 'transparent' : opts.fillColor;
  const defaults: Record<TWPDFShapeKind, { width: number; height: number }> = {
    rectangle: { width: 100, height: 60 },
    circle: { width: 80, height: 80 },
    line: { width: 100, height: 0 },
    arrow: { width: 80, height: 16 },
  };
  const size = defaults[shapeKind];

  return {
    id: generateObjectId('shape'),
    type: 'shape',
    x: ctx?.centerX ?? 100,
    y: ctx?.centerY ?? 100,
    width: size.width,
    height: size.height,
    rotation: 0,
    locked: false,
    visible: true,
    selected: false,
    createdAt: ts,
    updatedAt: ts,
    zIndex: 0,
    shapeKind,
    fill,
    stroke: opts.strokeColor,
    strokeWidth: opts.strokeWidth,
  };
}

export function buildHighlightObject(
  opts: { strokeColor: string; targetWidth?: number; targetHeight?: number },
  ctx?: BuildContext
): TWPDFHighlightObject {
  const ts = nowTimestamp();
  return {
    id: generateObjectId('highlight'),
    type: 'highlight',
    x: ctx?.centerX ?? 100,
    y: ctx?.centerY ?? 100,
    width: opts.targetWidth ?? 120,
    height: opts.targetHeight ?? 24,
    rotation: 0,
    locked: false,
    visible: true,
    selected: false,
    createdAt: ts,
    updatedAt: ts,
    zIndex: 0,
    color: hexToRgbaStr(opts.strokeColor || '#fbbf24', 0.4),
    opacity: 1,
  };
}

export function buildImageObject(
  src: string,
  opts: { width: number; height: number; scaleX?: number; scaleY?: number },
  ctx?: BuildContext
): TWPDFImageObject {
  const ts = nowTimestamp();
  const scaleX = opts.scaleX ?? 1;
  const scaleY = opts.scaleY ?? 1;
  return {
    id: generateObjectId('image'),
    type: 'image',
    x: ctx?.centerX ?? 100,
    y: ctx?.centerY ?? 100,
    width: opts.width * scaleX,
    height: opts.height * scaleY,
    rotation: 0,
    locked: false,
    visible: true,
    selected: false,
    createdAt: ts,
    updatedAt: ts,
    zIndex: 0,
    src,
    opacity: 1,
    scaleX,
    scaleY,
  };
}

export function buildSignatureObject(
  src: string,
  opts: { width: number; height: number; scaleX?: number },
  ctx?: BuildContext
): TWPDFSignatureObject {
  const ts = nowTimestamp();
  const scaleX = opts.scaleX ?? 1;
  return {
    id: generateObjectId('sig'),
    type: 'signature',
    x: ctx?.centerX ?? 100,
    y: ctx?.centerY ?? 100,
    width: opts.width * scaleX,
    height: opts.height,
    rotation: 0,
    locked: false,
    visible: true,
    selected: false,
    createdAt: ts,
    updatedAt: ts,
    zIndex: 0,
    src,
    opacity: 1,
    scaleX,
  };
}

export function buildHighlightFromTextBounds(
  bounds: { left: number; top: number; width: number; height: number; angle?: number },
  strokeColor: string
): TWPDFHighlightObject {
  const ts = nowTimestamp();
  return {
    id: generateObjectId('highlight'),
    type: 'highlight',
    x: bounds.left,
    y: bounds.top,
    width: bounds.width,
    height: bounds.height,
    rotation: bounds.angle ?? 0,
    locked: false,
    visible: true,
    selected: false,
    createdAt: ts,
    updatedAt: ts,
    zIndex: 0,
    color: hexToRgbaStr(strokeColor || '#fbbf24', 0.4),
    opacity: 1,
  };
}

export function buildAnnotationFromFabric(
  fabricObj: Record<string, unknown>
): TWPDFAnnotationObject {
  const ts = nowTimestamp();
  const scaleX = (fabricObj.scaleX as number) ?? 1;
  const scaleY = (fabricObj.scaleY as number) ?? 1;
  const path = fabricObj.path as Array<[string, ...number[]]> | undefined;
  const pathData = path?.map((seg) => seg.join(' ')).join(' ') ?? '';

  return {
    id: (fabricObj.id as string) ?? generateObjectId('annot'),
    type: 'annotation',
    x: (fabricObj.left as number) ?? 0,
    y: (fabricObj.top as number) ?? 0,
    width: ((fabricObj.width as number) ?? 0) * scaleX,
    height: ((fabricObj.height as number) ?? 0) * scaleY,
    rotation: (fabricObj.angle as number) ?? 0,
    locked: false,
    visible: true,
    selected: false,
    createdAt: ts,
    updatedAt: ts,
    zIndex: 0,
    pathData,
    stroke: (fabricObj.stroke as string) ?? '#000000',
    strokeWidth: (fabricObj.strokeWidth as number) ?? 1,
    fill: (fabricObj.fill as string) ?? 'transparent',
    opacity: (fabricObj.opacity as number) ?? 1,
    isFreehand: true,
  };
}

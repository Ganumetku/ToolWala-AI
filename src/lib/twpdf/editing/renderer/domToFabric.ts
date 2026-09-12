import type {
  TWPDFAnnotationObject,
  TWPDFHighlightObject,
  TWPDFImageObject,
  TWPDFObject,
  TWPDFShapeObject,
  TWPDFSignatureObject,
  TWPDFTextObject,
} from '@/types/twpdf';
import { isOriginalTextEdited } from '@/lib/twpdf/editor';
import { ORIGINAL_TEXT_HIT_BG } from '@/lib/twpdf/parser/textMask';
import { LegacyFabricBridge } from './LegacyFabricBridge';

const FABRIC_CONTROL_PROPS = {
  borderColor: '#3b82f6',
  cornerColor: '#3b82f6',
  cornerSize: 8,
  transparentCorners: false,
};

function textToFabric(obj: TWPDFTextObject): Record<string, unknown> {
  const isReplaced = obj.isOriginalText && obj.text !== obj.originalTextData?.text;
  const isEdited = obj.isOriginalText && (isReplaced || obj.isDeletedOriginal);
  const detectedColor = obj.originalTextData?.detectedColor || obj.color || '#000000';

  let fill = obj.color;
  if (obj.isOriginalText) {
    if (obj.isDeletedOriginal) {
      fill = 'transparent';
    } else if (!isEdited && fill === 'transparent') {
      fill = 'transparent';
    } else if (isEdited && fill === 'transparent') {
      fill = detectedColor;
    }
  }

  return {
    type: 'textbox',
    id: obj.id,
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    angle: obj.rotation,
    text: obj.text,
    fontFamily: obj.fontFamily,
    fontSize: obj.fontSize,
    fontWeight: obj.fontWeight,
    fontStyle: obj.fontStyle,
    fill,
    stroke: obj.stroke ?? 'transparent',
    strokeWidth: obj.strokeWidth ?? 1,
    textAlign: obj.alignment,
    lineHeight: obj.lineHeight,
    underline: obj.underline ?? false,
    opacity: obj.isDeletedOriginal ? 0 : (obj.opacity ?? 1),
    selectable: !obj.locked,
    visible: obj.visible,
    isOriginalText: obj.isOriginalText ?? false,
    isDeletedOriginal: obj.isDeletedOriginal ?? false,
    originalTextData: obj.originalTextData,
    baseline: obj.baseline,
    ascent: obj.ascent,
    descent: obj.descent,
    pdfFontName: obj.pdfFontName,
    fontName: obj.fontName || obj.fontFamily,
    originalBBox: obj.originalBBox,
    pdfObject: obj.pdfObject,
    backgroundColor: obj.isOriginalText && !isEdited ? ORIGINAL_TEXT_HIT_BG : 'transparent',
    lockScalingY: true,
    ...FABRIC_CONTROL_PROPS,
  };
}

function shapeToFabric(obj: TWPDFShapeObject): Record<string, unknown> {
  const base = {
    id: obj.id,
    left: obj.x,
    top: obj.y,
    width: obj.width / (obj.scaleX ?? 1),
    height: obj.height / (obj.scaleY ?? 1),
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    angle: obj.rotation,
    fill: obj.fill,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth,
    opacity: obj.opacity ?? 1,
    selectable: !obj.locked,
    visible: obj.visible,
    ...FABRIC_CONTROL_PROPS,
  };

  switch (obj.shapeKind) {
    case 'circle':
      return { ...base, type: 'circle', radius: obj.width / 2 };
    case 'line':
      return { ...base, type: 'line', x1: 0, y1: 0, x2: obj.width, y2: 0 };
    case 'arrow':
      return {
        ...base,
        type: 'path',
        path: [
          ['M', 0, 0],
          ['L', 80, 0],
          ['M', 80, 0],
          ['L', 65, -8],
          ['M', 80, 0],
          ['L', 65, 8],
        ],
        fill: 'transparent',
      };
    default:
      return { ...base, type: 'rect' };
  }
}

function highlightToFabric(obj: TWPDFHighlightObject): Record<string, unknown> {
  return {
    type: 'rect',
    id: obj.id,
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    angle: obj.rotation,
    fill: obj.color,
    stroke: 'transparent',
    strokeWidth: 0,
    opacity: obj.opacity,
    isHighlight: true,
    selectable: !obj.locked,
    visible: obj.visible,
    ...FABRIC_CONTROL_PROPS,
  };
}

function imageToFabric(obj: TWPDFImageObject | TWPDFSignatureObject): Record<string, unknown> {
  return {
    type: 'image',
    id: obj.id,
    left: obj.x,
    top: obj.y,
    width: obj.width / (obj.scaleX ?? 1),
    height: obj.height / (obj.scaleY ?? 1),
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    angle: obj.rotation,
    src: obj.src,
    opacity: obj.opacity,
    selectable: !obj.locked,
    visible: obj.visible,
    ...FABRIC_CONTROL_PROPS,
  };
}

function annotationToFabric(obj: TWPDFAnnotationObject): Record<string, unknown> {
  const path = obj.pathData
    ? obj.pathData.split(' ').reduce((acc: Array<[string, ...number[]]>, _token, i, arr) => {
        if (i % 3 === 0 && arr[i]) {
          const cmd = arr[i];
          if (cmd === 'M' || cmd === 'L') {
            acc.push([cmd, parseFloat(arr[i + 1]), parseFloat(arr[i + 2])]);
          }
        }
        return acc;
      }, [])
    : [];

  return {
    type: 'path',
    id: obj.id,
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    angle: obj.rotation,
    path: path.length > 0 ? path : undefined,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth,
    fill: obj.fill,
    opacity: obj.opacity ?? 1,
    selectable: !obj.locked,
    visible: obj.visible,
    ...FABRIC_CONTROL_PROPS,
  };
}




export function twpdfObjectToFabric(obj: TWPDFObject): Record<string, unknown> | null {
  return LegacyFabricBridge.toFabricObject(obj);
}

export function documentToCanvasStates(
  document: { pages: Array<{ id: string; objects: TWPDFObject[] }> },
  zoomScale: number
): Record<string, unknown> {
  const states: Record<string, unknown> = {};
  for (const page of document.pages) {
    states[page.id] = pageToFabricState(page, zoomScale);
  }
  return states;
}

export function pageToFabricState(
  page: { objects: TWPDFObject[] },
  zoomScale: number
): { version: string; objects: Record<string, unknown>[]; viewportTransform: number[] } {
  const sorted = [...page.objects].sort((a, b) => a.zIndex - b.zIndex);
  const objects = sorted
    .map((obj) => twpdfObjectToFabric(obj))
    .filter((o): o is Record<string, unknown> => o !== null);



  return {
    version: '5.3.0',
    objects,
    viewportTransform: [zoomScale, 0, 0, zoomScale, 0, 0],
  };
}

export function fabricPropertyToTwpdfPatch(
  key: string,
  value: unknown,
  obj: TWPDFObject
): Partial<TWPDFObject> {
  const map: Record<string, string> = {
    left: 'x',
    top: 'y',
    angle: 'rotation',
    fill: obj.type === 'text' ? 'color' : 'fill',
    text: 'text',
    fontSize: 'fontSize',
    fontFamily: 'fontFamily',
    fontWeight: 'fontWeight',
    fontStyle: 'fontStyle',
    textAlign: 'alignment',
    lineHeight: 'lineHeight',
    underline: 'underline',
    opacity: 'opacity',
    stroke: 'stroke',
    strokeWidth: 'strokeWidth',
    width: 'width',
    height: 'height',
  };

  const twpdfKey = map[key] ?? key;
  return { [twpdfKey]: value } as Partial<TWPDFObject>;
}

export function fabricObjectToPatch(fabricObj: Record<string, unknown>, existing: TWPDFObject): Partial<TWPDFObject> {
  const scaleX = (fabricObj.scaleX as number) ?? 1;
  const scaleY = (fabricObj.scaleY as number) ?? 1;
  const patch: Partial<TWPDFObject> = {
    x: fabricObj.left as number,
    y: fabricObj.top as number,
    rotation: fabricObj.angle as number,
    width: ((fabricObj.width as number) ?? existing.width) * scaleX,
    height: ((fabricObj.height as number) ?? existing.height) * scaleY,
  };

  if (existing.type === 'text') {
    Object.assign(patch, {
      text: fabricObj.text,
      fontFamily: fabricObj.fontFamily,
      fontSize: fabricObj.fontSize,
      fontWeight: fabricObj.fontWeight,
      fontStyle: fabricObj.fontStyle,
      color: fabricObj.fill,
      alignment: fabricObj.textAlign,
      lineHeight: fabricObj.lineHeight,
      underline: fabricObj.underline,
      opacity: fabricObj.opacity,
    });
  }

  return patch;
}

export { isOriginalTextEdited };

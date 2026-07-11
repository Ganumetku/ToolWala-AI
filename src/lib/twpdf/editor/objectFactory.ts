import { hexToRgbaStr } from '@/lib/twpdf/utils';
import type { ShapeType } from '@/types/pdf';

interface ObjectFactoryOptions {
  fabricLib: {
    Textbox: new (text: string, opts: Record<string, unknown>) => unknown;
    Rect: new (opts: Record<string, unknown>) => unknown;
    Circle: new (opts: Record<string, unknown>) => unknown;
    Line: new (points: number[], opts: Record<string, unknown>) => unknown;
    Path: new (path: string, opts: Record<string, unknown>) => unknown;
    Image: { fromURL: (url: string, cb: (img: unknown) => void) => void };
  };
  fontSize: number;
  fontFamily: string;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

const FABRIC_CONTROL_PROPS = {
  borderColor: '#3b82f6',
  cornerColor: '#3b82f6',
  cornerSize: 8,
  transparentCorners: false,
};

export function createTextbox(opts: ObjectFactoryOptions): unknown {
  return new opts.fabricLib.Textbox('Double click to edit text...', {
    width: 200,
    fontSize: opts.fontSize,
    fontFamily: opts.fontFamily,
    fill: opts.strokeColor === 'transparent' ? '#000000' : opts.strokeColor,
    borderColor: '#3b82f6',
    cornerColor: '#3b82f6',
    cornerSize: 8,
    transparentCorners: false,
    lockScalingY: true,
    hasControls: false,
    hasBorders: false,
    editable: false,
  });
}

export function createShape(shapeType: ShapeType, opts: ObjectFactoryOptions): unknown | null {
  const fill = opts.fillColor === 'transparent' ? 'transparent' : opts.fillColor;
  const stroke = opts.strokeColor;

  switch (shapeType) {
    case 'rect':
      return new opts.fabricLib.Rect({
        width: 100,
        height: 60,
        fill,
        stroke,
        strokeWidth: opts.strokeWidth,
        ...FABRIC_CONTROL_PROPS,
      });
    case 'circle':
      return new opts.fabricLib.Circle({
        radius: 40,
        fill,
        stroke,
        strokeWidth: opts.strokeWidth,
        ...FABRIC_CONTROL_PROPS,
      });
    case 'line':
      return new opts.fabricLib.Line([0, 0, 100, 0], {
        stroke,
        strokeWidth: opts.strokeWidth,
        ...FABRIC_CONTROL_PROPS,
      });
    case 'arrow':
      return new opts.fabricLib.Path('M 0 0 L 80 0 M 80 0 L 65 -8 M 80 0 L 65 8', {
        stroke,
        strokeWidth: opts.strokeWidth,
        fill: 'transparent',
        ...FABRIC_CONTROL_PROPS,
      });
    case 'highlight':
      return new opts.fabricLib.Rect({
        width: 120,
        height: 24,
        fill: hexToRgbaStr(opts.strokeColor || '#fbbf24', 0.4),
        stroke: 'transparent',
        strokeWidth: 0,
        isHighlight: true,
        ...FABRIC_CONTROL_PROPS,
      });
    default:
      return null;
  }
}

export function insertObjectOnCanvas(
  canvas: {
    getCenter: () => { left: number; top: number };
    add: (obj: unknown) => void;
    setActiveObject: (obj: unknown) => void;
    requestRenderAll: () => void;
    fire: (event: string) => void;
  },
  obj: { set: (props: { left: number; top: number }) => void },
  zoomScale: number
): void {
  const center = canvas.getCenter();
  obj.set({
    left: center.left / zoomScale,
    top: center.top / zoomScale,
  });

  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.requestRenderAll();
  canvas.fire('object:modified');
}

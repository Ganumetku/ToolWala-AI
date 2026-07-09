import { hexToRgbaStr } from '@/lib/twpdf/utils';

export function setupBrushes(
  fbCanvas: {
    freeDrawingBrush?: { color: string; width: number };
  },
  editMode: string,
  strokeColor: string,
  brushWidth: number
): void {
  if (!fbCanvas.freeDrawingBrush) return;

  if (editMode === 'draw') {
    fbCanvas.freeDrawingBrush.color = strokeColor;
    fbCanvas.freeDrawingBrush.width = brushWidth;
  } else if (editMode === 'highlight-free') {
    fbCanvas.freeDrawingBrush.color = hexToRgbaStr(strokeColor, 0.4);
    fbCanvas.freeDrawingBrush.width = 25;
  }
}

export function applyObjectSnapping(
  obj: {
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    left: number;
    top: number;
    set: (props: { left?: number; top?: number }) => void;
  },
  pageWidth: number,
  pageHeight: number,
  snapThreshold = 10
): void {
  const cCenterX = pageWidth / 2;
  const cCenterY = pageHeight / 2;

  const objW = obj.width * obj.scaleX;
  const objH = obj.height * obj.scaleY;
  const objCenterX = obj.left + objW / 2;
  const objCenterY = obj.top + objH / 2;

  if (Math.abs(objCenterX - cCenterX) < snapThreshold) {
    obj.set({ left: cCenterX - objW / 2 });
  }
  if (Math.abs(objCenterY - cCenterY) < snapThreshold) {
    obj.set({ top: cCenterY - objH / 2 });
  }
  if (Math.abs(obj.left - 20) < snapThreshold) {
    obj.set({ left: 20 });
  }
  if (Math.abs(obj.top - 20) < snapThreshold) {
    obj.set({ top: 20 });
  }
  if (Math.abs(obj.left + objW - (pageWidth - 20)) < snapThreshold) {
    obj.set({ left: pageWidth - 20 - objW });
  }
}

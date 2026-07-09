import { hexToRgbaStr } from '@/lib/twpdf/utils';

export function applyPropertyChange(
  activeObj: {
    isHighlight?: boolean;
    fill?: string;
    set: (key: string, value: unknown) => void;
  },
  canvas: { requestRenderAll: () => void; fire: (event: string) => void },
  key: string,
  value: unknown
): void {
  if (key === 'fill' && activeObj.isHighlight) {
    const cleanHex = (value as string).startsWith('#') ? (value as string) : '#fbbf24';
    let op = 0.4;
    if (activeObj.fill && activeObj.fill.startsWith('rgba')) {
      const match = activeObj.fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (match) op = parseFloat(match[4]);
    }
    activeObj.set(key, hexToRgbaStr(cleanHex, op));
  } else if (key === 'opacity' && activeObj.isHighlight) {
    activeObj.set('opacity', 1.0);
    if (activeObj.fill && activeObj.fill.startsWith('rgba')) {
      const match = activeObj.fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = match[1],
          g = match[2],
          b = match[3];
        activeObj.set('fill', `rgba(${r}, ${g}, ${b}, ${value})`);
      }
    } else {
      const hex = activeObj.fill || '#fbbf24';
      activeObj.set('fill', hexToRgbaStr(hex, value as number));
    }
  } else {
    activeObj.set(key, value);
  }

  canvas.requestRenderAll();
  canvas.fire('object:modified');
}

export function adjustObjectLayer(
  activeObj: {
    bringToFront: () => void;
    sendToBack: () => void;
    bringForward: () => void;
    sendBackward: () => void;
  },
  canvas: { requestRenderAll: () => void; fire: (event: string) => void },
  action: 'front' | 'back' | 'forward' | 'backward'
): void {
  if (action === 'front') activeObj.bringToFront();
  else if (action === 'back') activeObj.sendToBack();
  else if (action === 'forward') activeObj.bringForward();
  else if (action === 'backward') activeObj.sendBackward();

  canvas.requestRenderAll();
  canvas.fire('object:modified');
}

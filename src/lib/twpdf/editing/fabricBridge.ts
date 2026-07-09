import type { TWPDFObject } from '@/types/twpdf';
import { fabricObjectToTWPDF } from '@/lib/twpdf/dom/fabricSync';

interface FabricLiveObject {
  id?: string;
  type?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  text?: string;
  fill?: string;
  [key: string]: unknown;
  toObject?: (props?: string[]) => FabricLiveObject;
}

export function fabricLiveObjectToTWPDF(obj: FabricLiveObject, zIndex: number): TWPDFObject | null {
  const json = obj.toObject ? obj.toObject(['id', 'isOriginalText', 'originalTextData', 'isDeletedOriginal', 'isHighlight', 'src']) : obj;
  return fabricObjectToTWPDF(json, zIndex);
}

export function detectChangePatch(
  before: TWPDFObject,
  after: TWPDFObject
): Partial<TWPDFObject> | null {
  const patch: Partial<TWPDFObject> = {};
  let changed = false;

  const keys: Array<keyof TWPDFObject> = [
    'x', 'y', 'width', 'height', 'rotation', 'visible', 'locked', 'zIndex',
  ];

  for (const key of keys) {
    if (before[key] !== after[key]) {
      (patch as Record<string, unknown>)[key] = after[key];
      changed = true;
    }
  }

  if (before.type === 'text' && after.type === 'text' && before.text !== after.text) {
    (patch as Partial<TWPDFObject> & { text?: string }).text = after.text;
    changed = true;
  }

  return changed ? patch : null;
}

export type FabricChangeKind = 'move' | 'resize' | 'rotate' | 'update' | 'text' | 'create' | 'delete';

export function classifyFabricChange(
  before: TWPDFObject | null,
  after: TWPDFObject | null
): FabricChangeKind {
  if (!before && after) return 'create';
  if (before && !after) return 'delete';
  if (!before || !after) return 'update';

  if (before.text !== after.text && before.type === 'text') return 'text';
  if (before.rotation !== after.rotation) return 'rotate';
  if (before.width !== after.width || before.height !== after.height) return 'resize';
  if (before.x !== after.x || before.y !== after.y) return 'move';
  return 'update';
}

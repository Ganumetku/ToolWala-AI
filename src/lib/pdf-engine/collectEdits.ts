import { CANVAS_JSON_PROPS } from '@/types/pdf';
import { isOriginalTextEdited } from '@/lib/twpdf/editor';
import type { PageItem } from '@/types/pdf';
import type { TextEditPayload } from './client';

type FabricLike = {
  discardActiveObject?: () => void;
  requestRenderAll?: () => void;
  toJSON?: (props: string[]) => { objects?: FabricObj[] };
};

type FabricObj = {
  isOriginalText?: boolean;
  isDeletedOriginal?: boolean;
  type?: string;
  text?: string;
  left?: number;
  top?: number;
  originalTextData?: {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

function asCanvasState(
  live: unknown,
  saved: unknown
): { objects?: FabricObj[] } | undefined {
  const canvas = live as FabricLike | undefined;
  if (canvas?.toJSON) {
    canvas.discardActiveObject?.();
    canvas.requestRenderAll?.();
    return canvas.toJSON([...CANVAS_JSON_PROPS]);
  }
  return saved as { objects?: FabricObj[] } | undefined;
}

export function collectOriginalTextEdits(args: {
  pageList: PageItem[];
  canvasStates: Record<string, unknown>;
  canvasInstances: Record<string, unknown>;
}): { edits: TextEditPayload[]; hasNonTextMarkup: boolean } {
  const edits: TextEditPayload[] = [];
  let hasNonTextMarkup = false;

  for (const page of args.pageList) {
    const state = asCanvasState(args.canvasInstances[page.id], args.canvasStates[page.id]);
    for (const obj of state?.objects || []) {
      if (!obj.isOriginalText) {
        hasNonTextMarkup = true;
        continue;
      }
      if (!isOriginalTextEdited(obj)) continue;
      const orig = obj.originalTextData;
      if (!orig) continue;
      const x = orig.x;
      const y = orig.y;
      edits.push({
        page: page.originalPageNum,
        text: orig.text,
        new_text: obj.isDeletedOriginal ? '' : obj.text ?? '',
        bbox: [x, y, x + orig.width, y + orig.height],
      });
    }
  }

  return { edits, hasNonTextMarkup };
}

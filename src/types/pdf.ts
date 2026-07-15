export const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5] as const;
export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 60, 72] as const;

export const CANVAS_JSON_PROPS = [
  'id',
  'isOriginalText',
  'originalTextData',
  'isDeletedOriginal',
  'baseline',
  'fontWeight',
  'fontStyle',
  'ascent',
  'descent',
  'pdfFontName',
  'fontName',
  'originalBBox',
] as const;

export type EditMode =
  | 'select'
  | 'edit-text'
  | 'draw'
  | 'highlight-free'
  | 'pan';

export type SidebarTab = 'properties' | 'search';

export type ShapeType = 'rect' | 'circle' | 'line' | 'arrow' | 'highlight';

export type LayerAction = 'front' | 'back' | 'forward' | 'backward';

export interface PageItem {
  id: string;
  originalPageNum: number;
}

export interface PageDimensions {
  width: number;
  height: number;
}

export interface TextBoxInfo {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  originalPdfX: number;
  originalPdfY: number;
  originalPdfWidth: number;
  originalPdfHeight: number;
  originalPdfFontSize: number;
  replacedText?: string;
  replacedColor?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  angle?: number;
  detectedBgColor?: string;
  /** Viewport Y of the PDF.js text origin (typographic baseline). */
  baseline?: number;
  ascent?: number;
  descent?: number;
  pdfFontName?: string;
}

export interface OriginalTextData {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  angle?: number;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
  detectedColor?: string;
  detectedBgColor?: string;
  /** Viewport Y of the PDF.js text origin (typographic baseline). */
  baseline?: number;
  ascent?: number;
  descent?: number;
  pdfFontName?: string;
}

export interface SearchMatch {
  pageId: string;
  originalPageNum: number;
  boxId: string;
  text: string;
  index: number;
}

export interface SelectedObjectInfo {
  id: string;
  type: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  fontWeight: string;
  fontStyle: string;
  underline: boolean;
  textAlign: string;
  opacity: number;
  angle: number;
  isOriginalText: boolean;
  isHighlight: boolean;
  pageId: string;
  originalTextData?: OriginalTextData;
}

export interface ExportContext {
  pdfBytes: Uint8Array;
  pageList: PageItem[];
  pageDimensions: Record<number, PageDimensions>;
  canvasStates: Record<string, unknown>;
  canvasInstances: Record<string, unknown>;
  pdfDoc: unknown;
  fabricLib: unknown;
  zoomScale: number;
  fileName?: string;
  onStatus?: (status: string) => void;
}

export interface PageRendererProps {
  pageId: string;
  pageNum: number;
  originalPageNum: number;
  width: number;
  height: number;
  zoomScale: number;
  editMode: string;
  pdfDoc: any;
  fabricLib: any;
  canvasState: unknown;
  saveCanvasState: (pageId: string, state: unknown) => void;
  onFocusCanvas: (pageId: string, fbCanvas: unknown) => void;
  onObjectSelected: (pageId: string, activeObj: unknown) => void;
  onObjectCleared: () => void;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  brushWidth: number;
  fontFamily: string;
  fontSize: number;
  originalTexts: Record<number, TextBoxInfo[]>;
  registerCanvasInstance?: (pageId: string, canvas: unknown) => void;
  unregisterCanvasInstance?: (pageId: string) => void;
  onFabricModified?: (pageId: string, fabricObj: Record<string, unknown>) => void;
  onFabricAdded?: (pageId: string, fabricObj: Record<string, unknown>) => void;
}

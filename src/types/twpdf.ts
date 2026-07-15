import type { OriginalTextData } from '@/types/pdf';

// ─── Object type discriminants ───────────────────────────────────────────────

export type TWPDFObjectType =
  | 'text'
  | 'image'
  | 'shape'
  | 'highlight'
  | 'signature'
  | 'annotation';

export type TWPDFShapeKind = 'rectangle' | 'circle' | 'line' | 'arrow';

export type TWPDFTextAlignment = 'left' | 'center' | 'right' | 'justify';

// ─── Base object ─────────────────────────────────────────────────────────────

export interface TWPDFObjectBase {
  id: string;
  type: TWPDFObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  visible: boolean;
  selected: boolean;
  createdAt: number;
  updatedAt: number;
  zIndex: number;
}

// ─── Specialized objects ─────────────────────────────────────────────────────

export interface TWPDFTextObject extends TWPDFObjectBase {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  alignment: TWPDFTextAlignment;
  lineHeight: number;
  underline?: boolean;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
  isOriginalText?: boolean;
  isDeletedOriginal?: boolean;
  originalTextData?: OriginalTextData;
  baseline?: number;
  ascent?: number;
  descent?: number;
  pdfFontName?: string;
  originalBBox?: { x: number; y: number; width: number; height: number };
  fontName?: string;
}

export interface TWPDFImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TWPDFImageObject extends TWPDFObjectBase {
  type: 'image';
  src: string;
  crop?: TWPDFImageCrop;
  opacity: number;
  scaleX?: number;
  scaleY?: number;
}

export interface TWPDFShapeObject extends TWPDFObjectBase {
  type: 'shape';
  shapeKind: TWPDFShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface TWPDFHighlightObject extends TWPDFObjectBase {
  type: 'highlight';
  color: string;
  opacity: number;
}

export interface TWPDFSignatureObject extends TWPDFObjectBase {
  type: 'signature';
  src: string;
  opacity: number;
  scaleX?: number;
  scaleY?: number;
}

export interface TWPDFAnnotationObject extends TWPDFObjectBase {
  type: 'annotation';
  pathData?: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
  opacity?: number;
  isFreehand?: boolean;
  isHighlighter?: boolean;
}

export type TWPDFObject =
  | TWPDFTextObject
  | TWPDFImageObject
  | TWPDFShapeObject
  | TWPDFHighlightObject
  | TWPDFSignatureObject
  | TWPDFAnnotationObject;

// ─── Page & document ─────────────────────────────────────────────────────────

export interface TWPDFPage {
  id: string;
  pageNumber: number;
  originalPageNum: number;
  width: number;
  height: number;
  rotation: number;
  objects: TWPDFObject[];
}

export interface TWPDFMetadata {
  title?: string;
  author?: string;
  createdAt: number;
  updatedAt: number;
  originalPageCount: number;
}

export interface TWPDFDocument {
  id: string;
  fileName: string;
  pageCount: number;
  metadata: TWPDFMetadata;
  pages: TWPDFPage[];
  currentPageId: string | null;
  selectedObjectId: string | null;
}

// ─── Factory input types ─────────────────────────────────────────────────────

export interface CreateDocumentInput {
  fileName: string;
  pages: Array<{
    id: string;
    originalPageNum: number;
    width: number;
    height: number;
  }>;
  originalTexts?: Record<number, Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    angle?: number;
    replacedText?: string;
    replacedColor?: string;
  }>>;
}

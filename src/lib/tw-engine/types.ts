export interface PDFTextObject {
  objectNumber?: number;
  generationNumber?: number;
  pageNumber: number;
  contentStreamRef?: any;
  contentStreamObject?: number;
  contentStreamGeneration?: number;
  operatorType?: string;
  operatorIndex: number;
  originalOperatorBytes?: string;
  originalEncodedString?: string;
  originalTextMatrix?: number[];
  originalTextPosition?: number[];
  fontResourceName?: string;
  fontResource?: string;
  fontName: string;
  subsetName?: string;
  fontSize: number;
  color: string;
  transformationMatrix: number[];
  boundingBox: { x: number; y: number; width: number; height: number };
  baseline: number;
  ascent?: number;
  descent?: number;
  glyphIds?: any[];
  glyphWidths?: number[];
  unicodeMapping?: any;
  cidMapping?: any;
  originalText: string;
  currentText: string;
  renderMode?: number;
  writingMode?: number;
  rotation: number;
  graphicsStateId?: string;
}

export interface PDFImageObject {
  objectNumber?: number;
  generationNumber?: number;
  pageNumber: number;
  contentStreamRef?: any;
  operatorIndex: number;
  originalPdfOperator?: any;
  transformationMatrix: number[];
  boundingBox: { x: number; y: number; width: number; height: number };
  rotation: number;
  width: number;
  height: number;
}

export interface PDFPathObject {
  objectNumber?: number;
  generationNumber?: number;
  pageNumber: number;
  contentStreamRef?: any;
  operatorIndex: number;
  originalPdfOperator?: any;
  transformationMatrix: number[];
  boundingBox: { x: number; y: number; width: number; height: number };
  rotation: number;
  pathData: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

export interface PDFFontObject {
  objectNumber?: number;
  generationNumber?: number;
  fontName: string;
  subsetName?: string;
  fontFamily: string;
  isEmbedded: boolean;
  fontType?: string;
  encoding?: string | string[];
  ascent?: number;
  descent?: number;
  glyphWidths?: number[];
  unicodeMapping?: any;
  cidMapping?: any;
}

export interface TWObject {
  id: string;
  page: number; // 1-based page number
  type: 'text' | 'image' | 'path' | 'vector' | 'annotation' | string;
  zIndex: number;
  
  // Viewport/Screen coordinate bounds
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  opacity: number; // 0.0 to 1.0
  
  visible: boolean;
  locked: boolean;
  deleted: boolean;
  createdAt: number;
  updatedAt: number;
  
  // Original PDF Metadata (NEVER MODIFIED)
  pdfObjectId?: string;
  pageIndex: number; // 0-based page index
  operatorIndex: number; // index inside page operator list
  resourceName?: string;
  transformationMatrix: number[]; // [a, b, c, d, e, f]
  
  // Native PDF Object Model
  pdfObject?: PDFTextObject | PDFImageObject | PDFPathObject;
  
  // Dirty state tracking
  isDirty: boolean;

  // State snapshots
  originalState: any;
  currentState: any;
  editedState?: any;
}

// ─── Specialized State Schemas ──────────────────────────────────────────────

export interface TWTextState {
  text: string;
  fontName: string;
  fontSize: number;
  fontColor: string;
  transformMatrix: number[];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  fontWeight?: string;
  fontStyle?: string;
  baseline?: number;
  ascent?: number;
  descent?: number;
  pdfFontName?: string;
  originalBBox?: { x: number; y: number; width: number; height: number };
  originalTextData?: any;
}

export interface TWImageState {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  transformMatrix: number[];
}

export interface TWPathState {
  pathData: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  transformMatrix: number[];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export interface TWVectorState {
  points: number[];
  transformMatrix: number[];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export interface TWAnnotationState {
  rect: number[]; // [vx1, vy1, vx2, vy2] screen coords
  contents?: string;
  color?: number[];
  formName?: string;
}

// ─── Specialized Engine Objects ──────────────────────────────────────────────

export interface TWTextObject extends TWObject {
  type: 'text';
  text: string;
  fontName: string;
  fontSize: number;
  fontColor: string;
  baseline: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  pdfObject?: PDFTextObject;

  originalState: TWTextState;
  currentState: TWTextState;
  editedState?: Partial<TWTextState>;

  fontWeight?: string;
  fontStyle?: string;
  ascent?: number;
  descent?: number;
  pdfFontName?: string;
  originalBBox?: { x: number; y: number; width: number; height: number };
  originalTextData?: any;
}

export interface TWImageObject extends TWObject {
  type: 'image';
  imageBytes: Uint8Array | null;
  mimeType: string;
  
  pdfObject?: PDFImageObject;

  originalState: TWImageState;
  currentState: TWImageState;
  editedState?: Partial<TWImageState>;
}

export interface TWPathObject extends TWObject {
  type: 'path';
  pathData: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  
  pdfObject?: PDFPathObject;

  originalState: TWPathState;
  currentState: TWPathState;
  editedState?: Partial<TWPathState>;
}

export interface TWVectorObject extends TWObject {
  type: 'vector';
  vectorType: 'line' | 'rect' | 'circle' | 'path';
  points: number[];
  
  originalState: TWVectorState;
  currentState: TWVectorState;
  editedState?: Partial<TWVectorState>;
}

export interface TWAnnotationObject extends TWObject {
  type: 'annotation';
  annotType: string;
  rect: number[];
  contents?: string;
  color?: number[];
  formName?: string;
  
  originalState: TWAnnotationState;
  currentState: TWAnnotationState;
  editedState?: Partial<TWAnnotationState>;
}

// ─── Document & Page Structures ──────────────────────────────────────────────

export interface TWPage {
  pageNumber: number;
  width: number;
  height: number;
  objects: TWObject[];
  fonts?: TWFontMetadata[];
}

export interface TWFontMetadata {
  fontName: string; // PDF internal reference name, e.g. 'g_d0_f1'
  postscriptName: string; // PostScript name, e.g. 'Arial-BoldMT'
  isEmbedded: boolean;
  fontType?: string; // TrueType, Type1, Type3, Type0, etc.
  encoding?: string | string[];
  isSubset?: boolean;
}

export interface TWDocument {
  id: string;
  fileName: string;
  pageCount: number;
  pages: TWPage[];
  metadata?: Record<string, unknown>;
}

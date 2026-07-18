export type PDFMutationType =
  | 'TextReplace'
  | 'ImageReplace'
  | 'DeleteObject'
  | 'Transform'
  | 'Color';

export interface BasePDFMutation {
  mutationId: string;
  type: PDFMutationType;
  pageNumber: number;
  timestamp: number;
}

export interface TextReplaceMutation extends BasePDFMutation {
  type: 'TextReplace';
  objectNumber?: number;
  generationNumber?: number;
  contentStreamObject?: number;
  operatorType?: string;
  operatorIndex: number;
  originalText: string;
  newText: string;
  fontName?: string;
  fontSize?: number;
  matrix?: number[];
}

export interface ImageReplaceMutation extends BasePDFMutation {
  type: 'ImageReplace';
  objectNumber?: number;
  generationNumber?: number;
  contentStreamObject?: number;
  operatorIndex: number;
  originalImageRef?: string;
  newImageBytes?: Uint8Array;
}

export interface DeleteObjectMutation extends BasePDFMutation {
  type: 'DeleteObject';
  objectNumber?: number;
  generationNumber?: number;
  contentStreamObject?: number;
  operatorIndex: number;
  targetType: 'text' | 'image' | 'path';
}

export interface TransformMutation extends BasePDFMutation {
  type: 'Transform';
  objectNumber?: number;
  generationNumber?: number;
  contentStreamObject?: number;
  operatorIndex: number;
  matrix: number[];
}

export interface ColorMutation extends BasePDFMutation {
  type: 'Color';
  objectNumber?: number;
  generationNumber?: number;
  contentStreamObject?: number;
  operatorIndex: number;
  color: string;
}

export type PDFMutation =
  | TextReplaceMutation
  | ImageReplaceMutation
  | DeleteObjectMutation
  | TransformMutation
  | ColorMutation;

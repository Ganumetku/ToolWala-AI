import { PDFOperand } from './PDFOperand';

export interface PDFOperator {
  name: string;
  operands: PDFOperand[];
  rawBytes: Uint8Array;
  byteOffset: number;
  length: number;
  objectNumber?: number;
  streamNumber?: number;
  graphicsStateDepth: number;
  textObjectDepth: number;
  suppressed?: boolean;
}

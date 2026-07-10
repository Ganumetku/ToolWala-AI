import { PDFValue } from './WriterTypes';

/**
 * IndirectObject represents a standard indirect object in a PDF file (e.g., "3 0 obj").
 */
export class IndirectObject {
  objNum: number;
  genNum = 0;
  dictionary: Record<string, PDFValue> = {};
  stream?: Uint8Array;
  offset = 0; // Byte offset from start of file (used to build xref table)

  constructor(objNum: number) {
    this.objNum = objNum;
  }
}

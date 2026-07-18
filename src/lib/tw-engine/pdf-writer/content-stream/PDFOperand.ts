export type PDFOperandType =
  | 'number'
  | 'literal_string'
  | 'hex_string'
  | 'name'
  | 'array'
  | 'dict'
  | 'boolean'
  | 'whitespace'
  | 'comment';

export interface PDFOperand {
  type: PDFOperandType;
  value?: any;
  bytes: Uint8Array;
}

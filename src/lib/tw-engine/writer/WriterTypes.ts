export interface PDFObjectRef {
  type: 'reference';
  objNum: number;
  genNum: number;
}

export class PDFName {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
}

export type PDFValue =
  | number
  | string
  | boolean
  | null
  | PDFObjectRef
  | PDFName
  | PDFValue[]
  | { [key: string]: PDFValue };

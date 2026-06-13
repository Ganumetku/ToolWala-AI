import { PDFDocument } from 'pdf-lib';

export function uint8ArrayToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      updateMetadata: false,
      ignoreEncryption: true
    });
    return pdfDoc.getPageCount();
  } catch (err) {
    console.error("Error reading page count:", err);
    return 1;
  }
}

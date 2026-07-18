import { PDFDocument, PDFName, PDFRef, PDFStream, PDFRawStream } from 'pdf-lib';

/**
 * PDFObjectResolver resolves indirect object numbers and page/content stream
 * references using pdf-lib primitives, forming the architectural foundation
 * for subsequent stream-rewriting phases.
 */
export class PDFObjectResolver {
  /**
   * Resolves the Page node dictionary for a given page index.
   */
  static resolvePageNode(pdfDoc: PDFDocument, pageNumber: number): any {
    try {
      const pages = pdfDoc.getPages();
      const page = pages[pageNumber - 1];
      return page?.node;
    } catch (e) {
      console.error(`Failed to resolve page node for page ${pageNumber}`, e);
      return null;
    }
  }

  /**
   * Resolves the Contents stream reference or array of references for a page.
   */
  static resolveContentsStreamRef(pdfDoc: PDFDocument, pageNumber: number): PDFRef | PDFRef[] | null {
    const pageNode = this.resolvePageNode(pdfDoc, pageNumber);
    if (!pageNode) return null;

    try {
      const contents = pageNode.get(PDFName.of('Contents'));
      if (contents instanceof PDFRef) {
        return contents;
      }
      // If it's a PDFArray containing multiple stream references
      if (contents && typeof contents === 'object' && typeof (contents as any).get === 'function') {
        const refs: PDFRef[] = [];
        const size = (contents as any).size ? (contents as any).size() : 0;
        for (let i = 0; i < size; i++) {
          const el = (contents as any).get(i);
          if (el instanceof PDFRef) {
            refs.push(el);
          }
        }
        return refs.length > 0 ? refs : null;
      }
      return null;
    } catch (e) {
      console.error(`Failed to resolve contents stream ref for page ${pageNumber}`, e);
      return null;
    }
  }

  /**
   * Resolves a general indirect object by object and generation number.
   */
  static resolveIndirectObject(
    pdfDoc: PDFDocument,
    objectNumber: number,
    generationNumber: number = 0
  ): any {
    try {
      const ref = PDFRef.of(objectNumber, generationNumber);
      return pdfDoc.context.lookup(ref);
    } catch (e) {
      console.error(`Failed to resolve indirect object ${objectNumber} R`, e);
      return null;
    }
  }

  /**
   * Resolves a Content Stream object.
   */
  static resolveContentsStream(
    pdfDoc: PDFDocument,
    objectNumber: number,
    generationNumber: number = 0
  ): PDFStream | PDFRawStream | null {
    const obj = this.resolveIndirectObject(pdfDoc, objectNumber, generationNumber);
    if (obj instanceof PDFStream || obj instanceof PDFRawStream) {
      return obj;
    }
    return null;
  }
}

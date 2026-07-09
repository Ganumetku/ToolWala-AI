import type { TWDocument } from './types';
import { PageParser } from './PageParser';
import { ObjectRegistry } from './ObjectRegistry';

/**
 * DocumentParser handles client-side PDF document loading, dynamic bootstrapping
 * of the PDFJS engine/workers, page iteration, structural assembly into a TWDocument,
 * and populating the ObjectRegistry cache.
 */
export class DocumentParser {
  /**
   * Reads a raw PDF byte buffer and parses it into a strongly typed TWDocument tree.
   */
  static async parseDocument(
    pdfBytes: Uint8Array,
    fileName: string
  ): Promise<TWDocument> {
    let pdfjs;
    
    // Environment-aware library loading
    if (typeof window === 'undefined') {
      pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const path = await import('path');
      const { pathToFileURL } = await import('url');
      const workerPath = path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString();
    } else {
      pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjs.getDocument({ data: pdfBytes.slice() });
    const doc = await loadingTask.promise;

    const pageCount = doc.numPages;
    const pageParsers = [];

    // Parse all pages concurrently
    for (let i = 1; i <= pageCount; i++) {
      pageParsers.push(
        (async () => {
          const page = await doc.getPage(i);
          return PageParser.parsePage(page, i, pdfjs);
        })()
      );
    }

    const pages = await Promise.all(pageParsers);

    // Read general info metadata if available
    let metadata: Record<string, unknown> | undefined = undefined;
    try {
      const meta = await doc.getMetadata();
      if (meta && meta.info) {
        metadata = meta.info as Record<string, unknown>;
      }
    } catch (e) {
      console.warn('Could not read PDF metadata info block', e);
    }

    const twDoc: TWDocument = {
      id: `tw_doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      fileName,
      pageCount,
      pages,
      metadata,
    };

    // Hydrate the ObjectRegistry singleton
    const registry = ObjectRegistry.getInstance();
    registry.clear();
    twDoc.pages.forEach((page) => {
      page.objects.forEach((obj) => {
        registry.registerObject(obj);
      });
    });

    return twDoc;
  }
}

import type { TWPage, TWObject } from './types';
import { TextParser } from './TextParser';
import { ImageParser } from './ImageParser';
import { VectorParser } from './VectorParser';
import { AnnotationParser } from './AnnotationParser';
import { FontParser } from './FontParser';

/**
 * PageParser coordinates individual sub-parsers to extract dimensions, texts,
 * images, paths, annotations, and fonts from a single PDFJS page instance.
 */
export class PageParser {
  /**
   * Parses all layout elements from a page and resolves them into a TWPage object.
   */
  static async parsePage(
    page: any,
    pageNum: number,
    pdfjs: any
  ): Promise<TWPage> {
    const viewport = page.getViewport({ scale: 1.0 });
    const width = viewport.width;
    const height = viewport.height;

    // Run sub-parsers concurrently for optimal performance
    const [
      textObjects,
      imageObjects,
      vectorsResult,
      annotationObjects,
      fonts
    ] = await Promise.all([
      TextParser.parsePageText(page, pageNum, viewport),
      ImageParser.parsePageImages(page, pageNum, viewport, pdfjs),
      VectorParser.parsePageVectors(page, pageNum, viewport, pdfjs),
      AnnotationParser.parsePageAnnotations(page, pageNum, viewport),
      FontParser.parsePageFonts(page)
    ]);

    // Combine all parsed objects into a single flat array
    const combinedObjects: TWObject[] = [
      ...textObjects,
      ...imageObjects,
      ...vectorsResult.pathObjects,
      ...vectorsResult.vectorObjects,
      ...annotationObjects
    ];

    // Sort objects by operatorIndex to preserve the native PDF drawing order
    combinedObjects.sort((a, b) => a.operatorIndex - b.operatorIndex);

    // Assign sequential zIndex values to preserve drawing order
    combinedObjects.forEach((obj, idx) => {
      obj.zIndex = idx + 1;
    });

    return {
      pageNumber: pageNum,
      width,
      height,
      objects: combinedObjects,
      fonts,
    };
  }
}

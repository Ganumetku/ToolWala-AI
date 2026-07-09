import type { TWAnnotationObject, TWAnnotationState } from './types';

/**
 * AnnotationParser extracts native PDF interactive components
 * (such as links, widgets, form fields, highlights) from the page's annotation catalog.
 */
export class AnnotationParser {
  /**
   * Parses native annotations for a single page and converts boundaries to screen space.
   */
  static async parsePageAnnotations(
    page: any,
    pageNum: number,
    viewport: any
  ): Promise<TWAnnotationObject[]> {
    const annotations: TWAnnotationObject[] = [];
    try {
      const rawAnnots = await page.getAnnotations();
      if (!rawAnnots || rawAnnots.length === 0) return [];

      rawAnnots.forEach((annot: any, idx: number) => {
        const id = annot.id || `tw_annot_${pageNum}_${idx}_${Date.now()}`;
        const type = (annot.subtype || 'unknown').toLowerCase();
        
        let screenRect = [0, 0, 0, 0];
        let x = 0;
        let y = 0;
        let width = 0;
        let height = 0;

        if (annot.rect && annot.rect.length === 4) {
          const [pdfX1, pdfY1, pdfX2, pdfY2] = annot.rect;
          const [vx1, vy1] = viewport.convertToViewportPoint(pdfX1, pdfY2) as [number, number];
          const [vx2, vy2] = viewport.convertToViewportPoint(pdfX2, pdfY1) as [number, number];
          screenRect = [vx1, vy1, vx2, vy2];

          x = vx1;
          y = vy1;
          width = Math.abs(vx2 - vx1);
          height = Math.abs(vy2 - vy1);
        }

        const annotState: TWAnnotationState = {
          rect: screenRect,
          contents: annot.contents || undefined,
          color: annot.color ? Array.from(annot.color) : undefined,
          formName: annot.fieldName || undefined,
        };

        annotations.push({
          id,
          page: pageNum,
          type: 'annotation',
          zIndex: 0, // Assigned by PageParser
          
          x,
          y,
          width,
          height,
          rotation: 0,
          opacity: 1.0,
          
          visible: true,
          locked: false,
          deleted: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          
          pageIndex: pageNum - 1,
          operatorIndex: 100000 + idx, // Virtual high index to draw on top of vector layouts
          transformationMatrix: [1, 0, 0, 1, 0, 0],
          isDirty: false,

          annotType: type,
          rect: screenRect,
          contents: annot.contents || undefined,
          color: annot.color ? Array.from(annot.color) : undefined,
          formName: annot.fieldName || undefined,

          originalState: { ...annotState },
          currentState: { ...annotState },
        });
      });
    } catch (e) {
      console.error(`AnnotationParser failed on page ${pageNum}`, e);
    }
    return annotations;
  }
}

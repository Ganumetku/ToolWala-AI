import { SceneNode } from './SceneNode';

/**
 * LayerManager coordinates container layering priorities for document items,
 * defining draw sequences (zIndex) for background layouts, active annotations, and guides.
 */
export class LayerManager {
  /**
   * Generates default rendering layers as child SceneNode branches under a Page.
   * 
   * Z-Index weights:
   * - pdf: 10 (background, paths, texts, images)
   * - annotation: 20 (interactive links, forms)
   * - selection: 30 (bounding boxes, transform controls)
   * - guide: 40 (alignment margins, rulers)
   * - overlay: 50 (collaborative cursors, overlays)
   */
  static createDefaultLayers(pageNumber: number): {
    pdf: SceneNode;
    annotation: SceneNode;
    selection: SceneNode;
    guide: SceneNode;
    overlay: SceneNode;
  } {
    const pdf = new SceneNode(`page_${pageNumber}_layer_pdf`, pageNumber);
    pdf.zIndex = 10;

    const annotation = new SceneNode(`page_${pageNumber}_layer_annotation`, pageNumber);
    annotation.zIndex = 20;

    const selection = new SceneNode(`page_${pageNumber}_layer_selection`, pageNumber);
    selection.zIndex = 30;

    const guide = new SceneNode(`page_${pageNumber}_layer_guide`, pageNumber);
    guide.zIndex = 40;

    const overlay = new SceneNode(`page_${pageNumber}_layer_overlay`, pageNumber);
    overlay.zIndex = 50;

    return {
      pdf,
      annotation,
      selection,
      guide,
      overlay,
    };
  }
}

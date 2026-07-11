import { FontMetrics } from '../text/FontMetrics';

/**
 * BaselineEngine computes baseline offsets relative to bounding dimensions
 * to ensure rendered text overlays exactly align with original PDF characters.
 */
export class BaselineEngine {
  /**
   * Resolves typographic baseline offset relative to container top-left coordinate.
   */
  static getBaselineOffset(fontSize: number, metrics: FontMetrics): number {
    const scale = fontSize / metrics.unitsPerEm;
    // Standard baseline aligns to the ascender line
    const ascentPx = metrics.ascent * scale;
    return ascentPx;
  }
}

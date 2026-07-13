import { FontMetricsCache } from '../text/FontMetricsCache';
import { GlyphCache } from '../text/GlyphCache';

/**
 * GlyphMetrics manages character width measurements and caching.
 */
export class GlyphMetrics {
  static getGlyphWidth(
    char: string,
    fontFamily: string,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    isStandard: boolean
  ): number {
    if (isStandard) {
      // Standard PDF core fonts use units based on 1000 Units Per Em
      return GlyphCache.getGlyphAdvance(fontFamily, char) * (fontSize / 1000);
    }
    const cache = FontMetricsCache.getMetrics(fontFamily, fontSize, fontWeight, fontStyle, char);
    return cache.advanceX;
  }
}

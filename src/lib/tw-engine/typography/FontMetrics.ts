import { FontMetricsRegistry } from '../text/FontMetrics';
import { FontMetricsCache } from '../text/FontMetricsCache';

export interface FontStats {
  ascent: number;
  descent: number;
  capHeight: number;
  unitsPerEm: number;
  lineGap: number;
}

/**
 * FontMetrics caches overall font ascents, descents, and heights.
 */
export class FontMetrics {
  private static cache = new Map<string, FontStats>();

  static getMetrics(
    fontFamily: string,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    isStandard: boolean,
    sampleText = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  ): FontStats {
    const key = `${fontFamily}_${fontSize}_${fontWeight}_${fontStyle}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    if (isStandard) {
      const std = FontMetricsRegistry.getMetrics(fontFamily);
      const scale = fontSize / std.unitsPerEm;
      const stats: FontStats = {
        ascent: std.ascent * scale,
        descent: Math.abs(std.descent * scale),
        capHeight: (std.capHeight || std.ascent) * scale,
        unitsPerEm: std.unitsPerEm,
        lineGap: std.lineGap * scale,
      };
      this.cache.set(key, stats);
      return stats;
    }

    // Measure custom font via character samples
    let maxAscent = 0;
    let maxDescent = 0;
    for (let i = 0; i < sampleText.length; i++) {
      const m = FontMetricsCache.getMetrics(fontFamily, fontSize, fontWeight, fontStyle, sampleText[i]);
      if (m.ascent > maxAscent) maxAscent = m.ascent;
      if (m.descent > maxDescent) maxDescent = m.descent;
    }

    const stats: FontStats = {
      ascent: maxAscent || (fontSize * 0.8),
      descent: maxDescent || (fontSize * 0.2),
      capHeight: (maxAscent || (fontSize * 0.8)) * 0.7,
      unitsPerEm: 1000,
      lineGap: 0,
    };
    this.cache.set(key, stats);
    return stats;
  }
}

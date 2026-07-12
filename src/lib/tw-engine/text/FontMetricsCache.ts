export interface GlyphMetrics {
  advanceX: number;
  ascent: number;
  descent: number;
}

/**
 * FontMetricsCache caches subpixel canvas measurements for browser custom fonts
 * using a single, globally shared offscreen Canvas rendering context.
 */
export class FontMetricsCache {
  private static cache: Map<string, GlyphMetrics> = new Map();
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;

  private static getContext(): CanvasRenderingContext2D | null {
    if (this.ctx) return this.ctx;
    if (typeof document === 'undefined') return null;
    try {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      return this.ctx;
    } catch (e) {
      console.error('Failed to create shared offscreen canvas context for FontMetricsCache', e);
      return null;
    }
  }

  /**
   * Retrieves or measures subpixel glyph metrics for a character.
   */
  static getMetrics(
    family: string,
    size: number,
    weight: string,
    style: string,
    char: string
  ): GlyphMetrics {
    const key = `${family}_${size}_${weight}_${style}_${char}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const ctx = this.getContext();
    if (!ctx) {
      // Typographic fallback metrics if browser canvas APIs are not initialized (e.g. Node/SSR test environments)
      const fallbackAdvance = size * 0.55;
      const fallbackAscent = size * 0.8;
      const fallbackDescent = size * 0.2;
      return {
        advanceX: fallbackAdvance,
        ascent: fallbackAscent,
        descent: fallbackDescent
      };
    }

    ctx.save();
    ctx.font = `${style} ${weight} ${size}px ${family}`;
    const measure = ctx.measureText(char);
    
    const advanceX = measure.width;
    const ascent = typeof measure.actualBoundingBoxAscent === 'number' 
      ? Math.max(0.1, measure.actualBoundingBoxAscent) 
      : size * 0.8;
    const descent = typeof measure.actualBoundingBoxDescent === 'number' 
      ? Math.max(0.1, measure.actualBoundingBoxDescent) 
      : size * 0.2;
    
    ctx.restore();

    const metrics: GlyphMetrics = { advanceX, ascent, descent };
    this.cache.set(key, metrics);
    return metrics;
  }

  /**
   * Clears the cached glyph metrics.
   */
  static clear(): void {
    this.cache.clear();
  }
}

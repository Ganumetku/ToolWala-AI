import { FontMetrics } from '../text/FontMetrics';

/**
 * BrowserFontFallback maps fallback standard system fonts based on closest typographic design metrics.
 */
export class BrowserFontFallback {
  private static systemFonts = [
    { name: 'Helvetica', ascent: 800, descent: -200, avgWidth: 500 },
    { name: 'Times New Roman', ascent: 798, descent: -207, avgWidth: 500 },
    { name: 'Courier New', ascent: 629, descent: -157, avgWidth: 600 },
    { name: 'Arial', ascent: 728, descent: -210, avgWidth: 512 },
    { name: 'Georgia', ascent: 750, descent: -220, avgWidth: 495 },
  ];

  /**
   * Identifies closest matching system font metrics fallback.
   */
  static getFallbackFont(targetMetrics: FontMetrics): string {
    let bestMatch = 'Helvetica';
    let minError = Infinity;

    for (const sys of this.systemFonts) {
      // Calculate normalized error difference on ascent, descent, and width metrics
      const error =
        Math.abs(sys.ascent - targetMetrics.ascent) +
        Math.abs(sys.descent - targetMetrics.descent) +
        Math.abs(sys.avgWidth - targetMetrics.averageWidth);

      if (error < minError) {
        minError = error;
        bestMatch = sys.name;
      }
    }

    return bestMatch;
  }
}

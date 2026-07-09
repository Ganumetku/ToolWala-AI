export interface FontMetrics {
  fontName: string;
  ascent: number;       // Typographic ascender units (positive)
  descent: number;      // Typographic descender units (negative)
  capHeight: number;    // Height of uppercase letters
  xHeight: number;      // Height of lowercase 'x'
  lineGap: number;      // Typographic line gap units
  averageWidth: number; // Average glyph advance width
  unitsPerEm: number;   // Design units per Em (usually 1000)
}

/**
 * FontMetricsRegistry stores and resolves typographic dimensions
 * for standard PDF fonts and fallbacks.
 */
export class FontMetricsRegistry {
  private static metricsMap: Map<string, FontMetrics> = new Map([
    [
      'helvetica',
      {
        fontName: 'Helvetica',
        ascent: 800,
        descent: -200,
        capHeight: 700,
        xHeight: 500,
        lineGap: 50,
        averageWidth: 500,
        unitsPerEm: 1000,
      },
    ],
    [
      'times-roman',
      {
        fontName: 'Times-Roman',
        ascent: 798,
        descent: -207,
        capHeight: 662,
        xHeight: 450,
        lineGap: 50,
        averageWidth: 500,
        unitsPerEm: 1000,
      },
    ],
    [
      'courier',
      {
        fontName: 'Courier',
        ascent: 629,
        descent: -157,
        capHeight: 562,
        xHeight: 426,
        lineGap: 50,
        averageWidth: 600, // Fixed width
        unitsPerEm: 1000,
      },
    ],
  ]);

  /**
   * Resolves typographic dimensions for a font family name.
   */
  static getMetrics(fontName: string): FontMetrics {
    const key = fontName.toLowerCase();
    
    // Resolve matching style variations (bold, oblique) to their base families
    if (key.includes('helvetica')) {
      return this.metricsMap.get('helvetica')!;
    }
    if (key.includes('times') || key.includes('roman')) {
      return this.metricsMap.get('times-roman')!;
    }
    if (key.includes('courier') || key.includes('mono')) {
      return this.metricsMap.get('courier')!;
    }

    // Default fallback is Helvetica metrics
    return this.metricsMap.get('helvetica')!;
  }
}

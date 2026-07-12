/**
 * FontResolver handles font name cleanup (stripping PDF subset prefixes)
 * and mapping fallback fonts.
 */
export class FontResolver {
  /**
   * Cleans PostScript subset prefixes from font names (e.g., "ABCDEF+Helvetica-Bold" -> "Helvetica-Bold").
   */
  static resolveFontFamily(fontName: string): string {
    if (!fontName) return 'Helvetica';
    
    // Strip subset name prefix if it contains '+'
    const plusIndex = fontName.indexOf('+');
    let baseName = plusIndex !== -1 ? fontName.slice(plusIndex + 1) : fontName;

    // Standardize to core fonts matching FontMetricsRegistry
    const lower = baseName.toLowerCase();
    if (lower.includes('helvetica')) {
      return baseName; // e.g. Helvetica, Helvetica-Bold
    }
    if (lower.includes('times') || lower.includes('roman')) {
      return baseName;
    }
    if (lower.includes('courier')) {
      return baseName;
    }

    return baseName; // Preserves custom/embedded web fonts
  }

  /**
   * Determines fallback font families if character glyphs are missing in target font.
   */
  static resolveFallback(char: string, targetFont: string): string {
    const cleaned = this.resolveFontFamily(targetFont);
    
    // Simple mock Unicode range check: fallback to standard families
    const code = char.charCodeAt(0);
    
    // If standard symbols range, Courier handles monospaced symbols well
    if (code >= 0x2100 && code <= 0x214F) {
      return 'Courier';
    }

    return cleaned;
  }
}

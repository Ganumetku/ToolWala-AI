/**
 * FontMatcher resolves PostScript subset names (e.g. ABCDEF+TimesNewRomanPSMT)
 * to standard font family names and Base14 PDF font mappings.
 */
export class FontMatcher {
  private static base14Map: Map<string, string> = new Map([
    ['times-roman', 'Times New Roman'],
    ['times-bold', 'Times New Roman'],
    ['times-italic', 'Times New Roman'],
    ['times-bolditalic', 'Times New Roman'],
    ['helvetica', 'Helvetica'],
    ['helvetica-bold', 'Helvetica'],
    ['helvetica-oblique', 'Helvetica'],
    ['helvetica-boldoblique', 'Helvetica'],
    ['courier', 'Courier New'],
    ['courier-bold', 'Courier New'],
    ['courier-oblique', 'Courier New'],
    ['courier-boldoblique', 'Courier New'],
    ['symbol', 'Symbol'],
    ['zapfdingbats', 'ZapfDingbats'],
  ]);

  /**
   * Cleans PS subset prefix and maps to canonical family names.
   */
  static matchFont(fontName: string): string {
    if (!fontName) return 'Helvetica';

    // 1. Strip subset prefix (e.g., "ABCDEF+Helvetica" -> "Helvetica")
    const plusIndex = fontName.indexOf('+');
    let cleanName = plusIndex !== -1 ? fontName.slice(plusIndex + 1) : fontName;

    // 2. Normalize and check Base14 core fonts
    const normalized = cleanName.replace(/[\s\-_,]/g, '').toLowerCase();

    for (const [key, val] of this.base14Map.entries()) {
      if (normalized.includes(key.replace('-', ''))) {
        return val;
      }
    }

    // 3. Fallback standard cleanup
    return cleanName.replace(/PSMT|MT|PS/g, '').replace(/([A-Z])/g, ' $1').trim() || 'Helvetica';
  }
}

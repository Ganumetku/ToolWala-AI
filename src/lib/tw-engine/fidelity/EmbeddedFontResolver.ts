/**
 * EmbeddedFontResolver extracts, caches, and registers binary fonts (OTF/TTF)
 * extracted from the PDF document structure dynamically into the DOM via @font-face.
 */
export class EmbeddedFontResolver {
  private static fontCache: Map<string, ArrayBuffer> = new Map();
  private static registeredFonts: Set<string> = new Set();

  /**
   * Registers font binary bytes into browser DOM styles.
   */
  static registerEmbeddedFont(fontFamily: string, fontBytes: ArrayBuffer): void {
    if (this.registeredFonts.has(fontFamily)) return;

    this.fontCache.set(fontFamily, fontBytes);

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([fontBytes], { type: 'font/opentype' });
        const url = URL.createObjectURL(blob);

        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
          @font-face {
            font-family: '${fontFamily}';
            src: url('${url}') format('opentype');
          }
        `;
        document.head.appendChild(style);
        this.registeredFonts.add(fontFamily);
      } catch (err) {
        console.error(`EmbeddedFontResolver failed to load font "${fontFamily}":`, err);
      }
    }
  }

  /**
   * Queries if a font family is cached as an embedded font.
   */
  static isEmbedded(fontFamily: string): boolean {
    return this.fontCache.has(fontFamily);
  }

  /**
   * Clears the font registries cache.
   */
  static clear(): void {
    this.fontCache.clear();
    this.registeredFonts.clear();
  }
}

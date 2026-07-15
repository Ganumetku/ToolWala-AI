import type { TWFontMetadata } from './types';
import { GlyphAdvanceEngine } from './fidelity/GlyphAdvanceEngine';

/**
 * FontParser scans PDF stylesheets and common resources
 * to collect PostScript font families, embedded buffers, and character encodings.
 */
export class FontParser {
  /**
   * Identifies all unique font resources reference keys referenced inside page styles.
   */
  static async parsePageFonts(page: any): Promise<TWFontMetadata[]> {
    const fonts: TWFontMetadata[] = [];
    try {
      const textContent = await page.getTextContent();
      const styles = textContent.styles || {};
      const fontRefKeys = Object.keys(styles);

      for (const fontRef of fontRefKeys) {
        const styleObj = styles[fontRef];
        const fontFamilyName = styleObj.fontFamily || '';

        // Query both local and shared common object maps
        const commonObj = page.commonObjs.get(fontRef) || page.objs.get(fontRef);

        let isEmbedded = false;
        let fontType: string | undefined = undefined;
        let encoding: string | string[] | undefined = undefined;
        let isSubset = false;
        let postscriptName = fontFamilyName;

        if (commonObj) {
          isEmbedded = commonObj.data !== null && commonObj.data !== undefined;
          fontType = commonObj.type || undefined;
          postscriptName = commonObj.name || fontFamilyName;

          // Check if PostScript name matches standard subset patterns XXXXXX+FontName
          const subsetRegex = /^[A-Z]{6}\+/;
          isSubset = subsetRegex.test(postscriptName);

          if (commonObj.toUnicode) {
            encoding = 'Unicode';
          }

          if (commonObj.data) {
            const widths = commonObj.data.widths;
            const firstChar = typeof commonObj.data.firstChar === 'number' ? commonObj.data.firstChar : 0;
            const missingWidth = typeof commonObj.data.missingWidth === 'number' ? commonObj.data.missingWidth : 0;
            const fontMatrix = commonObj.data.fontMatrix || null;
            const toUnicode = commonObj.data.toUnicode || null;

            GlyphAdvanceEngine.registerFont(fontRef, widths, firstChar, missingWidth, fontMatrix, toUnicode);
            if (commonObj.name && commonObj.name !== fontRef) {
              GlyphAdvanceEngine.registerFont(commonObj.name, widths, firstChar, missingWidth, fontMatrix, toUnicode);
            }
            if (fontFamilyName && fontFamilyName !== fontRef) {
              GlyphAdvanceEngine.registerFont(fontFamilyName, widths, firstChar, missingWidth, fontMatrix, toUnicode);
            }
          }
        }

        fonts.push({
          fontName: fontRef,
          postscriptName,
          isEmbedded,
          fontType,
          encoding,
          isSubset,
        });
      }
    } catch (e) {
      console.warn('FontParser failed to extract styles catalog:', e);
    }
    return fonts;
  }
}

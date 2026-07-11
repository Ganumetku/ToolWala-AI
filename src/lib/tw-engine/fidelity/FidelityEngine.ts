import { FontMatcher } from './FontMatcher';
import { TextStateParams, TextMatrixCompiler } from './TextMatrixCompiler';
import { CharacterPositionEngine, PositionedGlyph } from './CharacterPositionEngine';
import { TextBoundsCompiler, BoundingRect } from './TextBoundsCompiler';

export interface GlyphRun {
  fontFamily: string;
  fontSize: number;
  matrix: number[];
  glyphs: PositionedGlyph[];
  bounds: BoundingRect;
}

/**
 * FidelityEngine coordinates typographic subcomponents to generate
 * pixel-accurate text layouts directly matching original PDF specifications.
 */
export class FidelityEngine {
  private static layoutCache: Map<string, GlyphRun> = new Map();

  /**
   * Compiles typeset characters run with matching matrix and bounding properties.
   */
  static compileTextRun(
    text: string,
    rawFontName: string,
    fontSize: number,
    params?: Partial<TextStateParams>
  ): GlyphRun {
    const cacheKey = `${text}_${rawFontName}_${fontSize}_${JSON.stringify(params)}`;
    if (this.layoutCache.has(cacheKey)) {
      return this.layoutCache.get(cacheKey)!;
    }

    const fontFamily = FontMatcher.matchFont(rawFontName);

    const defaultParams: TextStateParams = {
      charSpacing: 0,
      wordSpacing: 0,
      horizontalScaling: 100,
      leading: fontSize * 1.2,
      rise: 0,
      textMatrix: [1, 0, 0, 1, 0, 0],
      lineMatrix: [1, 0, 0, 1, 0, 0],
      ...params,
    };

    const glyphs = CharacterPositionEngine.typesetText(text, fontFamily, fontSize, defaultParams);
    const bounds = TextBoundsCompiler.compileBounds(glyphs);
    const matrix = TextMatrixCompiler.compileMatrix(defaultParams);

    const run: GlyphRun = {
      fontFamily,
      fontSize,
      matrix,
      glyphs,
      bounds,
    };

    this.layoutCache.set(cacheKey, run);
    return run;
  }

  /**
   * Clears the compiled text runs layout cache.
   */
  static clearCache(): void {
    this.layoutCache.clear();
  }
}

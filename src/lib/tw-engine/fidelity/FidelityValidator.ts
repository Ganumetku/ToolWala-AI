import { GlyphRun } from './FidelityEngine';

export interface ValidationScore {
  fontMatchScore: number;     // 0.0 to 1.0
  positionErrorPx: number;     // Accumulated position drift error
  fidelityPercent: number;    // 0% to 100%
  aligned: boolean;
}

/**
 * FidelityValidator compares typeset glyph runs against target specifications
 * to output precision alignment error scores.
 */
export class FidelityValidator {
  /**
   * Asserts layout metrics, calculating spatial position error and font matching accuracy.
   */
  static validate(actual: GlyphRun, target: { fontFamily: string; fontSize: number; width: number }): ValidationScore {
    // 1. Font matching evaluation
    const matched = actual.fontFamily.toLowerCase() === target.fontFamily.toLowerCase();
    const fontMatchScore = matched ? 1.0 : 0.5;

    // 2. Position error drift
    let totalWidth = 0;
    actual.glyphs.forEach((g) => {
      totalWidth += g.advance;
    });

    const positionErrorPx = Math.abs(totalWidth - target.width);

    // 3. Overall fidelity score (tolerance bounds)
    const errorRatio = target.width > 0 ? positionErrorPx / target.width : 0;
    const spacingScore = Math.max(0, 1.0 - errorRatio);

    const fidelityPercent = Math.round(((fontMatchScore + spacingScore) / 2.0) * 100.0);
    const aligned = fidelityPercent >= 90;

    return {
      fontMatchScore,
      positionErrorPx,
      fidelityPercent,
      aligned,
    };
  }
}

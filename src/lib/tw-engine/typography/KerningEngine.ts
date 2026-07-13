import { Kerning } from '../text/Kerning';

/**
 * KerningEngine computes pair adjustments using standard font kerning tables.
 */
export class KerningEngine {
  static getKerning(
    leftChar: string,
    rightChar: string,
    fontFamily: string,
    fontSize: number,
    isStandard: boolean
  ): number {
    if (!isStandard) return 0;
    const kerningUnits = Kerning.getSpacingOffset(fontFamily, leftChar, rightChar, 0);
    return kerningUnits * (fontSize / 1000);
  }
}

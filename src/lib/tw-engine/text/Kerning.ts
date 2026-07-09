/**
 * Kerning handles pair-kerning offsets (design units) for core fonts,
 * as well as letter-spacing and tracking variables.
 */
export class Kerning {
  // Standard pair-kerning offsets (per 1000 EM units)
  private static kerningPairs: Record<string, number> = {
    'AV': -80, 'AW': -80, 'AY': -80, 'Va': -60, 'Ve': -60, 'Vo': -60, 'Vr': -60,
    'YA': -80, 'Ye': -60, 'Yo': -60, 'WA': -80, 'We': -40, 'Wo': -40, 'Te': -50,
    'To': -50, 'Ta': -50, 'PA': -60, 'Pe': -40, 'Po': -40, 'av': -30, 'aw': -30,
  };

  /**
   * Resolves the typographic offset between two adjacent characters.
   */
  static getKerningOffset(fontName: string, charA: string, charB: string): number {
    const key = charA + charB;
    return this.kerningPairs[key] || 0;
  }

  /**
   * Computes the total spacing offset (in design units) incorporating kerning,
   * tracking, and letter spacing.
   * 
   * @param fontName Active font name
   * @param charA Left character
   * @param charB Right character
   * @param letterSpacing User letter-spacing (px)
   * @param tracking Custom tracking units (design units)
   * @param unitsPerEm Font units ratio (usually 1000)
   */
  static getSpacingOffset(
    fontName: string,
    charA: string,
    charB: string,
    letterSpacing = 0,
    tracking = 0,
    unitsPerEm = 1000
  ): number {
    // 1. Resolve design units kerning
    const kern = this.getKerningOffset(fontName, charA, charB);

    // 2. Add tracking design units
    const track = tracking;

    // 3. Convert letter-spacing from pixels to design units
    // scale = unitsPerEm / fontSize
    // We assume an average scale of 1000 design units for spacing conversions
    const letterSpaceDU = letterSpacing * 50; // Approximated multiplier

    return kern + track + letterSpaceDU;
  }
}

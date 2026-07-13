/**
 * BaselineEngine computes relative translation adjustments to align
 * edited text origins perfectly with original layouts.
 */
export class BaselineEngine {
  static calculateBaselineShift(
    originalBaseline: number | undefined,
    boxTop: number,
    fontSize: number,
    layoutFirstLineY: number
  ): number {
    const targetBaselineY = (originalBaseline !== undefined)
      ? (originalBaseline - boxTop)
      : layoutFirstLineY;
    return targetBaselineY - layoutFirstLineY;
  }
}

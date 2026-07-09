/**
 * Matrix.ts provides mathematical utilities for 2D affine transformations
 * modeled as [a, b, c, d, e, f] representing the transform matrix:
 * 
 * [ a  c  e ]
 * [ b  d  f ]
 * [ 0  0  1 ]
 */
export class Matrix {
  /**
   * Multiplies two affine matrices m1 * m2
   */
  static multiply(m1: number[], m2: number[]): number[] {
    const [a1, b1, c1, d1, e1, f1] = m1;
    const [a2, b2, c2, d2, e2, f2] = m2;
    return [
      a1 * a2 + c1 * b2,
      b1 * a2 + d1 * b2,
      a1 * c2 + c1 * d2,
      b1 * c2 + d1 * d2,
      a1 * e2 + c1 * f2 + e1,
      b1 * e2 + d1 * f2 + f1,
    ];
  }

  /**
   * Computes the matrix inversion. Returns identity matrix if det = 0.
   */
  static inverse(m: number[]): number[] {
    const [a, b, c, d, e, f] = m;
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-10) {
      return [1, 0, 0, 1, 0, 0];
    }
    return [
      d / det,
      -b / det,
      -c / det,
      a / det,
      (c * f - d * e) / det,
      (b * e - a * f) / det,
    ];
  }

  /**
   * Translates a matrix by [tx, ty]
   */
  static translate(m: number[], tx: number, ty: number): number[] {
    const [a, b, c, d, e, f] = m;
    return [
      a,
      b,
      c,
      d,
      a * tx + c * ty + e,
      b * tx + d * ty + f,
    ];
  }

  /**
   * Rotates a matrix by angle in radians
   */
  static rotate(m: number[], angleInRadians: number): number[] {
    const [a, b, c, d, e, f] = m;
    const cos = Math.cos(angleInRadians);
    const sin = Math.sin(angleInRadians);
    return [
      a * cos + c * sin,
      b * cos + d * sin,
      -a * sin + c * cos,
      -b * sin + d * cos,
      e,
      f,
    ];
  }

  /**
   * Scales a matrix by [sx, sy]
   */
  static scale(m: number[], sx: number, sy: number): number[] {
    const [a, b, c, d, e, f] = m;
    return [
      a * sx,
      b * sx,
      c * sy,
      d * sy,
      e,
      f,
    ];
  }

  /**
   * Transforms coordinate point [x, y] using the affine matrix
   */
  static transformPoint(m: number[], x: number, y: number): [number, number] {
    const [a, b, c, d, e, f] = m;
    return [
      a * x + c * y + e,
      b * x + d * y + f,
    ];
  }
}

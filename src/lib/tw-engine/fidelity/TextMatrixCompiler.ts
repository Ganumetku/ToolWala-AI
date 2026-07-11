export interface TextStateParams {
  charSpacing: number; // Tc
  wordSpacing: number; // Tw
  horizontalScaling: number; // Th (usually 100)
  leading: number; // Tl
  rise: number; // Ts
  textMatrix: number[]; // Tm: [a, b, c, d, e, f]
  lineMatrix: number[]; // Tlm: [a, b, c, d, e, f]
}

/**
 * TextMatrixCompiler aggregates and compiles standard PDF text matrix transformation matrices.
 */
export class TextMatrixCompiler {
  /**
   * Translates text state params relative to viewport scale.
   */
  static compileMatrix(params: TextStateParams): number[] {
    // PDF Text Matrix maps:
    // x' = a*x + c*y + e
    // y' = b*x + d*y + f
    return [...params.textMatrix];
  }

  /**
   * Appends translational move parameters (Td / TD).
   */
  static moveTextPosition(tx: number, ty: number, params: TextStateParams): TextStateParams {
    const matrix = params.lineMatrix;
    // Td translates the Line Matrix Tlm
    const newLineMatrix = [
      matrix[0],
      matrix[1],
      matrix[2],
      matrix[3],
      matrix[0] * tx + matrix[2] * ty + matrix[4],
      matrix[1] * tx + matrix[3] * ty + matrix[5],
    ];

    return {
      ...params,
      lineMatrix: newLineMatrix,
      textMatrix: [...newLineMatrix],
    };
  }

  /**
   * Triggers carriage break vertical line feeds (T*).
   */
  static carriageBreak(params: TextStateParams): TextStateParams {
    // T* is equivalent to Td(0, -leading)
    return this.moveTextPosition(0, -params.leading, params);
  }
}

import { PDFOperator } from './PDFOperator';

/**
 * OperatorSequence manages the ordered sequence of PDF operators,
 * allowing sequential access and serialization back into a byte stream.
 */
export class OperatorSequence {
  private operators: PDFOperator[] = [];

  constructor(operators: PDFOperator[] = []) {
    this.operators = operators;
  }

  /**
   * Returns the list of operators in sequence.
   */
  getOperators(): PDFOperator[] {
    return this.operators;
  }

  /**
   * Serializes the operators sequence back to raw byte stream.
   */
  serialize(): Uint8Array {
    let totalLength = 0;
    for (const op of this.operators) {
      totalLength += op.rawBytes.length;
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const op of this.operators) {
      result.set(op.rawBytes, offset);
      offset += op.rawBytes.length;
    }

    return result;
  }
}

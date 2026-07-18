import { Token, ContentStreamTokenizer } from './ContentStreamTokenizer';
import { PDFOperator } from './PDFOperator';
import { PDFOperand } from './PDFOperand';

/**
 * ContentStreamParser processes a token list into structured PDFOperator nodes,
 * preserving layout spacing and depth metrics.
 */
export class ContentStreamParser {
  /**
   * Parses token stream into sequential PDFOperators.
   */
  static parse(tokens: Token[], originalBytes: Uint8Array): PDFOperator[] {
    const operators: PDFOperator[] = [];
    let currentOperands: PDFOperand[] = [];
    let blockStart = 0;

    let gStateDepth = 0;
    let textObjectDepth = 0;

    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];

      if (token.type === 'whitespace' || token.type === 'comment') {
        i++;
        continue;
      }

      if (token.type === 'keyword') {
        const opName = token.value;

        // Update depths based on operators
        if (opName === 'q') gStateDepth++;
        else if (opName === 'Q') gStateDepth--;
        else if (opName === 'BT') textObjectDepth++;
        else if (opName === 'ET') textObjectDepth--;

        // Group tokens up to this operator
        let blockEnd = token.end;
        let nextIdx = i + 1;
        while (
          nextIdx < tokens.length &&
          (tokens[nextIdx].type === 'whitespace' || tokens[nextIdx].type === 'comment')
        ) {
          blockEnd = tokens[nextIdx].end;
          nextIdx++;
        }

        const opBytes = originalBytes.subarray(blockStart, blockEnd);

        operators.push({
          name: opName,
          operands: [...currentOperands],
          rawBytes: opBytes,
          byteOffset: blockStart,
          length: opBytes.length,
          graphicsStateDepth: gStateDepth,
          textObjectDepth,
        });

        currentOperands = [];
        i = nextIdx;
        blockStart = blockEnd;
      } else if (token.type === 'array_start') {
        const startToken = token;
        const arrayTokens: Token[] = [];
        i++;
        while (i < tokens.length && tokens[i].type !== 'array_end') {
          arrayTokens.push(tokens[i]);
          i++;
        }
        const endToken = tokens[i];
        i++; // consume array_end

        currentOperands.push({
          type: 'array',
          value: arrayTokens,
          bytes: originalBytes.subarray(startToken.start, endToken.end),
        });
      } else if (token.type === 'dict_start') {
        const startToken = token;
        const dictTokens: Token[] = [];
        i++;
        while (i < tokens.length && tokens[i].type !== 'dict_end') {
          dictTokens.push(tokens[i]);
          i++;
        }
        const endToken = tokens[i];
        i++; // consume dict_end

        currentOperands.push({
          type: 'dict',
          value: dictTokens,
          bytes: originalBytes.subarray(startToken.start, endToken.end),
        });
      } else {
        currentOperands.push({
          type: token.type as any,
          value: token.value,
          bytes: token.bytes,
        });
        i++;
      }
    }

    // Append extra trailing whitespace/comments to the last operator
    if (blockStart < originalBytes.length && operators.length > 0) {
      const lastOp = operators[operators.length - 1];
      const extraBytes = originalBytes.subarray(blockStart);
      const combined = new Uint8Array(lastOp.rawBytes.length + extraBytes.length);
      combined.set(lastOp.rawBytes, 0);
      combined.set(extraBytes, lastOp.rawBytes.length);
      lastOp.rawBytes = combined;
      lastOp.length = combined.length;
    }

    return operators;
  }

  /**
   * Performs byte-identical verification.
   */
  static verifyStream(
    bytes: Uint8Array,
    objectNumber?: number,
    streamNumber?: number
  ): boolean {
    try {
      const tokens = ContentStreamTokenizer.tokenize(bytes);
      const ops = this.parse(tokens, bytes);

      // Serialize back
      let serializedLength = 0;
      for (const op of ops) {
        serializedLength += op.rawBytes.length;
      }

      const serializedBytes = new Uint8Array(serializedLength);
      let offset = 0;
      for (const op of ops) {
        serializedBytes.set(op.rawBytes, offset);
        offset += op.rawBytes.length;
      }

      // Check byte identity
      let identical = true;
      if (bytes.length !== serializedBytes.length) {
        identical = false;
      } else {
        for (let i = 0; i < bytes.length; i++) {
          if (bytes[i] !== serializedBytes[i]) {
            identical = false;
            break;
          }
        }
      }

      const firstOp = ops.length > 0 ? ops[0].name : 'None';
      const lastOp = ops.length > 0 ? ops[ops.length - 1].name : 'None';

      console.log(`[Content Stream Verification]`, {
        'Object Number': objectNumber ?? 'N/A',
        'Stream Number': streamNumber ?? 'N/A',
        'Operator Count': ops.length,
        'First Operator': firstOp,
        'Last Operator': lastOp,
        'Serialization Match': identical,
        'Byte Length': `${bytes.length} bytes`,
      });

      return identical;
    } catch (e) {
      console.error('Failed to verify content stream reconstruction', e);
      return false;
    }
  }
}

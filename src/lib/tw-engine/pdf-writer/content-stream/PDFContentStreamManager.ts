import { ContentStreamTokenizer } from './ContentStreamTokenizer';
import { ContentStreamParser } from './ContentStreamParser';
import { OperatorSequence } from './OperatorSequence';

/**
 * PDFContentStreamManager manages the parsed OperatorSequence objects for each content stream,
 * serving as the central caching engine for Native Operator Suppression.
 */
export class PDFContentStreamManager {
  private static contentStreams: Map<string, Uint8Array> = new Map();
  private static operatorSequences: Map<string, OperatorSequence> = new Map();

  static setContentStreamBytes(pageNum: number, streamObjNum: number, bytes: Uint8Array) {
    const key = `${pageNum}_${streamObjNum}`;
    this.contentStreams.set(key, bytes);
    
    try {
      const tokens = ContentStreamTokenizer.tokenize(bytes);
      const ops = ContentStreamParser.parse(tokens, bytes);
      
      ops.forEach(op => {
        op.objectNumber = streamObjNum;
      });
      
      const seq = new OperatorSequence(ops);
      this.operatorSequences.set(key, seq);
    } catch (e) {
      console.warn(`Failed to parse content stream for page ${pageNum} stream ${streamObjNum}`, e);
    }
  }

  static getOperatorSequence(pageNum: number, streamObjNum: number): OperatorSequence | null {
    const key = `${pageNum}_${streamObjNum}`;
    return this.operatorSequences.get(key) || null;
  }
  
  static clear() {
    this.contentStreams.clear();
    this.operatorSequences.clear();
  }
}

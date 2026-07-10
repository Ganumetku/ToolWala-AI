import { IndirectObject } from './IndirectObject';

/**
 * XRefBuilder compiles cross-reference tables mapping byte offsets of indirect objects.
 */
export class XRefBuilder {
  /**
   * Generates the cross-reference section bytes.
   */
  static buildXRef(objects: IndirectObject[]): { bytes: Uint8Array } {
    // Sort indirect objects by objNum
    const sorted = [...objects].sort((a, b) => a.objNum - b.objNum);
    const maxObjNum = sorted.length > 0 ? sorted[sorted.length - 1].objNum : 0;

    let out = 'xref\n';
    out += `0 ${maxObjNum + 1}\n`;
    
    // Object 0 is always the head of the free list
    out += '0000000000 65535 f \n';

    const offsetMap = new Map<number, number>();
    sorted.forEach((obj) => {
      offsetMap.set(obj.objNum, obj.offset);
    });

    for (let i = 1; i <= maxObjNum; i++) {
      const offset = offsetMap.get(i);
      if (offset !== undefined) {
        // Enforce 10-digit zero-padded number and trailing spaces (20 bytes total width)
        const offsetStr = offset.toString().padStart(10, '0');
        out += `${offsetStr} 00000 n \n`;
      } else {
        out += '0000000000 00000 f \n';
      }
    }

    return {
      bytes: new TextEncoder().encode(out),
    };
  }
}

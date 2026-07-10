import { ObjectSerializer } from './ObjectSerializer';
import { PDFObjectRef, PDFValue } from './WriterTypes';

/**
 * TrailerBuilder assembles the trailer dictionary, Root catalog links,
 * and startxref values.
 */
export class TrailerBuilder {
  /**
   * Generates the serialized trailer dictionary.
   */
  static buildTrailer(
    size: number,
    rootObjNum: number,
    infoObjNum?: number
  ): string {
    const dict: Record<string, PDFValue> = {
      Size: size,
      Root: {
        type: 'reference',
        objNum: rootObjNum,
        genNum: 0,
      } as PDFObjectRef,
    };

    if (infoObjNum !== undefined) {
      dict.Info = {
        type: 'reference',
        objNum: infoObjNum,
        genNum: 0,
      } as PDFObjectRef;
    }

    let out = 'trailer\n';
    out += ObjectSerializer.serialize(dict);
    out += '\n';

    return out;
  }
}

import { Compression } from './Compression';
import { PDFName } from './WriterTypes';

/**
 * StreamWriter calculates lengths and formats stream headers for indirect objects.
 */
export class StreamWriter {
  /**
   * Compiles data into stream bytes and configures length dictionaries.
   */
  static writeStream(
    data: Uint8Array,
    compress = true
  ): { dict: Record<string, any>; streamBytes: Uint8Array } {
    if (compress) {
      const res = Compression.compress(data);
      if (res.filter) {
        return {
          dict: {
            Filter: new PDFName(res.filter),
            Length: res.bytes.length,
          },
          streamBytes: res.bytes,
        };
      }
    }

    return {
      dict: {
        Length: data.length,
      },
      streamBytes: data,
    };
  }
}

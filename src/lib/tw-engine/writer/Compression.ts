/**
 * Compression manages binary stream compression (FlateDecode) using standard Node.js
 * utilities with a runtime fallback configuration for browser runtime scopes.
 */
export class Compression {
  /**
   * Compresses stream bytes using FlateDecode.
   * Falls back to raw uncompressed data if zlib is unavailable.
   */
  static compress(data: Uint8Array): { filter?: string; bytes: Uint8Array } {
    try {
      // Dynamic require check to detect Node.js zlib at runtime
      if (typeof require !== 'undefined') {
        const zlib = require('zlib');
        if (zlib && zlib.deflateSync) {
          const compressed = zlib.deflateSync(Buffer.from(data));
          return {
            filter: 'FlateDecode',
            bytes: new Uint8Array(compressed),
          };
        }
      }
    } catch (err) {
      console.warn('ToolWala Compression: zlib compression fallback triggered', err);
    }

    return { bytes: data };
  }
}

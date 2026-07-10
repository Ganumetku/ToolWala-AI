import { PDFName, PDFValue } from './WriterTypes';

/**
 * ObjectSerializer compiles PDFValue models into standard PDF document syntax strings.
 */
export class ObjectSerializer {
  /**
   * Compiles any PDFValue into its serialized PDF string representation.
   */
  static serialize(val: PDFValue): string {
    if (val === null) return 'null';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'string') {
      return `(${this.escapeString(val)})`;
    }
    if (val instanceof PDFName) {
      return `/${val.value}`;
    }
    if (Array.isArray(val)) {
      return `[ ${val.map((v) => this.serialize(v)).join(' ')} ]`;
    }
    if (typeof val === 'object') {
      // Check if reference
      if ((val as any).type === 'reference') {
        const ref = val as any;
        return `${ref.objNum} ${ref.genNum} R`;
      }
      
      // Dictionary serialization
      const dict = val as Record<string, PDFValue>;
      let out = '<<\n';
      for (const key of Object.keys(dict)) {
        out += `  /${key} ${this.serialize(dict[key])}\n`;
      }
      out += '>>';
      return out;
    }
    return '';
  }

  /**
   * Escapes PDF special string characters (parentheses and backslashes).
   */
  private static escapeString(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }
}

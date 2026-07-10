import { TWPage } from '../types';

/**
 * PageSerializer translates text blocks, image nodes, and graphic lines
 * into standard PDF drawing stream operators.
 */
export class PageSerializer {
  /**
   * Generates a binary content stream containing text layout matrices, CTM matrix scales,
   * color spaces, and vector operators.
   */
  static generateContentsStream(page: TWPage): Uint8Array {
    let content = '';

    // Sort objects by zIndex to draw bottom-to-top
    const sorted = [...page.objects].sort((a, b) => a.zIndex - b.zIndex);

    sorted.forEach((obj) => {
      if (!obj.visible || obj.deleted) return;

      if (obj.type === 'text') {
        const txt = obj as any;
        content += 'BT\n';

        // Bind core standard font reference
        const fontRef = this.resolveFontRef(txt.fontName);
        content += `/${fontRef} ${txt.fontSize} Tf\n`;

        // Apply text fill colors (floating RGB 0.0 to 1.0)
        if (txt.fontColor) {
          const rgb = this.hexToRgb(txt.fontColor);
          content += `${rgb.r} ${rgb.g} ${rgb.b} rg\n`;
        }

        // Flipped Y coordinate layout mapping
        const pdfY = page.height - txt.y;

        if (txt.rotation !== 0) {
          const rad = -txt.rotation * Math.PI / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          content += `${cos.toFixed(4)} ${sin.toFixed(4)} ${(-sin).toFixed(4)} ${cos.toFixed(4)} ${txt.x.toFixed(2)} ${pdfY.toFixed(2)} Tm\n`;
        } else {
          content += `${txt.x.toFixed(2)} ${pdfY.toFixed(2)} Td\n`;
        }

        // tj text literal string
        const escaped = this.escapeString(txt.text);
        content += `(${escaped}) Tj\n`;
        content += 'ET\n';
      } 
      else if (obj.type === 'path') {
        const pathObj = obj as any;
        if (pathObj.pathData) {
          content += 'q\n';

          // Configure stroke configurations
          if (pathObj.strokeColor && pathObj.strokeWidth > 0) {
            const rgb = this.hexToRgb(pathObj.strokeColor);
            content += `${rgb.r} ${rgb.g} ${rgb.b} RG\n`;
            content += `${pathObj.strokeWidth} w\n`;
          }
          // Configure fill configurations
          if (pathObj.fillColor) {
            const rgb = this.hexToRgb(pathObj.fillColor);
            content += `${rgb.r} ${rgb.g} ${rgb.b} rg\n`;
          }

          // Convert SVG path to PDF operators
          const operators = this.convertSVGPathToPDF(pathObj.pathData, page.height);
          content += operators;

          const hasFill = pathObj.fillColor && pathObj.fillColor !== 'transparent';
          const hasStroke = pathObj.strokeColor && pathObj.strokeColor !== 'transparent' && pathObj.strokeWidth > 0;

          if (hasFill && hasStroke) {
            content += 'B\n';
          } else if (hasFill) {
            content += 'f\n';
          } else if (hasStroke) {
            content += 'S\n';
          }

          content += 'Q\n';
        }
      } 
      else if (obj.type === 'image') {
        const imgObj = obj as any;
        content += 'q\n';

        // Position image bounds
        const pdfY = page.height - imgObj.y - imgObj.height;
        const scaleX = imgObj.width;
        const scaleY = imgObj.height;

        content += `${scaleX.toFixed(2)} 0 0 ${scaleY.toFixed(2)} ${imgObj.x.toFixed(2)} ${pdfY.toFixed(2)} cm\n`;
        const imgRef = `Im${imgObj.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        content += `/${imgRef} Do\n`;
        content += 'Q\n';
      }
    });

    return new TextEncoder().encode(content);
  }

  /**
   * Resolves standard Helvetica core font reference keys.
   */
  private static resolveFontRef(fontName: string): string {
    const lower = fontName.toLowerCase();
    if (lower.includes('bold')) return 'F2';
    if (lower.includes('oblique') || lower.includes('italic')) return 'F3';
    return 'F1';
  }

  /**
   * Translates hex string colors into floating RGB coordinates (0.0 to 1.0).
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    if (!hex || hex === 'transparent') return { r: 0, g: 0, b: 0 };
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    const num = parseInt(clean, 16);
    return {
      r: parseFloat(((num >> 16) & 255 / 255).toFixed(3)),
      g: parseFloat(((num >> 8) & 255 / 255).toFixed(3)),
      b: parseFloat((num & 255 / 255).toFixed(3)),
    };
  }

  /**
   * Escapes PDF literal string boundaries.
   */
  private static escapeString(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  /**
   * Translates SVG path instructions to PDF coordinate operators, flipping Y.
   */
  private static convertSVGPathToPDF(pathData: string, pageHeight: number): string {
    let out = '';
    const tokens = pathData.match(/[A-Za-z]|[-+]?[0-9]*\.?[0-9]+/g) || [];
    let i = 0;

    while (i < tokens.length) {
      const tok = tokens[i];
      if (tok === 'M' || tok === 'm') {
        const x = parseFloat(tokens[i + 1]);
        const y = pageHeight - parseFloat(tokens[i + 2]);
        out += `${x.toFixed(2)} ${y.toFixed(2)} m\n`;
        i += 3;
      } else if (tok === 'L' || tok === 'l') {
        const x = parseFloat(tokens[i + 1]);
        const y = pageHeight - parseFloat(tokens[i + 2]);
        out += `${x.toFixed(2)} ${y.toFixed(2)} l\n`;
        i += 3;
      } else if (tok === 'C' || tok === 'c') {
        const x1 = parseFloat(tokens[i + 1]);
        const y1 = pageHeight - parseFloat(tokens[i + 2]);
        const x2 = parseFloat(tokens[i + 3]);
        const y2 = pageHeight - parseFloat(tokens[i + 4]);
        const x3 = parseFloat(tokens[i + 5]);
        const y3 = pageHeight - parseFloat(tokens[i + 6]);
        out += `${x1.toFixed(2)} ${y1.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)} ${x3.toFixed(2)} ${y3.toFixed(2)} c\n`;
        i += 7;
      } else if (tok === 'Z' || tok === 'z') {
        out += 'h\n';
        i += 1;
      } else {
        i += 1; // Skip unmapped coordinate details
      }
    }
    return out;
  }
}

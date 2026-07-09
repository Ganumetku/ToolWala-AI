import type { TWPathObject, TWVectorObject, TWPathState } from './types';

/**
 * VectorParser decodes vector graphic drawing and stroke operations from the
 * page operator list, generating viewport-bounded TWPathObject instances.
 */
export class VectorParser {
  /**
   * Compiles vector graphics paths and shapes from the page operators.
   */
  static async parsePageVectors(
    page: any,
    pageNum: number,
    viewport: any,
    pdfjs: any
  ): Promise<{ pathObjects: TWPathObject[]; vectorObjects: TWVectorObject[] }> {
    const pathObjects: TWPathObject[] = [];
    const vectorObjects: TWVectorObject[] = [];

    try {
      const opList = await page.getOperatorList();
      const { fnArray, argsArray } = opList;

      const OPS = pdfjs.OPS;
      if (!OPS) {
        throw new Error('PDF.js OPS is not available.');
      }

      let ctm = [1, 0, 0, 1, 0, 0];
      const gssStack: number[][] = [];

      // Current drawing states
      let strokeColor = '#000000';
      let fillColor = 'transparent';
      let strokeWidth = 1.0;

      for (let i = 0; i < fnArray.length; i++) {
        const fn = fnArray[i];
        const args = argsArray[i];

        switch (fn) {
          case OPS.save:
            gssStack.push([...ctm]);
            break;

          case OPS.restore:
            if (gssStack.length > 0) {
              ctm = gssStack.pop()!;
            }
            break;

          case OPS.transform:
            ctm = this.multiplyMatrices(ctm, args);
            break;

          case OPS.setLineWidth:
            const rawWidth = args[0] || 1.0;
            const scale = Math.sqrt((ctm[0] * ctm[0] + ctm[1] * ctm[1] + ctm[2] * ctm[2] + ctm[3] * ctm[3]) / 2);
            strokeWidth = rawWidth * scale;
            break;

          case OPS.setStrokeRGBColor:
            strokeColor = this.parseColor(args);
            break;

          case OPS.setFillRGBColor:
            fillColor = this.parseColor(args);
            break;

          case OPS.constructPath:
            const drawOp = args[0] as number;
            const pathArray = args[1]?.[0] as Float32Array | number[] | undefined;
            
            if (pathArray) {
              const { pathData, bounds } = this.compileSvgPath(pathArray, ctm, viewport);
              if (pathData) {
                let currentStroke = strokeColor;
                let currentFill = fillColor;
                let currentWidth = strokeWidth;

                if (drawOp === OPS.stroke || drawOp === OPS.closeStroke) {
                  currentFill = 'transparent';
                } else if (drawOp === OPS.fill || drawOp === OPS.eoFill) {
                  currentStroke = 'transparent';
                  currentWidth = 0;
                }

                const pathState: TWPathState = {
                  pathData,
                  strokeColor: currentStroke,
                  fillColor: currentFill,
                  strokeWidth: currentWidth,
                  transformMatrix: [...ctm],
                  x: bounds.x,
                  y: bounds.y,
                  width: bounds.width,
                  height: bounds.height,
                  rotation: 0,
                  opacity: 1.0,
                };

                pathObjects.push({
                  id: `tw_path_${pageNum}_op${drawOp}_${Date.now()}_${i}`,
                  page: pageNum,
                  type: 'path',
                  zIndex: 0, // Assigned by PageParser
                  
                  x: bounds.x,
                  y: bounds.y,
                  width: bounds.width,
                  height: bounds.height,
                  rotation: 0,
                  opacity: 1.0,
                  
                  visible: true,
                  locked: false,
                  deleted: false,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  
                  pageIndex: pageNum - 1,
                  operatorIndex: i,
                  transformationMatrix: [...ctm],
                  isDirty: false,
                  
                  pathData,
                  strokeColor: currentStroke,
                  fillColor: currentFill,
                  strokeWidth: currentWidth,
                  
                  originalState: { ...pathState },
                  currentState: { ...pathState },
                });
              }
            }
            break;
        }
      }
    } catch (e) {
      console.error(`VectorParser failed on page ${pageNum}`, e);
    }

    return { pathObjects, vectorObjects };
  }

  /**
   * Translates path arrays into SVG and tracks coordinate bounds.
   */
  private static compileSvgPath(
    pathArray: Float32Array | number[],
    ctm: number[],
    viewport: any
  ): { pathData: string; bounds: { x: number; y: number; width: number; height: number } } {
    if (!pathArray || pathArray.length === 0) {
      return { pathData: '', bounds: { x: 0, y: 0, width: 0, height: 0 } };
    }
    
    let pathStr = '';
    let coordIdx = 0;
    const len = pathArray.length;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const updateBounds = (vx: number, vy: number) => {
      if (vx < minX) minX = vx;
      if (vy < minY) minY = vy;
      if (vx > maxX) maxX = vx;
      if (vy > maxY) maxY = vy;
    };

    while (coordIdx < len) {
      const op = pathArray[coordIdx++];
      switch (op) {
        case 0: { // MoveTo
          const px = pathArray[coordIdx++];
          const py = pathArray[coordIdx++];
          const [vx, vy] = this.transformPoint(px, py, ctm, viewport);
          pathStr += ` M ${vx.toFixed(2)} ${vy.toFixed(2)}`;
          updateBounds(vx, vy);
          break;
        }
        case 1: { // LineTo
          const px = pathArray[coordIdx++];
          const py = pathArray[coordIdx++];
          const [vx, vy] = this.transformPoint(px, py, ctm, viewport);
          pathStr += ` L ${vx.toFixed(2)} ${vy.toFixed(2)}`;
          updateBounds(vx, vy);
          break;
        }
        case 2: { // CurveTo
          const cp1x = pathArray[coordIdx++];
          const cp1y = pathArray[coordIdx++];
          const cp2x = pathArray[coordIdx++];
          const cp2y = pathArray[coordIdx++];
          const px = pathArray[coordIdx++];
          const py = pathArray[coordIdx++];
          const [vcp1x, vcp1y] = this.transformPoint(cp1x, cp1y, ctm, viewport);
          const [vcp2x, vcp2y] = this.transformPoint(cp2x, cp2y, ctm, viewport);
          const [vx, vy] = this.transformPoint(px, py, ctm, viewport);
          pathStr += ` C ${vcp1x.toFixed(2)} ${vcp1y.toFixed(2)}, ${vcp2x.toFixed(2)} ${vcp2y.toFixed(2)}, ${vx.toFixed(2)} ${vy.toFixed(2)}`;
          updateBounds(vcp1x, vcp1y);
          updateBounds(vcp2x, vcp2y);
          updateBounds(vx, vy);
          break;
        }
        case 3: { // CurveTo2
          const cp2x = pathArray[coordIdx++];
          const cp2y = pathArray[coordIdx++];
          const px = pathArray[coordIdx++];
          const py = pathArray[coordIdx++];
          const [vcp2x, vcp2y] = this.transformPoint(cp2x, cp2y, ctm, viewport);
          const [vx, vy] = this.transformPoint(px, py, ctm, viewport);
          pathStr += ` S ${vcp2x.toFixed(2)} ${vcp2y.toFixed(2)}, ${vx.toFixed(2)} ${vy.toFixed(2)}`;
          updateBounds(vcp2x, vcp2y);
          updateBounds(vx, vy);
          break;
        }
        case 4: { // ClosePath
          pathStr += ' Z';
          break;
        }
        case 5: { // Rect
          const rx = pathArray[coordIdx++];
          const ry = pathArray[coordIdx++];
          const rw = pathArray[coordIdx++];
          const rh = pathArray[coordIdx++];
          
          const [v1x, v1y] = this.transformPoint(rx, ry, ctm, viewport);
          const [v2x, v2y] = this.transformPoint(rx + rw, ry, ctm, viewport);
          const [v3x, v3y] = this.transformPoint(rx + rw, ry + rh, ctm, viewport);
          const [v4x, v4y] = this.transformPoint(rx, ry + rh, ctm, viewport);

          pathStr += ` M ${v1x.toFixed(2)} ${v1y.toFixed(2)}`;
          pathStr += ` L ${v2x.toFixed(2)} ${v2y.toFixed(2)}`;
          pathStr += ` L ${v3x.toFixed(2)} ${v3y.toFixed(2)}`;
          pathStr += ` L ${v4x.toFixed(2)} ${v4y.toFixed(2)}`;
          pathStr += ' Z';

          updateBounds(v1x, v1y);
          updateBounds(v2x, v2y);
          updateBounds(v3x, v3y);
          updateBounds(v4x, v4y);
          break;
        }
        case 6: { // CurveTo3
          const cp1x = pathArray[coordIdx++];
          const cp1y = pathArray[coordIdx++];
          const px = pathArray[coordIdx++];
          const py = pathArray[coordIdx++];
          const [vcp1x, vcp1y] = this.transformPoint(cp1x, cp1y, ctm, viewport);
          const [vx, vy] = this.transformPoint(px, py, ctm, viewport);
          pathStr += ` Q ${vcp1x.toFixed(2)} ${vcp1y.toFixed(2)}, ${vx.toFixed(2)} ${vy.toFixed(2)}`;
          updateBounds(vcp1x, vcp1y);
          updateBounds(vx, vy);
          break;
        }
      }
    }

    const x = minX === Infinity ? 0 : minX;
    const y = minY === Infinity ? 0 : minY;
    const width = maxX === -Infinity ? 0 : (maxX - minX);
    const height = maxY === -Infinity ? 0 : (maxY - minY);

    return { pathData: pathStr.trim(), bounds: { x, y, width, height } };
  }

  private static transformPoint(
    x: number,
    y: number,
    ctm: number[],
    viewport: any
  ): [number, number] {
    const [a, b, c, d, e, f] = ctm;
    const tx = a * x + c * y + e;
    const ty = b * x + d * y + f;
    return viewport.convertToViewportPoint(tx, ty) as [number, number];
  }

  private static multiplyMatrices(m1: number[], m2: number[]): number[] {
    const [a1, b1, c1, d1, e1, f1] = m1;
    const [a2, b2, c2, d2, e2, f2] = m2;
    return [
      a1 * a2 + c1 * b2,
      b1 * a2 + d1 * b2,
      a1 * c2 + c1 * d2,
      b1 * c2 + d1 * d2,
      a1 * e2 + c1 * f2 + e1,
      b1 * e2 + d1 * f2 + f1,
    ];
  }

  private static parseColor(args: any[]): string {
    if (!args || args.length === 0) return '#000000';
    if (typeof args[0] === 'string') {
      return args[0];
    }
    const r = args[0] !== undefined ? args[0] : 0;
    const g = args[1] !== undefined ? args[1] : 0;
    const b = args[2] !== undefined ? args[2] : 0;
    return this.rgbToHex(r, g, b);
  }

  private static rgbToHex(r: number, g: number, b: number): string {
    const toHex = (val: number) => {
      const byte = Math.max(0, Math.min(255, val > 1.0 ? Math.round(val) : Math.round(val * 255)));
      const hex = byte.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

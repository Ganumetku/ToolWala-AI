import type { TWObject } from '../types';
import { Geometry } from '../Geometry';

/**
 * HitTest provides pointer collision checking for visual PDF objects,
 * supporting rotated bounding rectangles and pixel-precision SVG paths.
 */
export class HitTest {
  /**
   * Determines if a screen coordinate (px, py) lies inside the visual boundaries of an object.
   * 
   * @param obj Target TWObject
   * @param px Cursor X coordinate
   * @param py Cursor Y coordinate
   * @param ctx Optional CanvasRenderingContext2D context for path-aware vector testing
   * @returns true if the coordinate collides with the object
   */
  static hitTest(
    obj: TWObject,
    px: number,
    py: number,
    ctx?: CanvasRenderingContext2D
  ): boolean {
    if (!obj.visible || obj.deleted) return false;

    // Bounding box center coordinates
    const cx = obj.x + obj.width / 2;
    const cy = obj.y + obj.height / 2;

    // Rotate point back by negative object angle around the center to map to standard coordinates
    const thetaRad = -obj.rotation * Math.PI / 180;
    const [rx, ry] = Geometry.rotatePoint(px, py, cx, cy, thetaRad);

    // Standard bounding box intersection check
    const withinBounds =
      rx >= obj.x &&
      rx <= obj.x + obj.width &&
      ry >= obj.y &&
      ry <= obj.y + obj.height;

    if (!withinBounds) return false;

    // High-precision vector SVG path collision test
    if (obj.type === 'path' && ctx && typeof Path2D !== 'undefined') {
      const pathObj = obj as any;
      if (pathObj.pathData) {
        const path2d = new Path2D(pathObj.pathData);
        return ctx.isPointInPath(path2d, px, py);
      }
    }

    return true;
  }
}

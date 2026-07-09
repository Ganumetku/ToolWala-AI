export interface TWRectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TWPoint {
  x: number;
  y: number;
}

/**
 * Geometry.ts provides coordinates calculations for rotation, bounding box containment,
 * intersections, point distances, and grid-snapping actions.
 */
export class Geometry {
  /**
   * Rotates a point around a center coordinate.
   */
  static rotatePoint(
    px: number,
    py: number,
    cx: number,
    cy: number,
    angleInRadians: number
  ): [number, number] {
    const cos = Math.cos(angleInRadians);
    const sin = Math.sin(angleInRadians);
    const dx = px - cx;
    const dy = py - cy;
    return [
      cx + dx * cos - dy * sin,
      cy + dx * sin + dy * cos,
    ];
  }

  /**
   * Scales a bounding box width/height and maintains layout ratios.
   */
  static scaleBounds(
    bounds: TWRectBounds,
    scaleX: number,
    scaleY: number
  ): TWRectBounds {
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width * scaleX,
      height: bounds.height * scaleY,
    };
  }

  /**
   * Checks if two rectangles intersect.
   */
  static intersects(r1: TWRectBounds, r2: TWRectBounds): boolean {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  }

  /**
   * Checks if a rectangle bounds contain a point.
   */
  static contains(r: TWRectBounds, px: number, py: number): boolean {
    return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
  }

  /**
   * Computes Cartesian distance between two points.
   */
  static distance(p1: TWPoint, p2: TWPoint): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  /**
   * Snaps a coordinate scalar value to a grid size within a tolerance.
   */
  static snap(value: number, gridSize: number, tolerance: number): number {
    const remainder = value % gridSize;
    const sign = Math.sign(remainder);
    const absRemainder = Math.abs(remainder);

    if (absRemainder <= tolerance) {
      return value - remainder;
    }
    if (gridSize - absRemainder <= tolerance) {
      return value + (gridSize * sign - remainder);
    }
    return value;
  }
}

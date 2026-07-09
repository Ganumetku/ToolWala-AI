import type { SceneBounds } from './SceneNode';

/**
 * DirtyRegionManager collects and aggregates coordinate boxes of altered nodes
 * so that final repaint frames only draw within clipped rectangles.
 */
export class DirtyRegionManager {
  private dirtyRegions: SceneBounds[] = [];

  /**
   * Registers a dirty layout area.
   */
  addDirtyRegion(bounds: SceneBounds): void {
    if (bounds.width <= 0 || bounds.height <= 0) return;
    this.dirtyRegions.push({ ...bounds });
  }

  /**
   * Resets the collected dirty regions list.
   */
  clear(): void {
    this.dirtyRegions = [];
  }

  /**
   * Returns all active dirty regions.
   */
  getDirtyRegions(): SceneBounds[] {
    return this.dirtyRegions;
  }

  /**
   * Combines all registered dirty region rectangles into a single union bounding box.
   * Returns null if no dirty regions exist.
   */
  getCombinedBounds(): SceneBounds | null {
    if (this.dirtyRegions.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const r of this.dirtyRegions) {
      if (r.x < minX) minX = r.x;
      if (r.y < minY) minY = r.y;
      if (r.x + r.width > maxX) maxX = r.x + r.width;
      if (r.y + r.height > maxY) maxY = r.y + r.height;
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}

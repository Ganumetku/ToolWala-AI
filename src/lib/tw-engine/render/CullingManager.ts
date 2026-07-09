import type { SceneNode, SceneBounds } from './SceneNode';

/**
 * CullingManager filters out SceneNodes that are positioned outside the active camera
 * viewport boundaries to save layout compilation and rendering costs.
 */
export class CullingManager {
  /**
   * Determines if a SceneNode should be culled (bypassed from rendering).
   * 
   * @param node The SceneNode to check
   * @param viewportBounds Bounding box representing viewport on-screen limits
   * @returns true if the node is outside screen visibility and should be culled
   */
  static shouldCull(node: SceneNode, viewportBounds: SceneBounds): boolean {
    if (!node.visible) return true;

    // Resolve node world boundary coordinates
    const worldBounds = node.getWorldBounds();

    // Intersection test
    const intersects = !(
      worldBounds.x + worldBounds.width < viewportBounds.x ||
      worldBounds.x > viewportBounds.x + viewportBounds.width ||
      worldBounds.y + worldBounds.height < viewportBounds.y ||
      worldBounds.y > viewportBounds.y + viewportBounds.height
    );

    return !intersects;
  }
}

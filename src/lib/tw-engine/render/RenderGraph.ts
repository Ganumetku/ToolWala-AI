import { SceneNode } from './SceneNode';
import type { Camera } from './Camera';
import type { Viewport } from './Viewport';
import { CullingManager } from './CullingManager';

/**
 * RenderGraph compiles a flat, sorted Render Queue by traversing
 * the hierarchical Scene graph tree and applying culling/layer rules.
 */
export class RenderGraph {
  /**
   * Traverses the Scene Tree starting from the root node, computes world matrices,
   * culls hidden elements, and returns a sorted queue of nodes ready for painting.
   */
  static compileRenderQueue(
    rootNode: SceneNode,
    camera: Camera,
    viewport: Viewport
  ): SceneNode[] {
    // 1. Compile world transformation matrices down the hierarchy tree
    rootNode.updateMatrices();

    const renderQueue: SceneNode[] = [];
    const viewportBounds = {
      x: viewport.scrollX,
      y: viewport.scrollY,
      width: viewport.width,
      height: viewport.height,
    };

    // 2. Gather renderable nodes recursively
    this.traverse(rootNode, viewportBounds, renderQueue);

    // 3. Sort render queue: Page -> Layer -> local zIndex
    renderQueue.sort((a, b) => {
      if (a.page !== b.page) {
        return a.page - b.page;
      }

      const layerZA = this.resolveLayerZIndex(a);
      const layerZB = this.resolveLayerZIndex(b);
      if (layerZA !== layerZB) {
        return layerZA - layerZB;
      }

      return a.zIndex - b.zIndex;
    });

    return renderQueue;
  }

  /**
   * Traverses child nodes recursively and applies viewport culling checks.
   */
  private static traverse(
    node: SceneNode,
    viewportBounds: { x: number; y: number; width: number; height: number },
    queue: SceneNode[]
  ): void {
    if (!node.visible) return;

    // Check culling only for leaf nodes carrying objects
    if (node.objectId) {
      if (CullingManager.shouldCull(node, viewportBounds)) {
        return; // Skip rendering
      }
      queue.push(node);
    }

    // Traverse children nodes
    node.children.forEach((child) => {
      this.traverse(child, viewportBounds, queue);
    });
  }

  /**
   * Walks up the parent chain to find the container layer zIndex priority.
   */
  private static resolveLayerZIndex(node: SceneNode): number {
    let p = node.parent;
    while (p) {
      if (p.id.includes('_layer_')) {
        return p.zIndex;
      }
      p = p.parent;
    }
    return 0;
  }
}

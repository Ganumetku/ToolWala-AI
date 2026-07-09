import { SceneNode } from './SceneNode';
import { Camera } from './Camera';
import { Viewport } from './Viewport';
import { LayerManager } from './LayerManager';
import { Matrix } from '../Matrix';
import type { TWDocument, TWObject } from '../types';

/**
 * Scene coordinates the root SceneNode, page layout collections, camera transforms,
 * and viewport bounds.
 */
export class Scene {
  rootNode: SceneNode;
  camera: Camera;
  viewport: Viewport;

  private pageNodes: Map<number, SceneNode> = new Map();
  private pageLayers: Map<
    number,
    {
      pdf: SceneNode;
      annotation: SceneNode;
      selection: SceneNode;
      guide: SceneNode;
      overlay: SceneNode;
    }
  > = new Map();

  constructor() {
    this.rootNode = new SceneNode('scene_root', 0);
    this.camera = new Camera();
    this.viewport = new Viewport();
  }

  /**
   * Initializes page hierarchies and default layers from a TWDocument model.
   */
  initializeFromDocument(document: TWDocument): void {
    this.rootNode = new SceneNode('scene_root', 0);
    this.pageNodes.clear();
    this.pageLayers.clear();

    const viewportPages: Array<{ pageNumber: number; x: number; y: number; width: number; height: number }> = [];
    let currentYOffset = 0; // Vertical scroll stack simulation

    document.pages.forEach((page) => {
      // 1. Create container node for the Page
      const pageNode = new SceneNode(`page_${page.pageNumber}`, page.pageNumber);
      
      // Position the page in a vertical scroll layout
      pageNode.localMatrix = [1, 0, 0, 1, 0, currentYOffset];
      pageNode.bounds = { x: 0, y: 0, width: page.width, height: page.height };
      
      this.rootNode.addChild(pageNode);
      this.pageNodes.set(page.pageNumber, pageNode);

      // 2. Generate and bind default container layers
      const layers = LayerManager.createDefaultLayers(page.pageNumber);
      pageNode.addChild(layers.pdf);
      pageNode.addChild(layers.annotation);
      pageNode.addChild(layers.selection);
      pageNode.addChild(layers.guide);
      pageNode.addChild(layers.overlay);

      this.pageLayers.set(page.pageNumber, layers);

      viewportPages.push({
        pageNumber: page.pageNumber,
        x: 0,
        y: currentYOffset,
        width: page.width,
        height: page.height,
      });

      // 3. Convert TWObjects to SceneNodes and bind to appropriate layers
      page.objects.forEach((obj) => {
        this.registerObjectNode(obj, layers);
      });

      currentYOffset += page.height + 20; // 20px gap between pages
    });

    // Refresh viewport visible pages catalog
    this.viewport.updateVisiblePages(viewportPages);
  }

  /**
   * Registers a TWObject as a SceneNode under the page's layers.
   */
  private registerObjectNode(
    obj: TWObject,
    layers: { pdf: SceneNode; annotation: SceneNode; selection: SceneNode }
  ): void {
    const node = new SceneNode(obj.id, obj.page);
    node.objectId = obj.id;
    node.bounds = { x: 0, y: 0, width: obj.width, height: obj.height };

    // Compile local matrix based on viewport layout coordinates
    let m = [1, 0, 0, 1, obj.x, obj.y];
    if (obj.rotation !== 0) {
      const cx = obj.width / 2;
      const cy = obj.height / 2;
      m = Matrix.translate(m, cx, cy);
      m = Matrix.rotate(m, obj.rotation * Math.PI / 180);
      m = Matrix.translate(m, -cx, -cy);
    }
    node.localMatrix = m;
    
    node.zIndex = obj.zIndex;
    node.visible = obj.visible;
    node.opacity = obj.opacity;

    // Attach to annotation layer if interactive widget/link, else pdf graphic layer
    if (obj.type === 'annotation') {
      layers.annotation.addChild(node);
    } else {
      layers.pdf.addChild(node);
    }
  }

  /**
   * Retrieves page layer nodes by page number.
   */
  getLayersForPage(pageNumber: number) {
    return this.pageLayers.get(pageNumber);
  }

  /**
   * Retrieves page container node by page number.
   */
  getPageNode(pageNumber: number): SceneNode | undefined {
    return this.pageNodes.get(pageNumber);
  }
}

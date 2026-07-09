import { Matrix } from '../Matrix';

export interface SceneBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * SceneNode represents a hierarchical node in the render Scene tree,
 * mapping parent-child relationships and world coordinate transformations.
 */
export class SceneNode {
  id: string;
  parent: SceneNode | null = null;
  children: SceneNode[] = [];
  objectId?: string; // Links to registered TWObject ID
  page: number; // 1-based page index

  localMatrix: number[] = [1, 0, 0, 1, 0, 0];
  worldMatrix: number[] = [1, 0, 0, 1, 0, 0];
  bounds: SceneBounds = { x: 0, y: 0, width: 0, height: 0 };

  visible = true;
  opacity = 1.0;
  zIndex = 0;
  dirty = false;
  needsLayout = false;
  needsPaint = false;

  constructor(id: string, page = 0) {
    this.id = id;
    this.page = page;
  }

  /**
   * Appends a child SceneNode.
   */
  addChild(node: SceneNode): void {
    if (node.parent) {
      node.parent.removeChild(node);
    }
    node.parent = this;
    this.children.push(node);
    node.updateMatrices();
  }

  /**
   * Removes a child SceneNode.
   */
  removeChild(node: SceneNode): void {
    const idx = this.children.indexOf(node);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      node.parent = null;
    }
  }

  /**
   * Recalculates the world transformation matrix by multiplying parent transforms.
   */
  updateMatrices(): void {
    if (this.parent) {
      this.worldMatrix = Matrix.multiply(this.parent.worldMatrix, this.localMatrix);
    } else {
      this.worldMatrix = [...this.localMatrix];
    }
    // Propagate updates down the hierarchy tree
    this.children.forEach((child) => child.updateMatrices());
  }

  /**
   * Calculates the axis-aligned bounding box (AABB) in world space coordinates.
   */
  getWorldBounds(): SceneBounds {
    const corners = [
      [this.bounds.x, this.bounds.y],
      [this.bounds.x + this.bounds.width, this.bounds.y],
      [this.bounds.x + this.bounds.width, this.bounds.y + this.bounds.height],
      [this.bounds.x, this.bounds.y + this.bounds.height],
    ];

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const [cx, cy] of corners) {
      const [wx, wy] = Matrix.transformPoint(this.worldMatrix, cx, cy);
      if (wx < minX) minX = wx;
      if (wy < minY) minY = wy;
      if (wx > maxX) maxX = wx;
      if (wy > maxY) maxY = wy;
    }

    return {
      x: minX === Infinity ? 0 : minX,
      y: minY === Infinity ? 0 : minY,
      width: maxX === -Infinity ? 0 : (maxX - minX),
      height: maxY === -Infinity ? 0 : (maxY - minY),
    };
  }
}

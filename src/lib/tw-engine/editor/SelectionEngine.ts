import type { TWObject } from '../types';
import { ObjectRegistry } from '../ObjectRegistry';
import { HitTest } from './HitTest';

/**
 * SelectionEngine manages visual selection states, active page scopes,
 * and Top-to-Bottom click hit-testing.
 */
export class SelectionEngine {
  private selectedObjectId: string | null = null;
  private selectedPageNumber: number | null = null;

  /**
   * Selects an object by ID on a specific page.
   */
  select(id: string, pageNumber: number): void {
    this.selectedObjectId = id;
    this.selectedPageNumber = pageNumber;
  }

  /**
   * Clears selection.
   */
  deselect(): void {
    this.selectedObjectId = null;
    this.selectedPageNumber = null;
  }

  /**
   * Retrieves the currently selected object ID.
   */
  getSelectedObjectId(): string | null {
    return this.selectedObjectId;
  }

  /**
   * Retrieves the page number that holds the active selection.
   */
  getSelectedPageNumber(): number | null {
    return this.selectedPageNumber;
  }

  /**
   * Fetches the selected TWObject instance from the ObjectRegistry.
   */
  getSelectedObject(): TWObject | undefined {
    if (!this.selectedObjectId) return undefined;
    return ObjectRegistry.getInstance().getObject(this.selectedObjectId);
  }

  /**
   * Resolves click inputs from pointer positions, searching from top to bottom (reverse zIndex).
   */
  handlePointerDown(
    px: number,
    py: number,
    pageNumber: number,
    ctx?: CanvasRenderingContext2D
  ): TWObject | null {
    const registry = ObjectRegistry.getInstance();
    const pageObjects = registry.getObjectsByPage(pageNumber);

    // Iterate in reverse drawing order (topmost objects first)
    for (let i = pageObjects.length - 1; i >= 0; i--) {
      const obj = pageObjects[i];
      if (HitTest.hitTest(obj, px, py, ctx)) {
        this.select(obj.id, pageNumber);
        return obj;
      }
    }

    this.deselect();
    return null;
  }
}

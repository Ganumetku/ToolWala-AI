import { ObjectRegistry } from '../ObjectRegistry';
import { RenderAdapter } from './RenderAdapter';
import { ViewportSync } from './ViewportSync';

/**
 * CanvasSyncManager observes registry changes and schedules repaints on active
 * canvases via RenderAdapter without executing canvas serialization.
 */
export class CanvasSyncManager {
  private static instance: CanvasSyncManager | null = null;
  private activeCanvases: Map<number, HTMLCanvasElement> = new Map();

  private constructor() {
    // Register change listener on ObjectRegistry singleton
    ObjectRegistry.getInstance().addListener(this.handleRegistryUpdate);
  }

  static getInstance(): CanvasSyncManager {
    if (!this.instance) {
      this.instance = new CanvasSyncManager();
    }
    return this.instance;
  }

  /**
   * Registers a canvas element for repaint synchronization.
   */
  registerCanvas(pageNum: number, canvasElement: HTMLCanvasElement): void {
    this.activeCanvases.set(pageNum, canvasElement);
    this.triggerRepaint(pageNum);
  }

  /**
   * Unregisters a canvas element from updates.
   */
  unregisterCanvas(pageNum: number): void {
    this.activeCanvases.delete(pageNum);
  }

  /**
   * Triggers a repaint on the registered canvas element for a page.
   */
  triggerRepaint(pageNum: number): void {
    const canvas = this.activeCanvases.get(pageNum);
    if (canvas) {
      const zoom = ViewportSync.getInstance().getZoom();
      RenderAdapter.render(pageNum, canvas, zoom);
    }
  }

  /**
   * Callback received upon registry updates. Resolves page index and repaints.
   */
  private handleRegistryUpdate = (id: string): void => {
    const registry = ObjectRegistry.getInstance();
    const obj = registry.getObject(id);
    if (obj) {
      this.triggerRepaint(obj.page);
    }
  };
}

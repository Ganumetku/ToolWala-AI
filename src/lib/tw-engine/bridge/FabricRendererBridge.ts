import { pageToFabricState } from '../../twpdf/editing/renderer/domToFabric';
import { CANVAS_JSON_PROPS } from '@/types/pdf';

/**
 * Manages loading, rendering, and exporting Fabric canvas state representations.
 */
export class FabricRendererBridge {
  /**
   * Translates native registry objects for a page and renders them directly.
   */
  static render(page: { objects: any[] }, canvas: any, zoom: number): Promise<void> {
    if (!canvas || typeof canvas.loadFromJSON !== 'function') {
      return Promise.resolve();
    }
    const state = pageToFabricState(page, zoom);
    return new Promise<void>((resolve) => {
      canvas.loadFromJSON(state, () => {
        if (typeof canvas.setZoom === 'function') canvas.setZoom(zoom);
        if (typeof canvas.renderAll === 'function') canvas.renderAll();
        resolve();
      });
    });
  }

  /**
   * Loads a serialized JSON state into the canvas, setting zoom viewport transform.
   */
  static load(canvas: any, state: any, zoom: number, callback?: () => void): void {
    if (!canvas || typeof canvas.loadFromJSON !== 'function') {
      if (callback) callback();
      return;
    }
    const stateCopy = JSON.parse(JSON.stringify(state));
    stateCopy.viewportTransform = [zoom, 0, 0, zoom, 0, 0];
    canvas.loadFromJSON(stateCopy, () => {
      if (typeof canvas.setZoom === 'function') canvas.setZoom(zoom);
      if (typeof canvas.renderAll === 'function') canvas.renderAll();
      if (callback) callback();
    });
  }

  /**
   * Exports the active Fabric canvas state to a standard JSON object representation.
   */
  static exportLegacyState(canvas: any, propertiesToInclude?: string[]): any {
    if (!canvas || typeof canvas.toJSON !== 'function') {
      return null;
    }
    const props = propertiesToInclude || [...CANVAS_JSON_PROPS];
    return canvas.toJSON(props);
  }
}

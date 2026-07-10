import { FabricAdapter } from './FabricAdapter';
import { FabricObjectMapper } from './FabricObjectMapper';
import { FabricSelectionBridge } from './FabricSelectionBridge';
import { FabricHistoryBridge } from './FabricHistoryBridge';
import { FabricRendererBridge } from './FabricRendererBridge';
import { FabricCapability } from './FabricCapability';
import { LegacyBridgeValidator } from './LegacyBridgeValidator';
import { TWObject } from '../types';

/**
 * The single public gateway coordinating all Fabric.js compatibility layers.
 * No business logic should access Fabric canvas elements directly; all commands
 * must navigate through this bridge interface.
 */
export class FabricBridge {
  /**
   * Spawns a dedicated FabricAdapter wrapping standard canvas instance commands.
   */
  static createAdapter(canvas: any): FabricAdapter {
    return new FabricAdapter(canvas);
  }

  /**
   * Delegates object translation schemas from native representations to Fabric.
   */
  static mapObject(obj: TWObject): Record<string, unknown> | null {
    return FabricObjectMapper.toFabricObject(obj);
  }

  /**
   * Directs native selected IDs to highlight on the canvas.
   */
  static selectObject(id: string | null, page: number, canvas: any): void {
    FabricSelectionBridge.syncNativeToFabric(id, canvas);
  }

  /**
   * Routes visual active selection modifications from the canvas to native SelectionEngine.
   */
  static handleSelectionChange(activeObj: any, page: number): void {
    FabricSelectionBridge.syncFabricToNative(activeObj, page);
  }

  /**
   * Invokes an Undo command in the MutationEngine.
   */
  static undo(page: number): void {
    FabricHistoryBridge.undo(page);
  }

  /**
   * Invokes a Redo command in the MutationEngine.
   */
  static redo(page: number): void {
    FabricHistoryBridge.redo(page);
  }

  /**
   * Renders the parsed page native representations to the canvas.
   */
  static async renderPage(page: { objects: any[] }, canvas: any, zoom: number): Promise<void> {
    return FabricRendererBridge.render(page, canvas, zoom);
  }

  /**
   * Restores a page state from a JSON cache or undo checkpoint.
   */
  static loadState(canvas: any, state: any, zoom: number, cb?: () => void): void {
    FabricRendererBridge.load(canvas, state, zoom, cb);
  }

  /**
   * Exports the canvas layer to a serialized JSON state.
   */
  static exportState(canvas: any, props?: string[]): any {
    return FabricRendererBridge.exportLegacyState(canvas, props);
  }

  /**
   * Inspects current supported layout rendering properties.
   */
  static checkCapabilities() {
    return {
      path: FabricCapability.supportsPath(),
      text: FabricCapability.supportsText(),
      selection: FabricCapability.supportsSelection(),
      annotations: FabricCapability.supportsAnnotations(),
    };
  }

  /**
   * Validates element mapping matching alignment to safeguard against object loss.
   */
  static validate(page: number, fabricObjects: any[]) {
    return LegacyBridgeValidator.validateRegistryToFabric(page, fabricObjects);
  }
}

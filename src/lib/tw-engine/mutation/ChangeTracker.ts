import { ObjectRegistry } from '../ObjectRegistry';
import { Mutation, MutationType } from './MutationTypes';

/**
 * ChangeTracker intercepts changes in the ObjectRegistry and formats
 * structured mutations automatically.
 */
export class ChangeTracker {
  private static instance: ChangeTracker | null = null;
  private isTracking = false;
  private onMutationCallback?: (mutation: Mutation) => void;

  private constructor() {}

  static getInstance(): ChangeTracker {
    if (!this.instance) {
      this.instance = new ChangeTracker();
    }
    return this.instance;
  }

  /**
   * Registers callback handler and registers registry change hooks.
   */
  startTracking(callback: (mutation: Mutation) => void): void {
    if (this.isTracking) return;
    this.onMutationCallback = callback;
    this.isTracking = true;
    ObjectRegistry.getInstance().addListener(this.handleRegistryUpdate);
  }

  /**
   * Unregisters tracking and clears registry change hooks.
   */
  stopTracking(): void {
    if (!this.isTracking) return;
    ObjectRegistry.getInstance().removeListener(this.handleRegistryUpdate);
    this.isTracking = false;
    this.onMutationCallback = undefined;
  }

  /**
   * Callback executed when registry entries are updated.
   */
  private handleRegistryUpdate = (id: string, before: any, after: any): void => {
    if (!this.onMutationCallback) return;

    const registry = ObjectRegistry.getInstance();
    const obj = registry.getObject(id);
    if (!obj) return;

    let type: MutationType | null = null;

    // Classify changes to construct specific MutationType values
    if (before.deleted !== after.deleted && after.deleted === true) {
      if (obj.type === 'image') type = 'ImageDelete';
      else if (obj.type === 'annotation') type = 'AnnotationDelete';
      else if (obj.type === 'text') type = 'TextDelete';
    } else if (before.visible !== after.visible) {
      type = 'VisibilityChange';
    } else if (before.text !== after.text) {
      type = 'TextReplace';
    } else if (before.x !== after.x || before.y !== after.y) {
      type = 'Move';
    } else if (before.width !== after.width || before.height !== after.height) {
      type = 'Resize';
    } else if (before.rotation !== after.rotation) {
      type = 'Rotate';
    } else if (before.opacity !== after.opacity) {
      type = 'OpacityChange';
    } else if (
      before.fontColor !== after.fontColor ||
      before.strokeColor !== after.strokeColor ||
      before.fillColor !== after.fillColor
    ) {
      type = 'ColorChange';
    } else if (before.fontName !== after.fontName || before.fontSize !== after.fontSize) {
      type = 'FontChange';
    }

    if (type) {
      const mutation: Mutation = {
        id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        objectId: id,
        page: obj.page,
        timestamp: Date.now(),
        beforeState: before,
        afterState: after,
      };
      this.onMutationCallback(mutation);
    }
  };
}

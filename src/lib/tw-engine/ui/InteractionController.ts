import { ObjectRegistry } from '../ObjectRegistry';
import { MutationDispatcher } from './MutationDispatcher';
import { EditorEvents } from './EditorEvents';

/**
 * InteractionController processes raw pointer inputs and translates them into
 * ObjectRegistry updates, dispatching corresponding mutations.
 */
export class InteractionController {
  /**
   * Translates object coordinate boundaries, committing changes to the registry
   * and dispatching a Move mutation.
   */
  static handleMove(id: string, page: number, newX: number, newY: number): void {
    const registry = ObjectRegistry.getInstance();
    const obj = registry.getObject(id);
    if (!obj) return;

    const before = { x: obj.x, y: obj.y };
    const after = { x: newX, y: newY };

    registry.updateObject(id, after);
    MutationDispatcher.dispatch('Move', id, page, before, after);
    EditorEvents.getInstance().dispatch('ObjectMoved', { id, page, ...after });
  }

  /**
   * Resizes object coordinate boundaries, committing changes to the registry
   * and dispatching a Resize mutation.
   */
  static handleResize(id: string, page: number, newWidth: number, newHeight: number): void {
    const registry = ObjectRegistry.getInstance();
    const obj = registry.getObject(id);
    if (!obj) return;

    const before = { width: obj.width, height: obj.height };
    const after = { width: newWidth, height: newHeight };

    registry.updateObject(id, after);
    MutationDispatcher.dispatch('Resize', id, page, before, after);
    EditorEvents.getInstance().dispatch('ObjectScaled', { id, page, ...after });
  }

  /**
   * Rotates object coordinates, committing changes to the registry
   * and dispatching a Rotate mutation.
   */
  static handleRotate(id: string, page: number, newRotation: number): void {
    const registry = ObjectRegistry.getInstance();
    const obj = registry.getObject(id);
    if (!obj) return;

    const before = { rotation: obj.rotation };
    const after = { rotation: newRotation };

    registry.updateObject(id, after);
    MutationDispatcher.dispatch('Rotate', id, page, before, after);
    EditorEvents.getInstance().dispatch('ObjectRotated', { id, page, rotation: newRotation });
  }
}

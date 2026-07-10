import { MutationEngine } from '../mutation/MutationEngine';
import { CanvasSyncManager } from '../ui/CanvasSyncManager';

/**
 * Compatibility history bridge redirecting legacy Undo/Redo commands
 * directly to the native MutationEngine instead of Fabric's history.
 */
export class FabricHistoryBridge {
  /**
   * Undoes the last mutation and schedules page canvas redraw.
   */
  static undo(page: number): void {
    const undone = MutationEngine.getInstance().undo();
    if (undone) {
      CanvasSyncManager.getInstance().triggerRepaint(page);
    }
  }

  /**
   * Redoes the last undone mutation and schedules page canvas redraw.
   */
  static redo(page: number): void {
    const redone = MutationEngine.getInstance().redo();
    if (redone) {
      CanvasSyncManager.getInstance().triggerRepaint(page);
    }
  }
}

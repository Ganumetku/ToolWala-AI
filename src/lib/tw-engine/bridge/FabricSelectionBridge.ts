import { SelectionEngine } from '../editor/SelectionEngine';
import { SelectionSync } from '../ui/SelectionSync';

/**
 * Manages bidirectional synchronization of selected elements between the
 * Fabric canvas selection state and native SelectionEngine / SelectionSync.
 */
export class FabricSelectionBridge {
  /**
   * Syncs active native selection to the Fabric canvas.
   */
  static syncNativeToFabric(selectedId: string | null, canvas: any): void {
    if (!canvas || typeof canvas.getObjects !== 'function') {
      return;
    }

    if (!selectedId) {
      if (typeof canvas.discardActiveObject === 'function') {
        canvas.discardActiveObject();
      }
    } else {
      const activeObj = canvas.getObjects().find((o: any) => o.id === selectedId);
      if (activeObj && typeof canvas.setActiveObject === 'function') {
        canvas.setActiveObject(activeObj);
      }
    }

    if (typeof canvas.requestRenderAll === 'function') {
      canvas.requestRenderAll();
    }
  }

  /**
   * Syncs user-triggered Fabric canvas selection changes back to the native engines.
   */
  static syncFabricToNative(activeObj: any, page: number): void {
    const id = activeObj ? activeObj.id : null;

    // Update SelectionEngine
    const selectionEngine = SelectionEngine.getInstance();
    if (id) {
      selectionEngine.select(id, page);
    } else {
      selectionEngine.deselect();
    }

    // Update UI SelectionSync
    SelectionSync.getInstance().select(id, page);
  }
}

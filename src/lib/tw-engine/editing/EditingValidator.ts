import { EditModeManager } from './EditModeManager';
import { EditingState } from './EditingState';

/**
 * EditingValidator asserts layout transitions validity constraints.
 */
export class EditingValidator {
  /**
   * Asserts whether active object dragging is permitted in the current state.
   */
  static isDraggingPermitted(): boolean {
    const state = EditModeManager.getInstance().getState();
    return state !== EditingState.TEXT_EDITING && state !== EditingState.TEXT_SELECTING;
  }

  /**
   * Asserts whether textbox transform controls (anchors) should be painted on screen.
   */
  static shouldRenderTransformControls(): boolean {
    const state = EditModeManager.getInstance().getState();
    return state !== EditingState.TEXT_EDITING;
  }
}

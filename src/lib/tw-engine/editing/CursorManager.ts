import { EditModeManager } from './EditModeManager';
import { EditingSession } from './EditingSession';

/**
 * CursorManager manages the HTML Canvas mouse cursor style depending on tools and hover states.
 */
export class CursorManager {
  private static instance: CursorManager;

  static getInstance(): CursorManager {
    if (!CursorManager.instance) {
      CursorManager.instance = new CursorManager();
    }
    return CursorManager.instance;
  }

  resolveCursor(isHoveringText: boolean, isDragging: boolean): string {
    const manager = EditModeManager.getInstance();
    const session = EditingSession.getInstance();

    if (session.getActiveObjectId()) {
      return isHoveringText ? 'text' : 'default';
    }

    if (manager.getTool() === 'edit-text') {
      return isHoveringText ? 'text' : 'default';
    }

    if (manager.getTool() === 'pan') {
      return isDragging ? 'grabbing' : 'grab';
    }

    return 'default';
  }
}

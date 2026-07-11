import { EditingState } from './EditingState';

export type CanvasTool = 'select' | 'edit-text' | 'draw' | 'highlight-free' | 'pan';

/**
 * EditModeManager manages active user tools and coordinates mode transitions.
 */
export class EditModeManager {
  private static instance: EditModeManager;
  private currentTool: CanvasTool = 'select';
  private currentState: EditingState = EditingState.IDLE;

  static getInstance(): EditModeManager {
    if (!EditModeManager.instance) {
      EditModeManager.instance = new EditModeManager();
    }
    return EditModeManager.instance;
  }

  getTool(): CanvasTool {
    return this.currentTool;
  }

  setTool(tool: CanvasTool): void {
    this.currentTool = tool;
    if (tool === 'edit-text') {
      this.transitionTo(EditingState.IDLE);
    }
  }

  getState(): EditingState {
    return this.currentState;
  }

  transitionTo(state: EditingState): void {
    this.currentState = state;
  }
}

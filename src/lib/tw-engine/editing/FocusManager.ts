import { TextInputController } from './TextInputController';
import { EditingSession, EditingSessionListener } from './EditingSession';

/**
 * FocusManager routes active browser keyboard focus between the canvas and hidden textareas.
 */
export class FocusManager implements EditingSessionListener {
  private static instance: FocusManager;

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
      EditingSession.getInstance().addListener(FocusManager.instance);
    }
    return FocusManager.instance;
  }

  onSessionStart(objId: string, pageNum: number): void {
    if (EditingSession.getInstance().usesDomOverlay()) return;
    TextInputController.getInstance().mount();
    TextInputController.getInstance().focus();
  }

  onSessionUpdate(text: string, caretIndex: number, selStart: number, selEnd: number): void {
    if (EditingSession.getInstance().usesDomOverlay()) return;
    TextInputController.getInstance().updateSelectionState();
  }

  onSessionEnd(): void {
    if (EditingSession.getInstance().usesDomOverlay()) return;
    TextInputController.getInstance().blur();
    TextInputController.getInstance().unmount();
  }
}

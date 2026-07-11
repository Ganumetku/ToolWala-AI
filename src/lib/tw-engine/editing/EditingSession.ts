import { EditingState } from './EditingState';
import { EditModeManager } from './EditModeManager';

export interface EditingSessionListener {
  onSessionStart: (objId: string, pageNum: number) => void;
  onSessionUpdate: (text: string, caretIndex: number, selStart: number, selEnd: number) => void;
  onSessionEnd: () => void;
}

/**
 * EditingSession encapsulates the active text editing state machine.
 */
export class EditingSession {
  private static instance: EditingSession;

  private activeObjectId: string | null = null;
  private activePageNum = 1;
  private text = '';
  private caretIndex = 0;
  private selectionStart = 0;
  private selectionEnd = 0;
  private listeners: Set<EditingSessionListener> = new Set();

  static getInstance(): EditingSession {
    if (!EditingSession.instance) {
      EditingSession.instance = new EditingSession();
    }
    return EditingSession.instance;
  }

  addListener(l: EditingSessionListener): void {
    this.listeners.add(l);
  }

  removeListener(l: EditingSessionListener): void {
    this.listeners.delete(l);
  }

  startSession(objId: string, pageNum: number, initialText: string): void {
    this.activeObjectId = objId;
    this.activePageNum = pageNum;
    this.text = initialText;
    this.caretIndex = initialText.length;
    this.selectionStart = initialText.length;
    this.selectionEnd = initialText.length;

    EditModeManager.getInstance().transitionTo(EditingState.TEXT_EDITING);

    this.listeners.forEach((l) => l.onSessionStart(objId, pageNum));
    this.notifyUpdate();
  }

  endSession(): void {
    if (!this.activeObjectId) return;

    this.activeObjectId = null;
    this.text = '';
    this.caretIndex = 0;
    this.selectionStart = 0;
    this.selectionEnd = 0;

    EditModeManager.getInstance().transitionTo(EditingState.IDLE);

    this.listeners.forEach((l) => l.onSessionEnd());
  }

  getActiveObjectId(): string | null {
    return this.activeObjectId;
  }

  getActivePageNum(): number {
    return this.activePageNum;
  }

  getText(): string {
    return this.text;
  }

  setText(newText: string): void {
    this.text = newText;
    this.notifyUpdate();
  }

  getCaretIndex(): number {
    return this.caretIndex;
  }

  getSelectionStart(): number {
    return this.selectionStart;
  }

  getSelectionEnd(): number {
    return this.selectionEnd;
  }

  setSelection(start: number, end: number, caret: number): void {
    this.selectionStart = Math.max(0, Math.min(this.text.length, start));
    this.selectionEnd = Math.max(0, Math.min(this.text.length, end));
    this.caretIndex = Math.max(0, Math.min(this.text.length, caret));
    this.notifyUpdate();
  }

  private notifyUpdate(): void {
    this.listeners.forEach((l) =>
      l.onSessionUpdate(this.text, this.caretIndex, this.selectionStart, this.selectionEnd)
    );
  }
}

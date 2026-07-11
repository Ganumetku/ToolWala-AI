import { EditingSession } from './EditingSession';
import { ClipboardController } from './ClipboardController';

/**
 * KeyboardController processes command navigation, select all, and deletion shortcuts.
 */
export class KeyboardController {
  private static instance: KeyboardController;

  static getInstance(): KeyboardController {
    if (!KeyboardController.instance) {
      KeyboardController.instance = new KeyboardController();
    }
    return KeyboardController.instance;
  }

  handleKeyDown(e: KeyboardEvent): void {
    const session = EditingSession.getInstance();
    const text = session.getText();
    const caret = session.getCaretIndex();
    const start = session.getSelectionStart();
    const end = session.getSelectionEnd();

    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const metaPressed = isMac ? e.metaKey : e.ctrlKey;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextCaret = Math.max(0, caret - 1);
      const nextStart = e.shiftKey ? start : nextCaret;
      const nextEnd = e.shiftKey ? nextCaret : nextCaret;
      session.setSelection(nextStart, nextEnd, nextCaret);
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextCaret = Math.min(text.length, caret + 1);
      const nextStart = e.shiftKey ? start : nextCaret;
      const nextEnd = e.shiftKey ? nextCaret : nextCaret;
      session.setSelection(nextStart, nextEnd, nextCaret);
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      const nextStart = e.shiftKey ? start : 0;
      session.setSelection(nextStart, 0, 0);
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      const nextStart = e.shiftKey ? start : text.length;
      session.setSelection(nextStart, text.length, text.length);
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (start !== end) {
        const s = Math.min(start, end);
        const eIdx = Math.max(start, end);
        const nextText = text.slice(0, s) + text.slice(eIdx);
        session.setText(nextText);
        session.setSelection(s, s, s);
      } else if (caret > 0) {
        const nextText = text.slice(0, caret - 1) + text.slice(caret);
        session.setText(nextText);
        session.setSelection(caret - 1, caret - 1, caret - 1);
      }
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      if (start !== end) {
        const s = Math.min(start, end);
        const eIdx = Math.max(start, end);
        const nextText = text.slice(0, s) + text.slice(eIdx);
        session.setText(nextText);
        session.setSelection(s, s, s);
      } else if (caret < text.length) {
        const nextText = text.slice(0, caret) + text.slice(caret + 1);
        session.setText(nextText);
        session.setSelection(caret, caret, caret);
      }
      return;
    }

    // Ctrl+A select all
    if (metaPressed && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      session.setSelection(0, text.length, text.length);
      return;
    }

    // Clipboard shortcuts integration
    if (metaPressed && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      ClipboardController.getInstance().copy();
      return;
    }

    if (metaPressed && e.key.toLowerCase() === 'x') {
      e.preventDefault();
      ClipboardController.getInstance().cut();
      return;
    }

    if (metaPressed && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      ClipboardController.getInstance().paste();
      return;
    }

    // Escape exits session
    if (e.key === 'Escape') {
      e.preventDefault();
      session.endSession();
      return;
    }
  }
}

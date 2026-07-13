import { EditingSession } from './EditingSession';
import { ClipboardController } from './ClipboardController';

function findPreviousWordBoundary(text: string, index: number): number {
  if (index <= 0) return 0;
  let idx = index - 1;
  while (idx > 0 && !/[a-zA-Z0-9_]/.test(text[idx])) {
    idx--;
  }
  while (idx > 0 && /[a-zA-Z0-9_]/.test(text[idx - 1])) {
    idx--;
  }
  return idx;
}

function findNextWordBoundary(text: string, index: number): number {
  if (index >= text.length) return text.length;
  let idx = index;
  while (idx < text.length && !/[a-zA-Z0-9_]/.test(text[idx])) {
    idx++;
  }
  while (idx < text.length && /[a-zA-Z0-9_]/.test(text[idx])) {
    idx++;
  }
  return idx;
}

function getLineBoundaries(text: string, caretIndex: number): { start: number; end: number } {
  const lines = text.split('\n');
  let cumulative = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    const start = cumulative;
    const end = cumulative + lineText.length;
    const hasNextLine = i < lines.length - 1;
    const newlineLength = hasNextLine ? 1 : 0;
    if (caretIndex >= start && caretIndex <= end + newlineLength) {
      return { start, end };
    }
    cumulative = end + 1;
  }
  return { start: 0, end: text.length };
}

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
    const anchor = session.getSelectionAnchor();

    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const metaPressed = isMac ? e.metaKey : e.ctrlKey;
    const optPressed = isMac ? e.altKey : e.ctrlKey;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      let nextCaret = caret;
      if (optPressed || metaPressed) {
        nextCaret = findPreviousWordBoundary(text, caret);
      } else {
        if (!e.shiftKey && start !== end) {
          nextCaret = Math.min(start, end);
        } else {
          nextCaret = Math.max(0, caret - 1);
        }
      }

      if (e.shiftKey) {
        session.setSelection(anchor, nextCaret, nextCaret);
      } else {
        session.setSelection(nextCaret, nextCaret, nextCaret);
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      let nextCaret = caret;
      if (optPressed || metaPressed) {
        nextCaret = findNextWordBoundary(text, caret);
      } else {
        if (!e.shiftKey && start !== end) {
          nextCaret = Math.max(start, end);
        } else {
          nextCaret = Math.min(text.length, caret + 1);
        }
      }

      if (e.shiftKey) {
        session.setSelection(anchor, nextCaret, nextCaret);
      } else {
        session.setSelection(nextCaret, nextCaret, nextCaret);
      }
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      const bounds = getLineBoundaries(text, caret);
      const nextCaret = bounds.start;

      if (e.shiftKey) {
        session.setSelection(anchor, nextCaret, nextCaret);
      } else {
        session.setSelection(nextCaret, nextCaret, nextCaret);
      }
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      const bounds = getLineBoundaries(text, caret);
      const nextCaret = bounds.end;

      if (e.shiftKey) {
        session.setSelection(anchor, nextCaret, nextCaret);
      } else {
        session.setSelection(nextCaret, nextCaret, nextCaret);
      }
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

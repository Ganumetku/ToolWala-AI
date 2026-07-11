import { EditingSession } from './EditingSession';

/**
 * ClipboardController interfaces with standard browser navigator clipboard systems.
 */
export class ClipboardController {
  private static instance: ClipboardController;

  static getInstance(): ClipboardController {
    if (!ClipboardController.instance) {
      ClipboardController.instance = new ClipboardController();
    }
    return ClipboardController.instance;
  }

  copy(): void {
    const session = EditingSession.getInstance();
    const text = session.getText();
    const start = session.getSelectionStart();
    const end = session.getSelectionEnd();

    if (start === end) return;

    const slice = text.slice(Math.min(start, end), Math.max(start, end));
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(slice).catch((err) => {
        console.error('Clipboard copy failed:', err);
      });
    }
  }

  cut(): void {
    const session = EditingSession.getInstance();
    const text = session.getText();
    const start = session.getSelectionStart();
    const end = session.getSelectionEnd();

    if (start === end) return;

    this.copy();

    // Remove sliced text from editor value
    const s = Math.min(start, end);
    const e = Math.max(start, end);
    const nextText = text.slice(0, s) + text.slice(e);

    session.setText(nextText);
    session.setSelection(s, s, s);
  }

  paste(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .readText()
        .then((clipText) => {
          if (!clipText) return;

          const session = EditingSession.getInstance();
          const text = session.getText();
          const start = session.getSelectionStart();
          const end = session.getSelectionEnd();

          const s = Math.min(start, end);
          const e = Math.max(start, end);

          const nextText = text.slice(0, s) + clipText + text.slice(e);
          const nextIndex = s + clipText.length;

          session.setText(nextText);
          session.setSelection(nextIndex, nextIndex, nextIndex);
        })
        .catch((err) => {
          console.error('Clipboard paste failed:', err);
        });
    }
  }
}

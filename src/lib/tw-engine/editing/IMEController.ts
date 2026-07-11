import { EditingSession } from './EditingSession';

/**
 * IMEController manages composition states to support input methods (Hindi, Japanese, Chinese, etc.).
 */
export class IMEController {
  private static instance: IMEController;
  private composing = false;

  static getInstance(): IMEController {
    if (!IMEController.instance) {
      IMEController.instance = new IMEController();
    }
    return IMEController.instance;
  }

  isComposing(): boolean {
    return this.composing;
  }

  setup(el: HTMLTextAreaElement): void {
    el.addEventListener('compositionstart', () => {
      this.composing = true;
    });

    el.addEventListener('compositionupdate', (e: CompositionEvent) => {
      // Dynamic rendering update before final commit
      const session = EditingSession.getInstance();
      const text = el.value;
      session.setText(text);
      session.setSelection(el.selectionStart, el.selectionEnd, el.selectionEnd);
    });

    el.addEventListener('compositionend', () => {
      this.composing = false;
      const session = EditingSession.getInstance();
      session.setText(el.value);
      session.setSelection(el.selectionStart, el.selectionEnd, el.selectionEnd);
    });
  }
}

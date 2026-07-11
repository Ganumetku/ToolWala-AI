import { EditingSession } from './EditingSession';
import { IMEController } from './IMEController';
import { KeyboardController } from './KeyboardController';

/**
 * TextInputController handles offscreen text input element lifecycle and event binds.
 */
export class TextInputController {
  private static instance: TextInputController;
  private textarea: HTMLTextAreaElement | null = null;

  static getInstance(): TextInputController {
    if (!TextInputController.instance) {
      TextInputController.instance = new TextInputController();
    }
    return TextInputController.instance;
  }

  mount(): void {
    if (this.textarea) return;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const el = document.createElement('textarea');
      el.id = 'tw-hidden-text-input';
      // Style to keep completely hidden and out of sight
      Object.assign(el.style, {
        position: 'fixed',
        left: '-9999px',
        top: '-9999px',
        width: '1px',
        height: '1px',
        opacity: '0',
        zIndex: '-1',
      });
      document.body.appendChild(el);
      this.textarea = el;

      this.bindEvents();
    }
  }

  unmount(): void {
    if (!this.textarea) return;
    this.textarea.remove();
    this.textarea = null;
  }

  focus(): void {
    if (this.textarea) {
      const session = EditingSession.getInstance();
      this.textarea.value = session.getText();
      this.textarea.setSelectionRange(session.getSelectionStart(), session.getSelectionEnd());
      this.textarea.focus();
    }
  }

  blur(): void {
    if (this.textarea) {
      this.textarea.blur();
    }
  }

  updateSelectionState(): void {
    if (this.textarea) {
      const session = EditingSession.getInstance();
      this.textarea.setSelectionRange(session.getSelectionStart(), session.getSelectionEnd());
    }
  }

  private bindEvents(): void {
    if (!this.textarea) return;

    const el = this.textarea;
    
    // Bind Keyboard typing
    el.addEventListener('input', (e: Event) => {
      if (IMEController.getInstance().isComposing()) return;

      const session = EditingSession.getInstance();
      session.setText(el.value);
      session.setSelection(el.selectionStart, el.selectionEnd, el.selectionEnd);
    });

    // Bind keyboard shortcut keys via KeyboardController
    el.addEventListener('keydown', (e: KeyboardEvent) => {
      KeyboardController.getInstance().handleKeyDown(e);
    });

    // Bind IME Composition Events via IMEController
    IMEController.getInstance().setup(el);
  }
}

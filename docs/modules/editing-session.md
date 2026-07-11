# editing-session

The `editing` module coordinates user input text transformations, managing state machine transitions to block object modifications during active inline character edits.

---

## State Model

### EditingState
Decoupled states ensuring exclusive cursor and pointer focus:
* `IDLE`: Base inactive state.
* `OBJECT_SELECTED`: Element highlights, resize handles, and rotation handles enabled.
* `TEXT_EDITING`: Caret positioned, typing enabled. Object transforms are completely disabled.
* `TEXT_SELECTING`: Extends text characters range highlight bounds.
* `DRAGGING`: Element horizontal and vertical translations.
* `RESIZING`: Aspect-ratio changes.
* `ROTATING`: Angle rotation operations.

---

## Interceptors and Handlers

* **TextInputController**: Mounts an offscreen `<textarea>` container in the DOM to capture keyboard typewriting.
* **IMEController**: Captures IME composition events to support Chinese, Japanese, Korean, and Hindi languages.
* **KeyboardController**: Map hotkey shortcuts for edits (Backspace, Delete, Ctrl+A).
* **ClipboardController**: Uses the web Clipboard API to execute copy, cut, and paste.
* **FocusManager**: Routes caret selections updates and keeps the offscreen textarea focused.
* **CursorManager**: Enforces custom CSS cursor overlays (I-beam vs. default pointer).
* **EditingValidator**: Enforces transition rules, rejecting transform operations during active sessions.

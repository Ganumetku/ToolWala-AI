import type { TWObject } from '../types';
import { ObjectRegistry } from '../ObjectRegistry';
import { HitTest } from './HitTest';
import { CaretEngine } from '../text/CaretEngine';
import { TextLayout } from '../text/TextLayout';

/**
 * SelectionEngine manages visual selection states, active page scopes,
 * and Top-to-Bottom click hit-testing.
 */
export class SelectionEngine {
  private static instance: SelectionEngine | null = null;
  private selectedObjectId: string | null = null;
  private selectedPageNumber: number | null = null;

  // Active text selection states
  private caretIndex = 0;
  private selectionStart = 0;
  private selectionEnd = 0;
  private isEditingText = false;

  static getInstance(): SelectionEngine {
    if (!this.instance) {
      this.instance = new SelectionEngine();
    }
    return this.instance;
  }

  /**
   * Selects an object by ID on a specific page.
   */
  select(id: string, pageNumber: number): void {
    this.selectedObjectId = id;
    this.selectedPageNumber = pageNumber;
  }

  /**
   * Clears selection.
   */
  deselect(): void {
    this.selectedObjectId = null;
    this.selectedPageNumber = null;
    this.isEditingText = false;
    this.caretIndex = 0;
    this.selectionStart = 0;
    this.selectionEnd = 0;
  }

  /**
   * Retrieves the currently selected object ID.
   */
  getSelectedObjectId(): string | null {
    return this.selectedObjectId;
  }

  /**
   * Retrieves the page number that holds the active selection.
   */
  getSelectedPageNumber(): number | null {
    return this.selectedPageNumber;
  }

  /**
   * Fetches the selected TWObject instance from the ObjectRegistry.
   */
  getSelectedObject(): TWObject | undefined {
    if (!this.selectedObjectId) return undefined;
    return ObjectRegistry.getInstance().getObject(this.selectedObjectId);
  }

  // Text selection API
  getCaretIndex(): number {
    return this.caretIndex;
  }

  setCaretIndex(idx: number): void {
    this.caretIndex = idx;
  }

  getSelectionStart(): number {
    return this.selectionStart;
  }

  setSelectionStart(start: number): void {
    this.selectionStart = start;
  }

  getSelectionEnd(): number {
    return this.selectionEnd;
  }

  setSelectionEnd(end: number): void {
    this.selectionEnd = end;
  }

  getIsEditingText(): boolean {
    return this.isEditingText;
  }

  setIsEditingText(editing: boolean): void {
    this.isEditingText = editing;
  }

  clearTextSelection(): void {
    this.selectionStart = this.caretIndex;
    this.selectionEnd = this.caretIndex;
  }

  handleSingleClick(px: number, py: number, layout: TextLayout): void {
    const caret = new CaretEngine();
    this.caretIndex = caret.clickToCaretIndex(px, py, layout);
    this.selectionStart = this.caretIndex;
    this.selectionEnd = this.caretIndex;
    this.isEditingText = true;
  }

  handleDoubleClick(px: number, py: number, layout: TextLayout): void {
    const caret = new CaretEngine();
    caret.doubleClick(px, py, layout);
    this.caretIndex = caret.caretIndex;
    this.selectionStart = caret.selectionStart;
    this.selectionEnd = caret.selectionEnd;
    this.isEditingText = true;
  }

  handleTripleClick(px: number, py: number, layout: TextLayout): void {
    const caret = new CaretEngine();
    caret.tripleClick(px, py, layout);
    this.caretIndex = caret.caretIndex;
    this.selectionStart = caret.selectionStart;
    this.selectionEnd = caret.selectionEnd;
    this.isEditingText = true;
  }

  handleDragSelection(startPx: number, startPy: number, currentPx: number, currentPy: number, layout: TextLayout): void {
    const caret = new CaretEngine();
    const startIdx = caret.clickToCaretIndex(startPx, startPy, layout);
    const currentIdx = caret.clickToCaretIndex(currentPx, currentPy, layout);
    this.selectionStart = startIdx;
    this.selectionEnd = currentIdx;
    this.caretIndex = currentIdx;
    this.isEditingText = true;
  }

  moveCaretLeft(shiftKey = false, ctrlKey = false, textLength = 0): void {
    let nextIndex = this.caretIndex;
    if (ctrlKey) {
      nextIndex = Math.max(0, this.caretIndex - 1);
    } else {
      nextIndex = Math.max(0, this.caretIndex - 1);
    }
    
    this.caretIndex = nextIndex;
    if (shiftKey) {
      this.selectionEnd = nextIndex;
    } else {
      this.selectionStart = nextIndex;
      this.selectionEnd = nextIndex;
    }
  }

  moveCaretRight(shiftKey = false, ctrlKey = false, textLength = 0): void {
    let nextIndex = this.caretIndex;
    if (ctrlKey) {
      nextIndex = Math.min(textLength, this.caretIndex + 1);
    } else {
      nextIndex = Math.min(textLength, this.caretIndex + 1);
    }
    
    this.caretIndex = nextIndex;
    if (shiftKey) {
      this.selectionEnd = nextIndex;
    } else {
      this.selectionStart = nextIndex;
      this.selectionEnd = nextIndex;
    }
  }

  moveCaretHome(shiftKey = false): void {
    this.caretIndex = 0;
    if (shiftKey) {
      this.selectionEnd = 0;
    } else {
      this.selectionStart = 0;
      this.selectionEnd = 0;
    }
  }

  moveCaretEnd(shiftKey = false, textLength = 0): void {
    this.caretIndex = textLength;
    if (shiftKey) {
      this.selectionEnd = textLength;
    } else {
      this.selectionStart = textLength;
      this.selectionEnd = textLength;
    }
  }

  /**
   * Resolves click inputs from pointer positions, searching from top to bottom (reverse zIndex).
   */
  handlePointerDown(
    px: number,
    py: number,
    pageNumber: number,
    ctx?: CanvasRenderingContext2D
  ): TWObject | null {
    const registry = ObjectRegistry.getInstance();
    const pageObjects = registry.getObjectsByPage(pageNumber);

    // Iterate in reverse drawing order (topmost objects first)
    for (let i = pageObjects.length - 1; i >= 0; i--) {
      const obj = pageObjects[i];
      if (HitTest.hitTest(obj, px, py, ctx)) {
        this.select(obj.id, pageNumber);
        return obj;
      }
    }

    this.deselect();
    return null;
  }
}

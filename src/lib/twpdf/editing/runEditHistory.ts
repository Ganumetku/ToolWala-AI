export type RunStyleOverrides = {
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  width?: number;
  whiteSpace?: 'nowrap' | 'pre-wrap';
};

export type OriginalRunSnapshot = {
  text: string;
  width: number;
  height: number;
  fontSize: number;
  fontFamily?: string;
  fill?: string;
};

export type RunEditRecord = {
  pageIndex: number;
  pageId: string;
  runId: string;
  originalRun: OriginalRunSnapshot;
  newText: string;
  styleOverrides?: RunStyleOverrides;
};

type HistoryListener = () => void;
type ApplyHandler = (record: RunEditRecord, direction: 'undo' | 'redo') => void;

/**
 * Single source of truth for existing-text run edits (overlay typing).
 * Cmd/Ctrl+Z and redo operate on this stack before Fabric/object commands.
 */
export class RunEditHistory {
  private undoStack: RunEditRecord[] = [];
  private redoStack: RunEditRecord[] = [];
  private listeners = new Set<HistoryListener>();
  private applyHandler: ApplyHandler | null = null;

  setApplyHandler(handler: ApplyHandler | null): void {
    this.applyHandler = handler;
  }

  subscribe(listener: HistoryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  /**
   * Consecutive keystrokes on the same run merge into one undo step.
   */
  commit(edit: RunEditRecord): void {
    const last = this.undoStack[this.undoStack.length - 1];
    if (last && last.runId === edit.runId && last.pageId === edit.pageId) {
      last.newText = edit.newText;
      last.styleOverrides = edit.styleOverrides;
      this.redoStack = [];
      this.notify();
      return;
    }
    this.undoStack.push({ ...edit, originalRun: { ...edit.originalRun }, styleOverrides: { ...edit.styleOverrides } });
    this.redoStack = [];
    this.notify();
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo(): RunEditRecord | null {
    const rec = this.undoStack.pop();
    if (!rec) return null;
    this.redoStack.push(rec);
    this.applyHandler?.(rec, 'undo');
    this.notify();
    return rec;
  }

  redo(): RunEditRecord | null {
    const rec = this.redoStack.pop();
    if (!rec) return null;
    this.undoStack.push(rec);
    this.applyHandler?.(rec, 'redo');
    this.notify();
    return rec;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }
}

export const runEditHistory = new RunEditHistory();

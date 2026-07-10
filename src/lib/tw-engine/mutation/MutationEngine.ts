import { Mutation } from './MutationTypes';
import { MutationHistory } from './MutationHistory';
import { UndoRedoManager } from './UndoRedoManager';
import { MutationValidator } from './MutationValidator';
import { MutationMerger } from './MutationMerger';

/**
 * MutationEngine acts as the central orchestrator routing all layouts
 * and text transformations to validators, stack managers, and logs.
 */
export class MutationEngine {
  private static instance: MutationEngine | null = null;
  private history = new MutationHistory();
  private undoRedo = new UndoRedoManager();

  private constructor() {}

  static getInstance(): MutationEngine {
    if (!this.instance) {
      this.instance = new MutationEngine();
    }
    return this.instance;
  }

  /**
   * Evaluates, validates, and applies a mutation.
   * Automatically merges consecutive operations of similar types.
   */
  applyMutation(mutation: Mutation): boolean {
    if (!MutationValidator.validate(mutation)) {
      return false;
    }

    const undoStack = this.undoRedo.getUndoStack();
    const lastMut = undoStack.length > 0 ? undoStack[undoStack.length - 1] : null;

    if (lastMut && MutationMerger.shouldMerge(lastMut, mutation)) {
      // Merge consecutive edits
      const merged = MutationMerger.merge(lastMut, mutation);
      undoStack[undoStack.length - 1] = merged;

      // Update timeline ledger
      const timeline = this.history.getTimeline();
      if (timeline.length > 0 && timeline[timeline.length - 1].id === lastMut.id) {
        timeline[timeline.length - 1] = merged;
      } else {
        this.history.add(merged);
      }
    } else {
      // Apply standard push
      this.undoRedo.push(mutation);
      this.history.add(mutation);
    }

    return true;
  }

  /**
   * Rollback the last operation.
   */
  undo(): Mutation | null {
    return this.undoRedo.undo();
  }

  /**
   * Replay the last undone operation.
   */
  redo(): Mutation | null {
    return this.undoRedo.redo();
  }

  getHistory(): MutationHistory {
    return this.history;
  }

  getUndoRedo(): UndoRedoManager {
    return this.undoRedo;
  }

  /**
   * Reset all history states.
   */
  clear(): void {
    this.history.clear();
    this.undoRedo.clear();
  }
}

import { Mutation } from './MutationTypes';
import { ObjectRegistry } from '../ObjectRegistry';

/**
 * UndoRedoManager manages undo and redo histories, applying rollbacks
 * and replays to the ObjectRegistry cache.
 */
export class UndoRedoManager {
  private undoStack: Mutation[] = [];
  private redoStack: Mutation[] = [];

  /**
   * Pushes a new mutation onto the undo stack and flushes the redo stack.
   */
  push(mutation: Mutation): void {
    this.undoStack.push(mutation);
    this.redoStack = [];
  }

  /**
   * Rolls back the last operation, applying beforeState back to the registry.
   */
  undo(): Mutation | null {
    if (this.undoStack.length === 0) return null;
    const mut = this.undoStack.pop()!;

    const registry = ObjectRegistry.getInstance();
    registry.updateObject(mut.objectId, {
      ...mut.beforeState,
      currentState: { ...mut.beforeState },
    });

    this.redoStack.push(mut);
    return mut;
  }

  /**
   * Replays the last undone operation, applying afterState back to the registry.
   */
  redo(): Mutation | null {
    if (this.redoStack.length === 0) return null;
    const mut = this.redoStack.pop()!;

    const registry = ObjectRegistry.getInstance();
    registry.updateObject(mut.objectId, {
      ...mut.afterState,
      currentState: { ...mut.afterState },
    });

    this.undoStack.push(mut);
    return mut;
  }

  /**
   * Resets both history stacks.
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  getUndoStack(): Mutation[] {
    return this.undoStack;
  }

  getRedoStack(): Mutation[] {
    return this.redoStack;
  }
}

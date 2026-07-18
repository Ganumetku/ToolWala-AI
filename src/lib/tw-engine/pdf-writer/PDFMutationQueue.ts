import { PDFMutation } from './PDFMutationTypes';

/**
  * PDFMutationQueue stores, serializes/deserializes, and provides undo/redo
  * operations for PDF mutations.
  */
export class PDFMutationQueue {
  private queue: PDFMutation[] = [];
  private redoStack: PDFMutation[] = [];

  /**
   * Adds a mutation to the queue and clears the redo stack.
   * Prints a verification report to the console.
   */
  enqueue(mutation: PDFMutation): void {
    this.queue.push(mutation);
    this.redoStack = [];

    // Runtime verification print
    const originalText = (mutation as any).originalText ?? 'N/A';
    const newText = (mutation as any).newText ?? 'N/A';
    const objectNumber = (mutation as any).objectNumber ?? 'N/A';
    const operatorType = (mutation as any).operatorType ?? 'N/A';

    console.log(`[Mutation Enqueued]`, {
      'Mutation Type': mutation.type,
      'Page': mutation.pageNumber,
      'Object Number': objectNumber,
      'Operator': operatorType,
      'Original Text': originalText,
      'New Text': newText,
      'Timestamp': new Date(mutation.timestamp).toISOString(),
      'Queue Length': this.queue.length,
    });
  }

  /**
   * Removes a specific mutation from the queue by ID.
   */
  remove(mutationId: string): boolean {
    const initialLen = this.queue.length;
    this.queue = this.queue.filter((m) => m.mutationId !== mutationId);
    return this.queue.length < initialLen;
  }

  /**
   * Undo the last mutation. Pops from queue, pushes to redo stack.
   */
  undo(): PDFMutation | null {
    if (this.queue.length === 0) return null;
    const popped = this.queue.pop()!;
    this.redoStack.push(popped);
    console.log(`[Mutation Undo] Popped: ${popped.mutationId}. Queue length: ${this.queue.length}`);
    return popped;
  }

  /**
   * Redo the last undone mutation. Pops from redo stack, pushes to queue.
   */
  redo(): PDFMutation | null {
    if (this.redoStack.length === 0) return null;
    const popped = this.redoStack.pop()!;
    this.queue.push(popped);
    console.log(`[Mutation Redo] Pushed: ${popped.mutationId}. Queue length: ${this.queue.length}`);
    return popped;
  }

  /**
   * Clears the entire queue and redo stack.
   */
  clear(): void {
    this.queue = [];
    this.redoStack = [];
  }

  /**
   * Serializes the queue state to JSON string.
   */
  serialize(): string {
    return JSON.stringify({
      queue: this.queue,
      redoStack: this.redoStack,
    });
  }

  /**
   * Deserializes the queue state from JSON string.
   */
  deserialize(serialized: string): void {
    try {
      const parsed = JSON.parse(serialized);
      if (parsed && Array.isArray(parsed.queue)) {
        this.queue = parsed.queue;
      }
      if (parsed && Array.isArray(parsed.redoStack)) {
        this.redoStack = parsed.redoStack;
      }
    } catch (e) {
      console.error('Failed to deserialize PDFMutationQueue state:', e);
    }
  }

  /**
   * Returns a copy of the queue.
   */
  getQueue(): PDFMutation[] {
    return [...this.queue];
  }

  /**
   * Returns a copy of the redo stack.
   */
  getRedoStack(): PDFMutation[] {
    return [...this.redoStack];
  }
}

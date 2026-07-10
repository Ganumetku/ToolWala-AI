import { Mutation } from './MutationTypes';

/**
 * MutationHistory compiles a global chronological history list (timeline)
 * of all layout operations.
 */
export class MutationHistory {
  private timeline: Mutation[] = [];

  /**
   * Appends an applied mutation to the timeline ledger.
   */
  add(mutation: Mutation): void {
    this.timeline.push(mutation);
  }

  /**
   * Retrieves the entire transaction timeline history.
   */
  getTimeline(): Mutation[] {
    return this.timeline;
  }

  /**
   * Flushes the timeline history log.
   */
  clear(): void {
    this.timeline = [];
  }
}

import { Mutation } from './MutationTypes';

/**
 * MutationMerger coalesces consecutive layout shifts or text edits
 * to minimize undo stack clutter.
 */
export class MutationMerger {
  /**
   * Returns true if two consecutive mutations should merge.
   */
  static shouldMerge(
    prev: Mutation,
    next: Mutation,
    thresholdMs = 1500
  ): boolean {
    if (prev.objectId !== next.objectId) return false;
    if (prev.type !== next.type) return false;
    if (next.timestamp - prev.timestamp > thresholdMs) return false;

    // Coalesce drag actions and continuous typing
    const mergeableTypes = ['Move', 'Resize', 'Rotate', 'TextReplace'];
    return mergeableTypes.includes(prev.type);
  }

  /**
   * Merges two mutations, combining the initial beforeState and final afterState.
   */
  static merge(prev: Mutation, next: Mutation): Mutation {
    return {
      ...prev,
      afterState: next.afterState,
      timestamp: next.timestamp,
    };
  }
}

import { MutationEngine } from '../mutation/MutationEngine';
import { Mutation, MutationType } from '../mutation/MutationTypes';

/**
 * MutationDispatcher coordinates building and dispatching new mutation payloads
 * to the central MutationEngine.
 */
export class MutationDispatcher {
  /**
   * Compiles and dispatches a validated mutation transaction.
   */
  static dispatch(
    type: MutationType,
    objectId: string,
    page: number,
    before: any,
    after: any
  ): boolean {
    const mutation: Mutation = {
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      objectId,
      page,
      timestamp: Date.now(),
      beforeState: before,
      afterState: after,
    };
    
    return MutationEngine.getInstance().applyMutation(mutation);
  }
}

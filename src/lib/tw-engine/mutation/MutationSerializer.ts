import { Mutation } from './MutationTypes';

/**
 * MutationSerializer handles serialization, deserialization, and chronological
 * state consolidation for PDFWriter consumption.
 */
export class MutationSerializer {
  /**
   * Serializes a list of mutations into a JSON string.
   */
  static serialize(mutations: Mutation[]): string {
    return JSON.stringify(mutations, null, 2);
  }

  /**
   * Deserializes a JSON string into a list of mutations.
   */
  static deserialize(json: string): Mutation[] {
    return JSON.parse(json);
  }

  /**
   * Chronologically consolidates a history timeline list of mutations, returning a map
   * of object IDs to their final post-mutation state settings.
   */
  static consolidateStates(mutations: Mutation[]): Map<string, any> {
    const statesMap = new Map<string, any>();
    
    // Sort chronologically ascending
    const sorted = [...mutations].sort((a, b) => a.timestamp - b.timestamp);

    sorted.forEach((mut) => {
      statesMap.set(mut.objectId, mut.afterState);
    });

    return statesMap;
  }
}

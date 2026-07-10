import { LegacyFabricBridge } from '../../twpdf/editing/renderer/LegacyFabricBridge';
import { TWObject } from '../types';

/**
 * Handles mapping from the native TWObject schema to the Legacy Fabric configuration options.
 */
export class FabricObjectMapper {
  /**
   * Translates a native TWObject into a serialized options record structure.
   */
  static toFabricObject(obj: TWObject): Record<string, unknown> | null {
    return LegacyFabricBridge.toFabricObject(obj as any);
  }
}

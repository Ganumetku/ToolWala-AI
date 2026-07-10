import { ObjectRegistry } from '../ObjectRegistry';

/**
 * Validation utilities checking that:
 * - Mapped Fabric objects have unique and valid IDs matches.
 * - All registered native objects are successfully mapped.
 * - No serialization failures or unsupported types are hidden.
 */
export class LegacyBridgeValidator {
  static validateRegistryToFabric(pageNumber: number, fabricObjects: Array<Record<string, any>>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const registryObjects = ObjectRegistry.getInstance().getObjectsByPage(pageNumber);
    const registryIds = registryObjects.map((o) => o.id);
    const fabricIds = fabricObjects.map((o) => o.id).filter(Boolean);

    // 1. Detect duplicate IDs in Fabric representation
    const duplicateIds = fabricIds.filter((item, index) => fabricIds.indexOf(item) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate Fabric object IDs detected: ${Array.from(new Set(duplicateIds)).join(', ')}`);
    }

    // 2. Detect missing IDs (objects registered in native engine but missing in Fabric)
    const missingIds = registryIds.filter((id) => !fabricIds.includes(id));
    if (missingIds.length > 0) {
      errors.push(`Native registry objects missing in Fabric output: ${missingIds.join(', ')}`);
    }

    // 3. Inspect individual Fabric objects for invalid mapping structures
    fabricObjects.forEach((obj, idx) => {
      if (!obj.id) {
        errors.push(`Fabric object at index ${idx} lacks a unique 'id' attribute.`);
      }
      if (!obj.type) {
        errors.push(`Fabric object with ID '${obj.id || 'unknown'}' lacks a 'type' attribute.`);
      }
      // Ensure expected basic properties are present
      if (obj.left === undefined || obj.top === undefined) {
        errors.push(`Fabric object '${obj.id || 'unknown'}' is missing positional attributes ('left', 'top').`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

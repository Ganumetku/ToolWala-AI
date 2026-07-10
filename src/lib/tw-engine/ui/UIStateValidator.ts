import { ObjectRegistry } from '../ObjectRegistry';

/**
 * UIStateValidator ensures that UI elements lists align with the
 * single source of truth in ObjectRegistry.
 */
export class UIStateValidator {
  /**
   * Compares list of active IDs in the UI against the ObjectRegistry.
   * Logs warnings if stale or missing elements are detected.
   */
  static validate(pageNum: number, uiObjectIds: string[]): boolean {
    const registry = ObjectRegistry.getInstance();
    
    // Retrieve page IDs from registry (excluding deleted)
    const registryIds = registry
      .getObjectsByPage(pageNum)
      .map((o) => o.id);

    const stale = uiObjectIds.filter((id) => !registryIds.includes(id));
    const missing = registryIds.filter((id) => !uiObjectIds.includes(id));

    if (stale.length > 0) {
      console.warn(`[UIStateValidator] Page ${pageNum} has stale UI elements not in registry:`, stale);
      return false;
    }
    if (missing.length > 0) {
      console.warn(`[UIStateValidator] Page ${pageNum} has missing elements present in registry:`, missing);
      return false;
    }

    return true;
  }
}

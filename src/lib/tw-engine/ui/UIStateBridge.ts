import { ObjectRegistry } from '../ObjectRegistry';
import { TWObject } from '../types';

/**
 * UIStateBridge coordinates direct data operations between UI controls
 * and the single source of truth in ObjectRegistry.
 */
export class UIStateBridge {
  /**
   * Fetches active registered objects for a specific page.
   */
  static getPageObjects(page: number): TWObject[] {
    return ObjectRegistry.getInstance().getObjectsByPage(page);
  }

  /**
   * Retrieves an object from the registry by its identifier.
   */
  static getObject(id: string): TWObject | undefined {
    return ObjectRegistry.getInstance().getObject(id);
  }

  /**
   * Determines if a registered object is in a dirty/unsaved state.
   */
  static isObjectDirty(id: string): boolean {
    const obj = ObjectRegistry.getInstance().getObject(id);
    return obj ? obj.isDirty : false;
  }
}

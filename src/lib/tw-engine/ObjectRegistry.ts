import type { TWObject } from './types';

/**
 * ObjectRegistry serves as the singleton, in-memory source of truth
 * containing all active, modified, or deleted PDF objects.
 */
export class ObjectRegistry {
  private static instance: ObjectRegistry | null = null;
  private registry: Map<string, TWObject> = new Map();

  private constructor() {}

  /**
   * Returns the global ObjectRegistry instance.
   */
  static getInstance(): ObjectRegistry {
    if (!this.instance) {
      this.instance = new ObjectRegistry();
    }
    return this.instance;
  }

  /**
   * Registers an object inside the cache.
   */
  registerObject(obj: TWObject): void {
    if (!obj.id) return;
    this.registry.set(obj.id, obj);
  }

  /**
   * Removes an object from the cache by its ID.
   */
  removeObject(id: string): void {
    this.registry.delete(id);
  }

  /**
   * Merges partial updates into an existing registered object,
   * automatically setting `isDirty = true` if editable layout or content properties shift.
   */
  updateObject(id: string, updates: Partial<TWObject>): void {
    const obj = this.registry.get(id);
    if (!obj) return;

    let isEditingEditableField = false;

    // Check base layout property shifts
    const baseEditableFields: Array<keyof TWObject> = [
      'x', 'y', 'width', 'height', 'rotation', 'opacity', 'visible', 'locked', 'deleted'
    ];
    for (const field of baseEditableFields) {
      if (updates[field] !== undefined && updates[field] !== obj[field]) {
        isEditingEditableField = true;
        break;
      }
    }

    // Check specialized model edits
    if (!isEditingEditableField) {
      if (obj.type === 'text') {
        const textObj = obj as any;
        const textUpdates = updates as any;
        const textFields = ['text', 'fontName', 'fontSize', 'fontColor'];
        for (const field of textFields) {
          if (textUpdates[field] !== undefined && textUpdates[field] !== textObj[field]) {
            isEditingEditableField = true;
            break;
          }
        }
      } else if (obj.type === 'path') {
        const pathObj = obj as any;
        const pathUpdates = updates as any;
        const pathFields = ['pathData', 'strokeColor', 'fillColor', 'strokeWidth'];
        for (const field of pathFields) {
          if (pathUpdates[field] !== undefined && pathUpdates[field] !== pathObj[field]) {
            isEditingEditableField = true;
            break;
          }
        }
      }
    }

    if (isEditingEditableField) {
      updates.isDirty = true;
      updates.updatedAt = Date.now();
    }

    // Apply updates
    Object.assign(obj, updates);
  }

  /**
   * Retrieves a single object by ID.
   */
  getObject(id: string): TWObject | undefined {
    return this.registry.get(id);
  }

  /**
   * Returns a list of all active registered objects.
   */
  getObjects(): TWObject[] {
    return Array.from(this.registry.values());
  }

  /**
   * Filters and returns active, non-deleted objects belonging to a specific page.
   * Order matches the original PDF draw sequence (zIndex).
   */
  getObjectsByPage(pageNumber: number): TWObject[] {
    return this.getObjects()
      .filter((obj) => obj.page === pageNumber && !obj.deleted)
      .sort((a, b) => a.zIndex - b.zIndex);
  }

  /**
   * Filters and returns all objects flagged with unsaved/dirty modifications.
   */
  getDirtyObjects(): TWObject[] {
    return this.getObjects().filter((obj) => obj.isDirty);
  }

  /**
   * Clears all objects from the register.
   */
  clear(): void {
    this.registry.clear();
  }
}

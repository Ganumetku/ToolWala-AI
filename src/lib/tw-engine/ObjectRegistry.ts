import type { TWObject } from './types';
import { PDFMutationEngine } from './pdf-writer/PDFMutationEngine';

/**
 * ObjectRegistry serves as the singleton, in-memory source of truth
 * containing all active, modified, or deleted PDF objects.
 */
export class ObjectRegistry {
  private static instance: ObjectRegistry | null = null;
  private registry: Map<string, TWObject> = new Map();

  private listeners: Array<(id: string, before: any, after: any) => void> = [];

  private constructor() {}

  /**
   * Registers a listener to receive callbacks when objects are updated.
   */
  addListener(listener: (id: string, before: any, after: any) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Unregisters an update listener callback.
   */
  removeListener(listener: (id: string, before: any, after: any) => void): void {
    const idx = this.listeners.indexOf(listener);
    if (idx !== -1) {
      this.listeners.splice(idx, 1);
    }
  }

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

    // Capture state properties before updates
    const beforeState = {
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
      rotation: obj.rotation,
      opacity: obj.opacity,
      visible: obj.visible,
      locked: obj.locked,
      deleted: obj.deleted,
      text: (obj as any).text,
      fontName: (obj as any).fontName,
      fontSize: (obj as any).fontSize,
      fontColor: (obj as any).fontColor,
      fontWeight: (obj as any).fontWeight,
      fontStyle: (obj as any).fontStyle,
      baseline: (obj as any).baseline,
      ascent: (obj as any).ascent,
      descent: (obj as any).descent,
      pdfFontName: (obj as any).pdfFontName,
      originalBBox: (obj as any).originalBBox,
      originalTextData: (obj as any).originalTextData,
      pathData: (obj as any).pathData,
      strokeColor: (obj as any).strokeColor,
      fillColor: (obj as any).fillColor,
      strokeWidth: (obj as any).strokeWidth,
    };

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
        const textFields = [
          'text', 'fontName', 'fontSize', 'fontColor',
          'fontWeight', 'fontStyle', 'baseline', 'ascent', 'descent', 'pdfFontName', 'originalBBox', 'originalTextData'
        ];
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

      // Print runtime verification
      if (obj.type === 'text') {
        const textObj = obj as any;
        const pdfObj = textObj.pdfObject;
        if (pdfObj) {
          console.log(`[Verification] tw-engine Text Object Edited:`, {
            'Object Number': pdfObj.objectNumber ?? 'N/A',
            'Content Stream': pdfObj.contentStreamObject ?? 'N/A',
            'Operator Type': pdfObj.operatorType ?? 'N/A',
            'Operator Index': pdfObj.operatorIndex ?? 'N/A',
            'Original Text': pdfObj.originalText ?? 'N/A',
            'Current Text': (updates as any).text !== undefined ? (updates as any).text : textObj.text,
            'Original Font': pdfObj.fontName ?? 'N/A',
            'Original Matrix': pdfObj.originalTextMatrix ?? 'N/A',
          });
        }
      }

      // Notify PDFMutationEngine to construct and queue mutations
      PDFMutationEngine.getInstance().handleObjectUpdate(obj, updates);
    }

    // Apply updates
    Object.assign(obj, updates);

    // Broadcast update changes
    if (isEditingEditableField) {
      const afterState = {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
        rotation: obj.rotation,
        opacity: obj.opacity,
        visible: obj.visible,
        locked: obj.locked,
        deleted: obj.deleted,
        text: (obj as any).text,
        fontName: (obj as any).fontName,
        fontSize: (obj as any).fontSize,
        fontColor: (obj as any).fontColor,
        fontWeight: (obj as any).fontWeight,
        fontStyle: (obj as any).fontStyle,
        baseline: (obj as any).baseline,
        ascent: (obj as any).ascent,
        descent: (obj as any).descent,
        pdfFontName: (obj as any).pdfFontName,
        originalBBox: (obj as any).originalBBox,
        originalTextData: (obj as any).originalTextData,
        pathData: (obj as any).pathData,
        strokeColor: (obj as any).strokeColor,
        fillColor: (obj as any).fillColor,
        strokeWidth: (obj as any).strokeWidth,
      };

      this.listeners.forEach((listener) => {
        listener(id, beforeState, afterState);
      });
    }
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

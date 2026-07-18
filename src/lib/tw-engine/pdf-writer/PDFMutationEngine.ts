import { TWObject } from '../types';
import { PDFMutation } from './PDFMutationTypes';
import { PDFMutationQueue } from './PDFMutationQueue';

/**
 * PDFMutationEngine detects, transforms, and registers low-level PDF operator mutations
 * when objects are edited inside the ObjectRegistry.
 */
export class PDFMutationEngine {
  private static instance: PDFMutationEngine | null = null;
  private queue = new PDFMutationQueue();

  private constructor() {}

  static getInstance(): PDFMutationEngine {
    if (!this.instance) {
      this.instance = new PDFMutationEngine();
    }
    return this.instance;
  }

  /**
   * Returns the underlying Mutation Queue.
   */
  getQueue(): PDFMutationQueue {
    return this.queue;
  }

  /**
   * Resets the engine and queue.
   */
  clear(): void {
    this.queue.clear();
  }

  /**
   * Analyzes an upcoming object update and generates the corresponding PDF mutation.
   * Runs BEFORE Object.assign is executed in the ObjectRegistry.
   */
  handleObjectUpdate(obj: TWObject, updates: Partial<TWObject>): void {
    // Only trace objects that are backed by an original PDF object structure
    const pdfObj = (obj as any).pdfObject;
    if (!pdfObj) return;

    const pageNumber = pdfObj.pageNumber ?? obj.page ?? 1;
    const objectNumber = pdfObj.objectNumber;
    const generationNumber = pdfObj.generationNumber;
    const contentStreamObject = pdfObj.contentStreamObject;
    const operatorIndex = pdfObj.operatorIndex ?? obj.operatorIndex;
    const operatorType = pdfObj.operatorType ?? 'Tj';

    const timestamp = Date.now();
    const generateId = () => `pdf_mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Text Replacement Mutation
    if (obj.type === 'text') {
      const textObj = obj as any;
      const textUpdates = updates as any;

      if (textUpdates.text !== undefined && textUpdates.text !== textObj.text) {
        const mutation: PDFMutation = {
          mutationId: generateId(),
          type: 'TextReplace',
          pageNumber,
          timestamp,
          objectNumber,
          generationNumber,
          contentStreamObject,
          operatorIndex,
          operatorType,
          originalText: pdfObj.originalText ?? textObj.text,
          newText: textUpdates.text,
          fontName: textUpdates.fontName ?? textObj.fontName,
          fontSize: textUpdates.fontSize ?? textObj.fontSize,
          matrix: textUpdates.transformationMatrix ?? textObj.transformationMatrix ?? pdfObj.transformationMatrix,
        };
        this.queue.enqueue(mutation);
        return; // Prioritize text replacement over layout shifts during inline text editing
      }
    }

    // 2. Delete Mutation
    if (updates.deleted === true || (updates as any).isDeletedOriginal === true) {
      const targetType = obj.type === 'text' ? 'text' : obj.type === 'image' ? 'image' : 'path';
      const mutation: PDFMutation = {
        mutationId: generateId(),
        type: 'DeleteObject',
        pageNumber,
        timestamp,
        objectNumber,
        generationNumber,
        contentStreamObject,
        operatorIndex,
        targetType,
      };
      this.queue.enqueue(mutation);
      return;
    }

    // 3. Color Mutation
    if (obj.type === 'text') {
      const textObj = obj as any;
      const textUpdates = updates as any;
      if (textUpdates.fontColor !== undefined && textUpdates.fontColor !== textObj.fontColor) {
        const mutation: PDFMutation = {
          mutationId: generateId(),
          type: 'Color',
          pageNumber,
          timestamp,
          objectNumber,
          generationNumber,
          contentStreamObject,
          operatorIndex,
          color: textUpdates.fontColor,
        };
        this.queue.enqueue(mutation);
        return;
      }
    }

    // 4. Transform (Position/Scale/Rotation) Mutation
    const hasPositionShift =
      (updates.x !== undefined && updates.x !== obj.x) ||
      (updates.y !== undefined && updates.y !== obj.y) ||
      (updates.width !== undefined && updates.width !== obj.width) ||
      (updates.height !== undefined && updates.height !== obj.height) ||
      (updates.rotation !== undefined && updates.rotation !== obj.rotation);

    if (hasPositionShift) {
      const matrix = updates.transformationMatrix ?? obj.transformationMatrix ?? [];
      const mutation: PDFMutation = {
        mutationId: generateId(),
        type: 'Transform',
        pageNumber,
        timestamp,
        objectNumber,
        generationNumber,
        contentStreamObject,
        operatorIndex,
        matrix: [...matrix],
      };
      this.queue.enqueue(mutation);
      return;
    }
  }
}

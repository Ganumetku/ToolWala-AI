import type { TWPDFDocument, TWPDFObject, TWPDFTextObject } from '@/types/twpdf';
import type { EditingContext } from '../types';
import {
  addObjectToDocument,
  removeObjectFromDocument,
  updateObjectInDocument,
  duplicateObjectInDocument,
  bringObjectForward,
  sendObjectBackward,
  bringObjectToFront,
  sendObjectToBack,
  getObjectById,
} from '../documentMutations';
import { nowTimestamp } from '@/lib/twpdf/dom/utils';
import { BaseCommand } from './base';

function isOriginalPdfText(obj: TWPDFObject | null | undefined): obj is TWPDFTextObject {
  return obj?.type === 'text' && !!(obj as TWPDFTextObject).isOriginalText;
}

export class CreateObjectCommand extends BaseCommand {
  constructor(
    pageId: string,
    private readonly object: TWPDFObject
  ) {
    super('createObject', pageId);
  }

  execute(ctx: EditingContext): TWPDFDocument {
    return addObjectToDocument(ctx.document, this.pageId, this.object);
  }

  undo(ctx: EditingContext): TWPDFDocument {
    return removeObjectFromDocument(ctx.document, this.pageId, this.object.id);
  }
}

export class DeleteObjectCommand extends BaseCommand {
  private readonly snapshot: TWPDFObject;

  constructor(pageId: string, objectId: string, doc: TWPDFDocument) {
    super('deleteObject', pageId);
    const obj = getObjectById(doc, pageId, objectId);
    if (!obj) throw new Error(`Object ${objectId} not found`);
    this.snapshot = JSON.parse(JSON.stringify(obj));
  }

  get objectId() {
    return this.snapshot.id;
  }

  execute(ctx: EditingContext): TWPDFDocument {
    const obj = getObjectById(ctx.document, this.pageId, this.snapshot.id);
    if (obj?.type === 'text' && (obj as TWPDFTextObject).isOriginalText) {
      return updateObjectInDocument(ctx.document, this.pageId, this.snapshot.id, {
        isDeletedOriginal: true,
        visible: false,
        selected: false,
      } as Partial<TWPDFObject>);
    }
    return removeObjectFromDocument(ctx.document, this.pageId, this.snapshot.id);
  }

  undo(ctx: EditingContext): TWPDFDocument {
    if (this.snapshot.type === 'text' && (this.snapshot as TWPDFTextObject).isOriginalText) {
      return updateObjectInDocument(ctx.document, this.pageId, this.snapshot.id, {
        isDeletedOriginal: false,
        visible: true,
      } as Partial<TWPDFObject>);
    }
    return addObjectToDocument(ctx.document, this.pageId, this.snapshot);
  }
}

export class UpdateObjectCommand extends BaseCommand {
  constructor(
    pageId: string,
    private readonly objectId: string,
    private readonly before: Partial<TWPDFObject>,
    private readonly after: Partial<TWPDFObject>
  ) {
    super('updateObject', pageId);
  }

  execute(ctx: EditingContext): TWPDFDocument {
    return updateObjectInDocument(ctx.document, this.pageId, this.objectId, this.after);
  }

  undo(ctx: EditingContext): TWPDFDocument {
    return updateObjectInDocument(ctx.document, this.pageId, this.objectId, this.before);
  }
}

export class MoveObjectCommand extends UpdateObjectCommand {
  constructor(
    pageId: string,
    objectId: string,
    before: Partial<TWPDFObject> & { x: number; y: number },
    after: Partial<TWPDFObject> & { x: number; y: number }
  ) {
    super(pageId, objectId, before, after);
    (this as { type: string }).type = 'moveObject';
  }
}

export class ResizeObjectCommand extends UpdateObjectCommand {
  constructor(
    pageId: string,
    objectId: string,
    before: { width: number; height: number; x?: number; y?: number },
    after: { width: number; height: number; x?: number; y?: number }
  ) {
    super(pageId, objectId, before, after);
    (this as { type: string }).type = 'resizeObject';
  }
}

export class RotateObjectCommand extends UpdateObjectCommand {
  constructor(pageId: string, objectId: string, before: { rotation: number }, after: { rotation: number }) {
    super(pageId, objectId, before, after);
    (this as { type: string }).type = 'rotateObject';
  }
}

export class UpdateTextCommand extends UpdateObjectCommand {
  constructor(
    pageId: string,
    objectId: string,
    before: Partial<TWPDFObject>,
    after: Partial<TWPDFObject>
  ) {
    super(pageId, objectId, before, after);
    (this as { type: string }).type = 'updateText';
  }
}

export class DuplicateObjectCommand extends BaseCommand {
  private readonly sourceId: string;
  private readonly newId: string;

  constructor(pageId: string, sourceId: string, newId: string) {
    super('duplicateObject', pageId);
    this.sourceId = sourceId;
    this.newId = newId;
  }

  execute(ctx: EditingContext): TWPDFDocument {
    return duplicateObjectInDocument(ctx.document, this.pageId, this.sourceId, this.newId).doc;
  }

  undo(ctx: EditingContext): TWPDFDocument {
    return removeObjectFromDocument(ctx.document, this.pageId, this.newId);
  }
}

export class LockObjectCommand extends UpdateObjectCommand {
  constructor(pageId: string, objectId: string, locked: boolean) {
    super(pageId, objectId, { locked: !locked }, { locked });
    (this as { type: string }).type = 'lockObject';
  }
}

type LayerAction = 'forward' | 'backward' | 'front' | 'back';

export class LayerObjectCommand extends BaseCommand {
  private readonly objectId: string;
  private readonly action: LayerAction;
  private beforeZIndexes: Array<{ id: string; zIndex: number }> = [];

  constructor(pageId: string, objectId: string, action: LayerAction, doc: TWPDFDocument) {
    super('layerObject', pageId);
    this.objectId = objectId;
    this.action = action;
    const page = doc.pages.find((p) => p.id === pageId);
    if (page) {
      this.beforeZIndexes = page.objects.map((o) => ({ id: o.id, zIndex: o.zIndex }));
    }
  }

  private applyLayer(doc: TWPDFDocument): TWPDFDocument {
    switch (this.action) {
      case 'forward':
        return bringObjectForward(doc, this.pageId, this.objectId);
      case 'backward':
        return sendObjectBackward(doc, this.pageId, this.objectId);
      case 'front':
        return bringObjectToFront(doc, this.pageId, this.objectId);
      case 'back':
        return sendObjectToBack(doc, this.pageId, this.objectId);
    }
  }

  private restoreZIndexes(doc: TWPDFDocument): TWPDFDocument {
    const pageIdx = doc.pages.findIndex((p) => p.id === this.pageId);
    if (pageIdx === -1) return doc;
    const pages = [...doc.pages];
    const page = pages[pageIdx];
    pages[pageIdx] = {
      ...page,
      objects: page.objects.map((o) => {
        const prev = this.beforeZIndexes.find((b) => b.id === o.id);
        return prev ? { ...o, zIndex: prev.zIndex } : o;
      }),
    };
    return { ...doc, pages };
  }

  execute(ctx: EditingContext): TWPDFDocument {
    return this.applyLayer(ctx.document);
  }

  undo(ctx: EditingContext): TWPDFDocument {
    return this.restoreZIndexes(ctx.document);
  }
}

export class FabricPageSyncCommand extends BaseCommand {
  private readonly beforeObjects: TWPDFObject[];
  private readonly afterObjects: TWPDFObject[];

  constructor(pageId: string, beforeObjects: TWPDFObject[], afterObjects: TWPDFObject[]) {
    super('fabricPageSync', pageId);
    this.beforeObjects = JSON.parse(JSON.stringify(beforeObjects));
    this.afterObjects = JSON.parse(JSON.stringify(afterObjects));
  }

  private replacePageObjects(doc: TWPDFDocument, objects: TWPDFObject[]): TWPDFDocument {
    const pageIdx = doc.pages.findIndex((p) => p.id === this.pageId);
    if (pageIdx === -1) return doc;

    const pages = [...doc.pages];
    pages[pageIdx] = { ...pages[pageIdx], objects };
    return {
      ...doc,
      pages,
      metadata: { ...doc.metadata, updatedAt: nowTimestamp() },
    };
  }

  execute(ctx: EditingContext): TWPDFDocument {
    return this.replacePageObjects(ctx.document, this.afterObjects);
  }

  undo(ctx: EditingContext): TWPDFDocument {
    return this.replacePageObjects(ctx.document, this.beforeObjects);
  }
}

import type { TWPDFDocument, TWPDFObject } from '@/types/twpdf';
import type { TWPDFCommand, PropertyPatch } from './types';
import { CommandHistoryManager } from './commandHistory';
import { ClipboardManager } from './clipboardManager';
import {
  CreateObjectCommand,
  DeleteObjectCommand,
  UpdateObjectCommand,
  MoveObjectCommand,
  ResizeObjectCommand,
  RotateObjectCommand,
  UpdateTextCommand,
  DuplicateObjectCommand,
  LockObjectCommand,
  LayerObjectCommand,
  FabricPageSyncCommand,
} from './commands/objectCommands';
import { syncPageObjectsFromFabric } from '@/lib/twpdf/dom/fabricSync';
import { getObjectById, setSelectionInDocument } from './documentMutations';
import { generateObjectId } from '@/lib/twpdf/dom/utils';
import { fabricObjectToTWPDF } from '@/lib/twpdf/dom/fabricSync';

export type DocumentChangeCallback = (doc: TWPDFDocument, affectedPageId?: string) => void;

export class TWPDFEditingEngine {
  private readonly history = new CommandHistoryManager();
  private readonly clipboard = new ClipboardManager();

  constructor(
    private getDocument: () => TWPDFDocument | null,
    private setDocument: (doc: TWPDFDocument) => void,
    private onDocumentChange?: DocumentChangeCallback
  ) {}

  getHistory() {
    return this.history;
  }

  getClipboard() {
    return this.clipboard;
  }

  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  getHistoryLength(): number {
    return this.history.length;
  }

  private applyCommand(command: TWPDFCommand): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc) return null;

    const next = command.execute({ document: doc });
    this.setDocument(next);
    this.history.push(command);
    this.onDocumentChange?.(next, command.pageId);
    return next;
  }

  undo(): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc || !this.history.canUndo()) return null;

    const command = this.history.popUndo();
    if (!command) return null;

    const next = command.undo({ document: doc });
    this.setDocument(next);
    this.onDocumentChange?.(next, command.pageId);
    return next;
  }

  redo(): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc || !this.history.canRedo()) return null;

    const command = this.history.popRedo();
    if (!command) return null;

    const next = command.redo({ document: doc });
    this.setDocument(next);
    this.onDocumentChange?.(next, command.pageId);
    return next;
  }

  resetHistory(): void {
    this.history.reset();
    this.clipboard.clear();
  }

  createObject(pageId: string, object: TWPDFObject): TWPDFDocument | null {
    return this.applyCommand(new CreateObjectCommand(pageId, object));
  }

  createObjectFromFabric(pageId: string, fabricObj: Record<string, unknown>, zIndex?: number): TWPDFDocument | null {
    const twpdfObj = fabricObjectToTWPDF(fabricObj, zIndex ?? 0);
    if (!twpdfObj) return null;
    return this.createObject(pageId, twpdfObj);
  }

  deleteObject(pageId: string, objectId: string): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc || !getObjectById(doc, pageId, objectId)) return null;
    return this.applyCommand(new DeleteObjectCommand(pageId, objectId, doc));
  }

  updateObject(pageId: string, objectId: string, patch: PropertyPatch): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc) return null;
    const existing = getObjectById(doc, pageId, objectId);
    if (!existing) return null;

    const before: Partial<TWPDFObject> = {};
    for (const key of Object.keys(patch)) {
      (before as Record<string, unknown>)[key] = (existing as unknown as Record<string, unknown>)[key];
    }

    const isTextPatch = existing.type === 'text' && ('text' in patch || 'color' in patch);
    const CommandClass = isTextPatch ? UpdateTextCommand : UpdateObjectCommand;
    return this.applyCommand(new CommandClass(pageId, objectId, before, patch));
  }

  moveObject(pageId: string, objectId: string, x: number, y: number): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc) return null;
    const existing = getObjectById(doc, pageId, objectId);
    if (!existing) return null;

    return this.applyCommand(
      new MoveObjectCommand(pageId, objectId, { x: existing.x, y: existing.y }, { x, y })
    );
  }

  resizeObject(
    pageId: string,
    objectId: string,
    width: number,
    height: number,
    x?: number,
    y?: number
  ): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc) return null;
    const existing = getObjectById(doc, pageId, objectId);
    if (!existing) return null;

    const before = { width: existing.width, height: existing.height, x: existing.x, y: existing.y };
    const after = { width, height, x: x ?? existing.x, y: y ?? existing.y };
    return this.applyCommand(new ResizeObjectCommand(pageId, objectId, before, after));
  }

  rotateObject(pageId: string, objectId: string, rotation: number): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc) return null;
    const existing = getObjectById(doc, pageId, objectId);
    if (!existing) return null;

    return this.applyCommand(
      new RotateObjectCommand(pageId, objectId, { rotation: existing.rotation }, { rotation })
    );
  }

  duplicateObject(pageId: string, objectId: string): TWPDFDocument | null {
    const newId = generateObjectId('dup');
    return this.applyCommand(new DuplicateObjectCommand(pageId, objectId, newId));
  }

  lockObject(pageId: string, objectId: string): TWPDFDocument | null {
    return this.applyCommand(new LockObjectCommand(pageId, objectId, true));
  }

  unlockObject(pageId: string, objectId: string): TWPDFDocument | null {
    return this.applyCommand(new LockObjectCommand(pageId, objectId, false));
  }

  hideObject(pageId: string, objectId: string): TWPDFDocument | null {
    return this.updateObject(pageId, objectId, { visible: false });
  }

  showObject(pageId: string, objectId: string): TWPDFDocument | null {
    return this.updateObject(pageId, objectId, { visible: true });
  }

  bringForward(pageId: string, objectId: string): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc) return null;
    return this.applyCommand(new LayerObjectCommand(pageId, objectId, 'forward', doc));
  }

  sendBackward(pageId: string, objectId: string): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc) return null;
    return this.applyCommand(new LayerObjectCommand(pageId, objectId, 'backward', doc));
  }

  bringToFront(pageId: string, objectId: string): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc) return null;
    return this.applyCommand(new LayerObjectCommand(pageId, objectId, 'front', doc));
  }

  sendToBack(pageId: string, objectId: string): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc) return null;
    return this.applyCommand(new LayerObjectCommand(pageId, objectId, 'back', doc));
  }

  syncPageFromFabric(pageId: string, fabricState: unknown): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc) return null;

    const page = doc.pages.find((p) => p.id === pageId);
    if (!page) return null;

    const afterObjects = syncPageObjectsFromFabric(page, fabricState);
    const beforeSnapshot = JSON.stringify(page.objects);
    const afterSnapshot = JSON.stringify(afterObjects);
    if (beforeSnapshot === afterSnapshot) return doc;

    return this.applyCommand(new FabricPageSyncCommand(pageId, page.objects, afterObjects));
  }

  syncFabricModification(pageId: string, fabricObj: Record<string, unknown>): TWPDFDocument | null {
    const doc = this.getDocument();
    if (!doc) return null;

    const objectId = fabricObj.id as string;
    if (!objectId) return null;

    const existing = getObjectById(doc, pageId, objectId);
    if (!existing) {
      return this.createObjectFromFabric(pageId, fabricObj);
    }

    const scaleX = (fabricObj.scaleX as number) ?? 1;
    const scaleY = (fabricObj.scaleY as number) ?? 1;
    const patch: PropertyPatch = {
      x: fabricObj.left as number,
      y: fabricObj.top as number,
      rotation: fabricObj.angle as number,
      width: ((fabricObj.width as number) ?? existing.width) * scaleX,
      height: ((fabricObj.height as number) ?? existing.height) * scaleY,
    };

    if (existing.type === 'text') {
      Object.assign(patch, {
        text: fabricObj.text,
        fontFamily: fabricObj.fontFamily,
        fontSize: fabricObj.fontSize,
        fontWeight: fabricObj.fontWeight,
        fontStyle: fabricObj.fontStyle,
        color: fabricObj.fill,
        alignment: fabricObj.textAlign,
        underline: fabricObj.underline,
        opacity: fabricObj.opacity,
        isDeletedOriginal: fabricObj.isDeletedOriginal,
      });
    }

    const before: Partial<TWPDFObject> = {
      x: existing.x,
      y: existing.y,
      rotation: existing.rotation,
      width: existing.width,
      height: existing.height,
    };
    if (existing.type === 'text') {
      Object.assign(before, {
        text: (existing as { text: string }).text,
        color: (existing as { color: string }).color,
        fontSize: (existing as { fontSize: number }).fontSize,
      });
    }

    const hasMoved = before.x !== patch.x || before.y !== patch.y;
    if (hasMoved) {
      return this.applyCommand(
        new MoveObjectCommand(
          pageId,
          objectId,
          { ...before, x: before.x ?? existing.x, y: before.y ?? existing.y },
          { ...patch, x: patch.x ?? existing.x, y: patch.y ?? existing.y }
        )
      );
    } else {
      return this.applyCommand(new UpdateObjectCommand(pageId, objectId, before, patch));
    }
  }

  select(pageId: string, objectId: string): void {
    const doc = this.getDocument();
    if (!doc) return;
    const next = setSelectionInDocument(doc, pageId, objectId);
    this.setDocument(next);
  }

  deselect(): void {
    const doc = this.getDocument();
    if (!doc) return;
    const next = setSelectionInDocument(doc, doc.currentPageId, null);
    this.setDocument(next);
  }

  clearSelection(): void {
    this.deselect();
  }

  copy(pageId: string, objectId: string): boolean {
    const doc = this.getDocument();
    if (!doc) return false;
    const obj = getObjectById(doc, pageId, objectId);
    if (!obj) return false;
    this.clipboard.copy(pageId, obj);
    return true;
  }

  cut(pageId: string, objectId: string): TWPDFDocument | null {
    if (!this.copy(pageId, objectId)) return null;
    return this.deleteObject(pageId, objectId);
  }

  paste(pageId: string): TWPDFDocument | null {
    const entry = this.clipboard.getEntry();
    if (!entry) return null;

    const newObject: TWPDFObject = {
      ...JSON.parse(JSON.stringify(entry.object)),
      id: generateObjectId('paste'),
      x: entry.object.x + 15,
      y: entry.object.y + 15,
      selected: false,
    };

    return this.createObject(pageId, newObject);
  }

  hasClipboard(): boolean {
    return this.clipboard.hasContent();
  }
}

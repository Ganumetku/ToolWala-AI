import type { TWPDFDocument } from '@/types/twpdf';
import type { TWPDFCommand, EditingContext } from '@/lib/twpdf/editing/types';
import { cloneDocument } from '@/lib/twpdf/dom/utils';

export class SnapshotCommand implements TWPDFCommand {
  readonly id: string;
  readonly type: string = 'snapshot';
  readonly pageId: string;
  readonly name: string;
  private readonly before: TWPDFDocument;
  private readonly after: TWPDFDocument;

  constructor(name: string, before: TWPDFDocument, after: TWPDFDocument) {
    this.id = `snap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.pageId = before.currentPageId || '';
    this.name = name;
    this.before = cloneDocument(before);
    this.after = cloneDocument(after);
  }

  execute(_ctx: EditingContext): TWPDFDocument {
    return cloneDocument(this.after);
  }

  undo(_ctx: EditingContext): TWPDFDocument {
    return cloneDocument(this.before);
  }

  redo(_ctx: EditingContext): TWPDFDocument {
    return cloneDocument(this.after);
  }
}

export function createSnapshotCommand(
  name: string,
  before: TWPDFDocument,
  mutator: (doc: TWPDFDocument) => TWPDFDocument
): SnapshotCommand {
  return new SnapshotCommand(name, before, mutator(before));
}

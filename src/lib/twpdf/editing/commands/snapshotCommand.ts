import type { TWPDFDocument } from '@/types/twpdf';
import type { TWPDFCommand } from '@/lib/twpdf/editing/types';
import { cloneDocument } from '@/lib/twpdf/dom/utils';

export class SnapshotCommand implements TWPDFCommand {
  readonly name: string;
  private readonly before: TWPDFDocument;
  private readonly after: TWPDFDocument;

  constructor(name: string, before: TWPDFDocument, after: TWPDFDocument) {
    this.name = name;
    this.before = cloneDocument(before);
    this.after = cloneDocument(after);
  }

  execute(_document: TWPDFDocument): TWPDFDocument {
    return cloneDocument(this.after);
  }

  undo(_document: TWPDFDocument): TWPDFDocument {
    return cloneDocument(this.before);
  }

  redo(_document: TWPDFDocument): TWPDFDocument {
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

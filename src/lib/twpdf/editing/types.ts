import type { TWPDFDocument, TWPDFObject } from '@/types/twpdf';

export const MAX_COMMAND_HISTORY = 100;

export interface EditingContext {
  document: TWPDFDocument;
}

export interface TWPDFCommand {
  readonly id: string;
  readonly type: string;
  readonly pageId: string;
  execute(ctx: EditingContext): TWPDFDocument;
  undo(ctx: EditingContext): TWPDFDocument;
  redo(ctx: EditingContext): TWPDFDocument;
}

export interface ClipboardEntry {
  pageId: string;
  object: TWPDFObject;
}

export type PropertyPatch = Partial<TWPDFObject> & Record<string, unknown>;

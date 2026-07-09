import type { TWPDFCommand } from '../types';
import { generateObjectId } from '@/lib/twpdf/dom/utils';

export function createCommandId(type: string): string {
  return `cmd_${type}_${generateObjectId('')}`;
}

export abstract class BaseCommand implements TWPDFCommand {
  readonly id: string;

  constructor(
    readonly type: string,
    readonly pageId: string
  ) {
    this.id = createCommandId(type);
  }

  abstract execute(ctx: import('../types').EditingContext): import('@/types/twpdf').TWPDFDocument;
  abstract undo(ctx: import('../types').EditingContext): import('@/types/twpdf').TWPDFDocument;

  redo(ctx: import('../types').EditingContext) {
    return this.execute(ctx);
  }
}

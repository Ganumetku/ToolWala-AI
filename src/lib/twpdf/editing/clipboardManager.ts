import type { TWPDFObject } from '@/types/twpdf';
import type { ClipboardEntry } from './types';

export class ClipboardManager {
  private entry: ClipboardEntry | null = null;

  copy(pageId: string, object: TWPDFObject): void {
    this.entry = {
      pageId,
      object: JSON.parse(JSON.stringify(object)),
    };
  }

  hasContent(): boolean {
    return this.entry !== null;
  }

  getEntry(): ClipboardEntry | null {
    return this.entry ? JSON.parse(JSON.stringify(this.entry)) : null;
  }

  clear(): void {
    this.entry = null;
  }
}

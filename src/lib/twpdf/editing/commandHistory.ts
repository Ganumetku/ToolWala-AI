import type { TWPDFCommand } from './types';
import { MAX_COMMAND_HISTORY } from './types';

export class CommandHistoryManager {
  private past: TWPDFCommand[] = [];
  private future: TWPDFCommand[] = [];

  push(command: TWPDFCommand): void {
    this.past.push(command);
    if (this.past.length > MAX_COMMAND_HISTORY) {
      this.past.shift();
    }
    this.future = [];
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  peekUndo(): TWPDFCommand | null {
    return this.past.length > 0 ? this.past[this.past.length - 1] : null;
  }

  peekRedo(): TWPDFCommand | null {
    return this.future.length > 0 ? this.future[this.future.length - 1] : null;
  }

  popUndo(): TWPDFCommand | null {
    if (!this.canUndo()) return null;
    const cmd = this.past.pop()!;
    this.future.push(cmd);
    return cmd;
  }

  popRedo(): TWPDFCommand | null {
    if (!this.canRedo()) return null;
    const cmd = this.future.pop()!;
    this.past.push(cmd);
    return cmd;
  }

  reset(): void {
    this.past = [];
    this.future = [];
  }

  get length(): number {
    return this.past.length;
  }

  get futureLength(): number {
    return this.future.length;
  }
}

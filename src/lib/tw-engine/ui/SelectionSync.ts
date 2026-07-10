import { EditorEvents } from './EditorEvents';

/**
 * SelectionSync tracks active selection IDs, syncing them with selection engine
 * components and dispatching events to update UI controls.
 */
export class SelectionSync {
  private static instance: SelectionSync | null = null;
  private selectedObjectId: string | null = null;
  private selectedPage = 1;

  private constructor() {}

  static getInstance(): SelectionSync {
    if (!this.instance) {
      this.instance = new SelectionSync();
    }
    return this.instance;
  }

  /**
   * Sets the active selection object and triggers SelectionChanged events.
   */
  select(id: string | null, page: number): void {
    const prevId = this.selectedObjectId;
    this.selectedObjectId = id;
    this.selectedPage = page;
    
    if (prevId !== id) {
      EditorEvents.getInstance().dispatch('SelectionChanged', { id, page });
    }
  }

  /**
   * Clears the current active selection states.
   */
  deselect(): void {
    this.select(null, this.selectedPage);
  }

  getSelectedId(): string | null {
    return this.selectedObjectId;
  }

  getSelectedPage(): number {
    return this.selectedPage;
  }
}

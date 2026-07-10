import { EditorEvents } from './EditorEvents';

/**
 * ViewportSync tracks view variables (such as zoom scales, translations,
 * and page offset positions) outside the canvas renderer context.
 */
export class ViewportSync {
  private static instance: ViewportSync | null = null;
  private zoom = 1.0;
  private scrollX = 0;
  private scrollY = 0;
  private currentPage = 1;

  private constructor() {}

  static getInstance(): ViewportSync {
    if (!this.instance) {
      this.instance = new ViewportSync();
    }
    return this.instance;
  }

  setZoom(z: number): void {
    const prev = this.zoom;
    this.zoom = z;
    if (prev !== z) {
      EditorEvents.getInstance().dispatch('ZoomChanged', { zoom: z });
    }
  }

  getZoom(): number {
    return this.zoom;
  }

  setScroll(x: number, y: number): void {
    this.scrollX = x;
    this.scrollY = y;
  }

  getScroll(): { x: number; y: number } {
    return { x: this.scrollX, y: this.scrollY };
  }

  setCurrentPage(page: number): void {
    const prev = this.currentPage;
    this.currentPage = page;
    if (prev !== page) {
      EditorEvents.getInstance().dispatch('PageChanged', { page });
    }
  }

  getCurrentPage(): number {
    return this.currentPage;
  }
}

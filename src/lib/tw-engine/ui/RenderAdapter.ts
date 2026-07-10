/**
 * Renderer represents a generic interface that concrete rendering surfaces
 * (like legacy Fabric canvas wrappers or future native engines) must satisfy.
 */
export interface Renderer {
  renderPage(pageNum: number, canvasElement: HTMLCanvasElement, zoom: number): Promise<void>;
  updateObject(id: string, properties: any): void;
}

/**
 * RenderAdapter provides a single interface for React components to render pages
 * without needing to know which underlying library (Fabric or Native) is active.
 */
export class RenderAdapter {
  private static activeRenderer: Renderer | null = null;

  /**
   * Sets the active rendering surface wrapper.
   */
  static setRenderer(renderer: Renderer): void {
    this.activeRenderer = renderer;
  }

  /**
   * Delegates rendering tasks to the active renderer.
   */
  static async render(
    pageNum: number,
    canvasElement: HTMLCanvasElement,
    zoom: number
  ): Promise<void> {
    if (this.activeRenderer) {
      await this.activeRenderer.renderPage(pageNum, canvasElement, zoom);
    }
  }

  /**
   * Delegates properties update notifications to the active renderer.
   */
  static update(id: string, properties: any): void {
    if (this.activeRenderer) {
      this.activeRenderer.updateObject(id, properties);
    }
  }
}

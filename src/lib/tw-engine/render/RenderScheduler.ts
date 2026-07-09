/**
 * RenderScheduler batches redraw requests into standard browser requestAnimationFrame frames,
 * throttling redundant layout paints.
 */
export class RenderScheduler {
  private renderPending = false;
  private renderCallback: () => void;

  constructor(renderCallback: () => void) {
    this.renderCallback = renderCallback;
  }

  /**
   * Schedules a canvas redraw on the next frame callback.
   * Throttles duplicate calls in the same frame window.
   */
  requestRender(): void {
    if (this.renderPending) return;
    this.renderPending = true;

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        this.renderPending = false;
        this.renderCallback();
      });
    } else {
      // Node.js environment fallback using asynchronous timeout
      setTimeout(() => {
        this.renderPending = false;
        this.renderCallback();
      }, 0);
    }
  }
}

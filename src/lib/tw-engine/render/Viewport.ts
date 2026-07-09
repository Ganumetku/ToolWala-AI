export interface PageViewportBounds {
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Viewport represents the physical canvas boundaries and scroll layout,
 * identifying which pages are currently visible.
 */
export class Viewport {
  width = 800;
  height = 600;
  devicePixelRatio = 1.0;
  scrollX = 0;
  scrollY = 0;
  visiblePages: number[] = [];

  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
  }

  /**
   * Resizes the viewport dimensions and updates device scale ratio.
   */
  setCanvasSize(width: number, height: number, devicePixelRatio?: number): void {
    this.width = width;
    this.height = height;
    if (devicePixelRatio !== undefined) {
      this.devicePixelRatio = devicePixelRatio;
    }
  }

  /**
   * Translates the scroll offset.
   */
  scrollTo(scrollX: number, scrollY: number): void {
    this.scrollX = scrollX;
    this.scrollY = scrollY;
  }

  /**
   * Scans document pages layout bounds and flags pages intersecting the viewport window.
   */
  updateVisiblePages(pagesList: PageViewportBounds[]): void {
    const visible: number[] = [];
    const viewLeft = this.scrollX;
    const viewRight = this.scrollX + this.width;
    const viewTop = this.scrollY;
    const viewBottom = this.scrollY + this.height;

    for (const page of pagesList) {
      const pageLeft = page.x;
      const pageRight = page.x + page.width;
      const pageTop = page.y;
      const pageBottom = page.y + page.height;

      // Intersection boundary check
      const isVisible = !(
        pageRight < viewLeft ||
        pageLeft > viewRight ||
        pageBottom < viewTop ||
        pageTop > viewBottom
      );

      if (isVisible) {
        visible.push(page.pageNumber);
      }
    }
    this.visiblePages = visible;
  }
}

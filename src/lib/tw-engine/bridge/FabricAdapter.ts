/**
 * Adapter wrapping low-level Fabric Canvas operations.
 * Isolates direct manipulation of elements from React component logic.
 */
export class FabricAdapter {
  private canvas: any;

  constructor(canvas: any) {
    this.canvas = canvas;
  }

  /**
   * Adds an object to the Fabric canvas.
   */
  addObject(obj: any): void {
    if (this.canvas && typeof this.canvas.add === 'function') {
      this.canvas.add(obj);
    }
  }

  /**
   * Removes an object from the Fabric canvas.
   */
  removeObject(obj: any): void {
    if (this.canvas && typeof this.canvas.remove === 'function') {
      this.canvas.remove(obj);
    }
  }

  /**
   * Triggers a repaint/redraw of the Fabric canvas.
   */
  render(): void {
    if (this.canvas && typeof this.canvas.renderAll === 'function') {
      this.canvas.renderAll();
    }
  }

  /**
   * Disposes and clears all elements from the Fabric canvas.
   */
  clear(): void {
    if (this.canvas && typeof this.canvas.clear === 'function') {
      this.canvas.clear();
    }
  }

  /**
   * Returns the list of active Fabric objects on the canvas.
   */
  getObjects(): any[] {
    if (this.canvas && typeof this.canvas.getObjects === 'function') {
      return this.canvas.getObjects();
    }
    return [];
  }
}

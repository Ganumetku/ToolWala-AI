import { Matrix } from '../Matrix';

/**
 * Camera handles viewport operations such as translations (pan),
 * scaling (zoom), and rotation matrices.
 */
export class Camera {
  x = 0;
  y = 0;
  zoom = 1.0;
  rotation = 0; // in degrees

  /**
   * Pans the camera offset coordinates.
   */
  translate(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  /**
   * Scales the camera zoom ratio (bound between 0.05 and 20.0).
   */
  scale(factor: number): void {
    this.zoom = Math.max(0.05, Math.min(20.0, this.zoom * factor));
  }

  /**
   * Increments the camera rotation angle.
   */
  rotate(angleDegrees: number): void {
    this.rotation = (this.rotation + angleDegrees) % 360;
    if (this.rotation < 0) this.rotation += 360;
  }

  /**
   * Compiles the view transformation matrix.
   */
  getViewMatrix(): number[] {
    let m = [1, 0, 0, 1, 0, 0];
    
    // 1. Translate camera pan position
    m = Matrix.translate(m, this.x, this.y);
    
    // 2. Scale by zoom factor
    m = Matrix.scale(m, this.zoom, this.zoom);
    
    // 3. Rotate camera viewing window
    if (this.rotation !== 0) {
      m = Matrix.rotate(m, this.rotation * Math.PI / 180);
    }
    
    return m;
  }
}

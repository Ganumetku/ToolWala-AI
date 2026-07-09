import type { TWObject } from '../types';

/**
 * BoundingBox draws interactive visual boundaries, connector lines,
 * and handle boxes on top of selected elements.
 */
export class BoundingBox {
  /**
   * Renders the border outlines and transform handles for a selected object.
   */
  static render(ctx: CanvasRenderingContext2D, obj: TWObject): void {
    if (!obj.visible || obj.deleted) return;

    ctx.save();
    
    // Move coordinate origin to object center and rotate
    const cx = obj.x + obj.width / 2;
    const cy = obj.y + obj.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(obj.rotation * Math.PI / 180);
    ctx.translate(-obj.width / 2, -obj.height / 2);

    // 1. Draw dashed border boundary
    ctx.strokeStyle = '#0088ff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(0, 0, obj.width, obj.height);
    ctx.setLineDash([]); // Reset line style

    // 2. Draw rotation handle extension stem
    const rotX = obj.width / 2;
    const rotY = -25;
    
    ctx.beginPath();
    ctx.moveTo(rotX, 0);
    ctx.lineTo(rotX, rotY);
    ctx.strokeStyle = '#0088ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw rotation circle node
    ctx.beginPath();
    ctx.arc(rotX, rotY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    // 3. Draw 8 resize handle squares
    const handleSize = 8;
    const offset = handleSize / 2;
    
    const handles = [
      { x: 0, y: 0 }, // TL
      { x: obj.width / 2, y: 0 }, // TC
      { x: obj.width, y: 0 }, // TR
      { x: 0, y: obj.height / 2 }, // ML
      { x: obj.width, y: obj.height / 2 }, // MR
      { x: 0, y: obj.height }, // BL
      { x: obj.width / 2, y: obj.height }, // BC
      { x: obj.width, y: obj.height }, // BR
    ];

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0088ff';
    ctx.lineWidth = 1.5;

    handles.forEach((h) => {
      ctx.fillRect(h.x - offset, h.y - offset, handleSize, handleSize);
      ctx.strokeRect(h.x - offset, h.y - offset, handleSize, handleSize);
    });

    ctx.restore();
  }
}

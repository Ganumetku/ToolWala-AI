import type { TWObject } from '../types';
import { ObjectRegistry } from '../ObjectRegistry';

/**
 * RenderEngine renders all active PDF objects from the ObjectRegistry
 * onto an HTML5 2D canvas context in zIndex order.
 */
export class RenderEngine {
  private static imageCache: Map<string, HTMLImageElement> = new Map();
  private redrawCallback?: () => void;

  constructor(redrawCallback?: () => void) {
    this.redrawCallback = redrawCallback;
  }

  /**
   * Renders registered objects for a given page onto the 2D context.
   */
  render(ctx: CanvasRenderingContext2D, pageNumber: number): void {
    const registry = ObjectRegistry.getInstance();
    const pageObjects = registry.getObjectsByPage(pageNumber);

    pageObjects.forEach((obj) => {
      if (!obj.visible || obj.deleted) return;

      ctx.save();
      ctx.globalAlpha = obj.opacity;

      const state = obj.currentState as any;

      if (obj.type === 'path') {
        // Path rendering: Draw using original SVG path data, translated/rotated
        // based on edits relative to original coordinates bounds.
        const orig = (obj as any).originalState;
        const dx = state.x - orig.x;
        const dy = state.y - orig.y;

        if (dx !== 0 || dy !== 0) {
          ctx.translate(dx, dy);
        }

        const cx = orig.x + orig.width / 2;
        const cy = orig.y + orig.height / 2;
        const diffRotation = state.rotation - orig.rotation;
        if (diffRotation !== 0) {
          ctx.translate(cx, cy);
          ctx.rotate(diffRotation * Math.PI / 180);
          ctx.translate(-cx, -cy);
        }

        const scaleX = orig.width > 0 ? state.width / orig.width : 1;
        const scaleY = orig.height > 0 ? state.height / orig.height : 1;
        if (scaleX !== 1 || scaleY !== 1) {
          ctx.translate(cx, cy);
          ctx.scale(scaleX, scaleY);
          ctx.translate(-cx, -cy);
        }

        if (typeof Path2D !== 'undefined') {
          const path2d = new Path2D(orig.pathData);
          if (state.fillColor && state.fillColor !== 'transparent') {
            ctx.fillStyle = state.fillColor;
            ctx.fill(path2d);
          }
          if (state.strokeColor && state.strokeColor !== 'transparent' && state.strokeWidth > 0) {
            ctx.strokeStyle = state.strokeColor;
            ctx.lineWidth = state.strokeWidth;
            ctx.stroke(path2d);
          }
        }
      } else {
        // Standard shape rendering: Translate to center and rotate
        const cx = state.x + state.width / 2;
        const cy = state.y + state.height / 2;

        ctx.translate(cx, cy);
        ctx.rotate(state.rotation * Math.PI / 180);
        ctx.translate(-state.width / 2, -state.height / 2);

        switch (obj.type) {
          case 'text': {
            ctx.font = `${state.fontSize}px ${state.fontName}`;
            ctx.fillStyle = state.fontColor;
            const baselineOffset = (obj as any).baseline - (obj as any).y;
            ctx.fillText(state.text, 0, baselineOffset);
            break;
          }

          case 'image': {
            const imgObj = obj as any;
            if (imgObj.imageBytes) {
              let cachedImg = RenderEngine.imageCache.get(obj.id);
              if (!cachedImg) {
                if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
                  const blob = new Blob([imgObj.imageBytes], { type: imgObj.mimeType });
                  const url = URL.createObjectURL(blob);
                  const img = new Image();
                  img.onload = () => {
                    RenderEngine.imageCache.set(obj.id, img);
                    if (this.redrawCallback) this.redrawCallback();
                  };
                  img.src = url;
                }
              } else {
                ctx.drawImage(cachedImg, 0, 0, state.width, state.height);
              }
            }
            break;
          }

          case 'annotation': {
            const annotObj = obj as any;
            if (annotObj.annotType === 'highlight') {
              ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
              ctx.fillRect(0, 0, state.width, state.height);
            } else {
              ctx.strokeStyle = 'rgba(0, 136, 255, 0.5)';
              ctx.lineWidth = 1;
              ctx.setLineDash([2, 2]);
              ctx.strokeRect(0, 0, state.width, state.height);
            }
            break;
          }
        }
      }

      ctx.restore();
    });
  }
}

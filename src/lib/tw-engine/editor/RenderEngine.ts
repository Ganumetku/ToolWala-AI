import type { TWObject } from '../types';
import { ObjectRegistry } from '../ObjectRegistry';
import { SelectionEngine } from './SelectionEngine';
import { TextLayout } from '../text/TextLayout';
import { TextSelection } from '../text/TextSelection';

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
  render(ctx: CanvasRenderingContext2D, pageNumber: number, fabricObjects?: any[]): void {
    if (fabricObjects) {
      fabricObjects.forEach((obj) => {
        if (obj.isOriginalText || obj.type === 'textbox' || obj.type === 'i-text') {
          const selection = SelectionEngine.getInstance();
          const isEditing = selection.getIsEditingText() && selection.getSelectedObjectId() === obj.id;
          if (!isEditing) return;

          ctx.save();
          const scaleX = obj.scaleX || 1;
          const scaleY = obj.scaleY || 1;

          ctx.translate(obj.left || 0, obj.top || 0);
          ctx.rotate(((obj.angle || 0) * Math.PI) / 180);
          ctx.scale(scaleX, scaleY);

          const layout = new TextLayout(obj.text || '', obj.fontFamily || 'Helvetica', obj.fontSize || 12);
          const start = selection.getSelectionStart();
          const end = selection.getSelectionEnd();

          // 1. Draw Selection Highlights
          if (start !== end) {
            const rects = TextSelection.getSelectionRects(layout, start, end);
            ctx.fillStyle = 'rgba(0, 102, 204, 0.3)'; // Professional highlight blue
            for (const r of rects) {
              ctx.fillRect(r.x, r.y, r.width, r.height);
            }
          }

          // 2. Draw Blinking Caret
          if (start === end) {
            const caretIndex = selection.getCaretIndex();
            if (Math.floor(Date.now() / 500) % 2 === 0) {
              const caretCoords = this.getCaretCoords(layout, caretIndex);
              ctx.strokeStyle = obj.fill && obj.fill !== 'transparent' ? obj.fill : '#000000';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(caretCoords.x, caretCoords.y);
              ctx.lineTo(caretCoords.x, caretCoords.y + caretCoords.height);
              ctx.stroke();
            }
          }

          ctx.restore();
        }
      });
      return;
    }

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
            const baselineOffset = (obj as any).baseline - (obj as any).y;

            // Render native text selection highlight if active
            const selection = SelectionEngine.getInstance();
            const isEditing = selection.getIsEditingText() && selection.getSelectedObjectId() === obj.id;

            let layout: TextLayout | null = null;
            if (isEditing) {
              layout = new TextLayout(state.text, state.fontName, state.fontSize);
              const start = selection.getSelectionStart();
              const end = selection.getSelectionEnd();
              if (start !== end) {
                const rects = TextSelection.getSelectionRects(layout, start, end);
                ctx.fillStyle = 'rgba(0, 102, 204, 0.3)'; // Professional highlight blue
                for (const r of rects) {
                  ctx.fillRect(r.x, r.y, r.width, r.height);
                }
              }
            }

            // Draw actual text
            ctx.fillStyle = state.fontColor || '#000000';
            ctx.fillText(state.text, 0, baselineOffset);

            // Render blinking caret (500ms intervals)
            if (isEditing && layout) {
              const start = selection.getSelectionStart();
              const end = selection.getSelectionEnd();
              if (start === end) {
                const caretIndex = selection.getCaretIndex();
                if (Math.floor(Date.now() / 500) % 2 === 0) {
                  const caretCoords = this.getCaretCoords(layout, caretIndex);
                  ctx.strokeStyle = state.fontColor || '#000000';
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.moveTo(caretCoords.x, caretCoords.y);
                  ctx.lineTo(caretCoords.x, caretCoords.y + caretCoords.height);
                  ctx.stroke();
                }
              }
            }
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

  private getCaretCoords(layout: TextLayout, caretIndex: number): { x: number; y: number; height: number } {
    let cumulative = 0;
    for (const line of layout.lines) {
      const lineEndIdx = cumulative + line.text.length;
      if (caretIndex >= cumulative && caretIndex <= lineEndIdx) {
        const localIdx = caretIndex - cumulative;
        let x = 0;
        if (localIdx > 0 && line.glyphs.length > 0) {
          const glyph = line.glyphs[Math.min(localIdx - 1, line.glyphs.length - 1)];
          x = glyph.x + glyph.advanceX;
        }
        const y = line.y - line.ascent;
        const height = line.ascent + line.descent;
        return { x, y, height };
      }
      cumulative = lineEndIdx;
    }
    if (layout.lines.length > 0) {
      const firstLine = layout.lines[0];
      return { x: 0, y: firstLine.y - firstLine.ascent, height: firstLine.ascent + firstLine.descent };
    }
    return { x: 0, y: 0, height: 12 };
  }
}

import type { TWObject } from '../types';
import { ObjectRegistry } from '../ObjectRegistry';
import { SelectionEngine } from './SelectionEngine';
import { TextLayout } from '../text/TextLayout';
import type { LineRun } from '../text/TextLayout';
import type { GlyphLayout } from '../text/GlyphLayout';
import { TextSelection } from '../text/TextSelection';
import { FidelityEngine } from '../fidelity/FidelityEngine';
import { EditingSession } from '../editing/EditingSession';
import { CaretRenderer } from '../editing/CaretRenderer';
import { SelectionRenderer } from '../editing/SelectionRenderer';
import { isOriginalTextEdited } from '../../twpdf/editor/textEdit';

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
          const session = EditingSession.getInstance();
          const isEditing = session.getActiveObjectId() === obj.id;
          const isEdited = isOriginalTextEdited(obj);

          // We only render this element if it is actively being edited OR if it has been edited/modified!
          if (!isEditing && !isEdited) return;

          // Compile text using the active session's typed text if editing, otherwise the object's current modified text
          const currentText = isEditing ? session.getText() : (obj.text || '');
          const fontFamily = obj.fontFamily || 'Helvetica';
          const fontSize = obj.fontSize || 12;
          const fontStyle = obj.fontStyle || 'normal';
          const fontWeight = obj.fontWeight || 'normal';

          const cacheKey = `${currentText}_${fontFamily}_${fontSize}_${fontStyle}_${fontWeight}`;
          if (!obj._cachedLayout || obj._cachedLayoutKey !== cacheKey) {
            obj._cachedLayout = new TextLayout(currentText, fontFamily, fontSize);
            obj._cachedLayoutKey = cacheKey;
          }
          const layout = obj._cachedLayout;

          ctx.save();
          const scaleX = obj.scaleX || 1;
          const scaleY = obj.scaleY || 1;

          ctx.translate(obj.left || 0, obj.top || 0);
          ctx.rotate(((obj.angle || 0) * Math.PI) / 180);
          ctx.scale(scaleX, scaleY);

          // Calculate baseline shift to ensure pixel-perfect vertical alignment with the original PDF layout
          const firstLineBaselineY = (obj.baseline !== undefined)
            ? (obj.baseline - obj.top)
            : (layout.lines[0]?.y || (fontSize * 0.8));
          const layoutFirstLineY = layout.lines[0]?.y || (fontSize * 0.8);
          const baselineShift = firstLineBaselineY - layoutFirstLineY;
          ctx.translate(0, baselineShift);

          const fontColor = (obj.fill && obj.fill !== 'transparent') ? obj.fill : (obj.originalTextData?.detectedColor || '#000000');
          ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = fontColor;
          
          // Draw solid characters character-by-character from the layout line items
          layout.lines.forEach((line: LineRun) => {
            line.glyphs.forEach((g: GlyphLayout) => {
              ctx.fillText(g.char, line.x + g.x, line.y);
            });
          });

          // 1. Draw Selection Highlights
          SelectionRenderer.drawSelection(ctx, layout, session.getSelectionStart(), session.getSelectionEnd());

          // 2. Draw Blinking Caret
          if (isEditing) {
            const start = session.getSelectionStart();
            const end = session.getSelectionEnd();
            if (start === end) {
              CaretRenderer.drawCaret(ctx, layout, session.getCaretIndex(), fontColor);
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
            const session = EditingSession.getInstance();
            const isEditing = session.getActiveObjectId() === obj.id;

            const currentText = isEditing ? session.getText() : state.text;
            const fontName = state.fontName || 'Helvetica';
            const fontSize = state.fontSize || 12;

            const cacheKey = `${currentText}_${fontName}_${fontSize}`;
            if (!(obj as any)._cachedLayout || (obj as any)._cachedLayoutKey !== cacheKey) {
              (obj as any)._cachedLayout = new TextLayout(currentText, fontName, fontSize);
              (obj as any)._cachedLayoutKey = cacheKey;
            }
            const layout = (obj as any)._cachedLayout;

            // Calculate baseline shift to ensure pixel-perfect vertical alignment with the original PDF layout
            const firstLineBaselineY = ((obj as any).baseline !== undefined && (obj as any).y !== undefined)
              ? ((obj as any).baseline - (obj as any).y)
              : (layout.lines[0]?.y || (fontSize * 0.8));
            const layoutFirstLineY = layout.lines[0]?.y || (fontSize * 0.8);
            const baselineShift = firstLineBaselineY - layoutFirstLineY;
            ctx.save();
            ctx.translate(0, baselineShift);

            ctx.font = `${fontSize}px ${fontName}`;
            ctx.fillStyle = state.fontColor || '#000000';

            // Draw actual text character-by-character based on exact compiled positions
            layout.lines.forEach((line: LineRun) => {
              line.glyphs.forEach((g: GlyphLayout) => {
                ctx.fillText(g.char, line.x + g.x, line.y);
              });
            });

            // Render selection highlights and blinking caret
            SelectionRenderer.drawSelection(ctx, layout, session.getSelectionStart(), session.getSelectionEnd());

            if (isEditing) {
              const start = session.getSelectionStart();
              const end = session.getSelectionEnd();
              if (start === end) {
                const caretColor = state.fontColor || '#000000';
                CaretRenderer.drawCaret(ctx, layout, session.getCaretIndex(), caretColor);
              }
            }
            ctx.restore();
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

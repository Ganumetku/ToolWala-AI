import type {
  TWPDFObject,
  TWPDFTextObject,
  TWPDFImageObject,
  TWPDFShapeObject,
  TWPDFHighlightObject,
  TWPDFSignatureObject,
  TWPDFAnnotationObject,
} from '@/types/twpdf';
import { isOriginalTextEdited } from '@/lib/twpdf/editor';

const FABRIC_CONTROL_PROPS = {
  borderColor: '#3b82f6',
  cornerColor: '#3b82f6',
  cornerSize: 8,
  transparentCorners: false,
};

/**
 * LegacyFabricBridge translates native ToolWala engine objects into
 * temporary Fabric-compatible objects. It serves as a compatibility bridge
 * and will be decommissioned in Phase 6.
 */
export class LegacyFabricBridge {
  /**
   * Translates a TWPDFObject into a Fabric.js compatible state object.
   * Performs validation to avoid crashing the canvas serialization.
   */
  static toFabricObject(obj: TWPDFObject): Record<string, unknown> | null {
    const isDeletedText =
      !obj.visible && obj.type === 'text' && (obj as TWPDFTextObject).isDeletedOriginal;
    
    if (isDeletedText) {
      return this.textToFabric(obj as TWPDFTextObject);
    }
    
    if (!obj.visible) return null;

    try {
      // Validate width and height dimensions
      const w = Number(obj.width);
      const h = Number(obj.height);
      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        return this.createPlaceholder(obj, 'Invalid dimensions');
      }

      switch (obj.type) {
        case 'text': {
          const txt = obj as TWPDFTextObject;
          if (typeof txt.text !== 'string') {
            return this.createPlaceholder(obj, 'Invalid text type');
          }
          return this.textToFabric(txt);
        }

        case 'image':
        case 'signature': {
          const img = obj as TWPDFImageObject | TWPDFSignatureObject;
          if (!img.src || typeof img.src !== 'string') {
            return this.createPlaceholder(obj, 'Missing image source');
          }
          return this.imageToFabric(img);
        }

        case 'shape':
          return this.shapeToFabric(obj as TWPDFShapeObject);

        case 'highlight':
          return this.highlightToFabric(obj as TWPDFHighlightObject);

        case 'annotation': {
          const ann = obj as TWPDFAnnotationObject;
          if (ann.pathData && typeof ann.pathData === 'string') {
            const parsedPath = this.parsePathData(ann.pathData);
            if (parsedPath.length > 0) {
              return this.annotationToFabricWithPath(ann, parsedPath);
            }
          }
          // Annotations with no pathData (links, widgets) map to lightweight placeholders
          return this.createPlaceholder(ann, 'Native annotation');
        }

        default:
          return this.createPlaceholder(obj, 'Unknown type');
      }
    } catch (err) {
      console.error('[LegacyFabricBridge] Error compiling object, falling back to placeholder', err);
      return this.createPlaceholder(obj, 'Compilation error');
    }
  }

  /**
   * Compiles a standard text object to Fabric textbox JSON.
   */
  private static textToFabric(obj: TWPDFTextObject): Record<string, unknown> {
    const isEdited = isOriginalTextEdited(obj);
    const detectedColor = obj.originalTextData?.detectedColor || obj.color || '#000000';

    let fill = obj.color;
    if (obj.isOriginalText) {
      if (obj.isDeletedOriginal) {
        fill = 'transparent';
      } else if (!isEdited && fill === 'transparent') {
        fill = 'transparent';
      } else if (isEdited && fill === 'transparent') {
        fill = detectedColor;
      }
    }

    return {
      type: 'textbox',
      id: obj.id,
      left: obj.x,
      top: obj.y,
      width: obj.width,
      height: obj.height,
      angle: obj.rotation,
      text: obj.text,
      fontFamily: obj.fontFamily,
      fontSize: obj.fontSize,
      fontWeight: obj.fontWeight,
      fontStyle: obj.fontStyle,
      fill,
      stroke: obj.stroke ?? 'transparent',
      strokeWidth: obj.strokeWidth ?? 1,
      textAlign: obj.alignment,
      lineHeight: obj.lineHeight,
      underline: obj.underline ?? false,
      opacity: obj.isDeletedOriginal ? 0 : (obj.opacity ?? 1),
      selectable: !obj.locked,
      visible: obj.visible,
      isOriginalText: obj.isOriginalText ?? false,
      isDeletedOriginal: obj.isDeletedOriginal ?? false,
      originalTextData: obj.originalTextData,
      backgroundColor: obj.isOriginalText && !isEdited ? 'rgba(255, 255, 255, 0.001)' : 'transparent',
      lockScalingY: true,
      styles: [],
      ...FABRIC_CONTROL_PROPS,
    };
  }

  /**
   * Compiles shapes layout properties.
   */
  private static shapeToFabric(obj: TWPDFShapeObject): Record<string, unknown> {
    const base = {
      id: obj.id,
      left: obj.x,
      top: obj.y,
      width: obj.width / (obj.scaleX ?? 1),
      height: obj.height / (obj.scaleY ?? 1),
      scaleX: obj.scaleX ?? 1,
      scaleY: obj.scaleY ?? 1,
      angle: obj.rotation,
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: obj.opacity ?? 1,
      selectable: !obj.locked,
      visible: obj.visible,
      ...FABRIC_CONTROL_PROPS,
    };

    switch (obj.shapeKind) {
      case 'circle':
        return { ...base, type: 'circle', radius: obj.width / 2 };
      case 'line':
        return { ...base, type: 'line', x1: 0, y1: 0, x2: obj.width, y2: 0 };
      case 'arrow':
        return {
          ...base,
          type: 'path',
          path: [
            ['M', 0, 0],
            ['L', 80, 0],
            ['M', 80, 0],
            ['L', 65, -8],
            ['M', 80, 0],
            ['L', 65, 8],
          ],
          fill: 'transparent',
        };
      default:
        return { ...base, type: 'rect' };
    }
  }

  /**
   * Compiles highlight components.
   */
  private static highlightToFabric(obj: TWPDFHighlightObject): Record<string, unknown> {
    return {
      type: 'rect',
      id: obj.id,
      left: obj.x,
      top: obj.y,
      width: obj.width,
      height: obj.height,
      angle: obj.rotation,
      fill: obj.color,
      stroke: 'transparent',
      strokeWidth: 0,
      opacity: obj.opacity,
      isHighlight: true,
      selectable: !obj.locked,
      visible: obj.visible,
      ...FABRIC_CONTROL_PROPS,
    };
  }

  /**
   * Compiles image blocks.
   */
  private static imageToFabric(obj: TWPDFImageObject | TWPDFSignatureObject): Record<string, unknown> {
    return {
      type: 'image',
      id: obj.id,
      left: obj.x,
      top: obj.y,
      width: obj.width / (obj.scaleX ?? 1),
      height: obj.height / (obj.scaleY ?? 1),
      scaleX: obj.scaleX ?? 1,
      scaleY: obj.scaleY ?? 1,
      angle: obj.rotation,
      src: obj.src,
      opacity: obj.opacity,
      selectable: !obj.locked,
      visible: obj.visible,
      ...FABRIC_CONTROL_PROPS,
    };
  }

  /**
   * Compiles a drawing annotation path with valid coordinates.
   */
  private static annotationToFabricWithPath(
    obj: TWPDFAnnotationObject,
    path: Array<[string, ...number[]]>
  ): Record<string, unknown> {
    return {
      type: 'path',
      id: obj.id,
      left: obj.x,
      top: obj.y,
      width: obj.width,
      height: obj.height,
      angle: obj.rotation,
      path,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      fill: obj.fill,
      opacity: obj.opacity ?? 1,
      selectable: !obj.locked,
      visible: obj.visible,
      ...FABRIC_CONTROL_PROPS,
    };
  }

  /**
   * Parses standard split path strings.
   */
  private static parsePathData(pathData: string): Array<[string, ...number[]]> {
    try {
      const tokens = pathData.split(' ');
      return tokens.reduce((acc: Array<[string, ...number[]]>, _token, i, arr) => {
        if (i % 3 === 0 && arr[i]) {
          const cmd = arr[i];
          if (cmd === 'M' || cmd === 'L') {
            const x = parseFloat(arr[i + 1]);
            const y = parseFloat(arr[i + 2]);
            if (!isNaN(x) && !isNaN(y)) {
              acc.push([cmd, x, y]);
            }
          }
        }
        return acc;
      }, []);
    } catch {
      return [];
    }
  }

  /**
   * Compiles lightweight, dashed, transparent placeholders for links, widgets,
   * highlights, comments, or form fields.
   */
  private static createPlaceholder(obj: TWPDFObject, reason: string): Record<string, unknown> {
    const annotType = (obj as any).annotType || obj.type || 'unknown';
    const rectCoords = (obj as any).rect || [obj.x, obj.y, obj.x + obj.width, obj.y + obj.height];

    return {
      type: 'rect',
      id: obj.id,
      left: obj.x,
      top: obj.y,
      width: obj.width,
      height: obj.height,
      angle: obj.rotation,
      // Translucent styling to avoid covering backgrounds
      fill: 'rgba(59, 130, 246, 0.15)',
      stroke: '#3b82f6',
      strokeWidth: 1,
      strokeDashArray: [3, 3],
      
      selectable: !obj.locked,
      visible: obj.visible,
      isPlaceholder: true,
      reason,

      // Preserve native metadata properties
      annotationType: annotType,
      rect: rectCoords,
      page: (obj as any).page || 1,
      metadata: {
        contents: (obj as any).contents,
        color: (obj as any).color,
        formName: (obj as any).formName,
        originalType: obj.type,
      },
      ...FABRIC_CONTROL_PROPS,
    };
  }
}

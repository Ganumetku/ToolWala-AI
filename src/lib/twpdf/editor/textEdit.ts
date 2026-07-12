export function isOriginalTextEdited(obj: {
  isOriginalText?: boolean;
  isDeletedOriginal?: boolean;
  text?: string;
  left?: number;
  top?: number;
  x?: number;
  y?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  fill?: string;
  color?: string;
  originalTextData?: {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    detectedColor?: string;
  };
}): boolean {
  if (!obj || !obj.isOriginalText) return false;
  const orig = obj.originalTextData;
  if (!orig) return false;

  const currentX = obj.left !== undefined ? obj.left : (obj.x !== undefined ? obj.x : 0);
  const currentY = obj.top !== undefined ? obj.top : (obj.y !== undefined ? obj.y : 0);

  const hasColorDiff = 
    (obj.fill !== undefined && obj.fill !== 'transparent' && obj.fill !== orig.detectedColor) ||
    (obj.color !== undefined && obj.color !== 'transparent' && obj.color !== orig.detectedColor);

  return !!(
    obj.isDeletedOriginal ||
    obj.text !== orig.text ||
    Math.abs(currentX - orig.x) > 2.0 ||
    Math.abs(currentY - orig.y) > 2.0 ||
    Math.abs((obj.fontSize || 0) - orig.fontSize) > 0.5 ||
    obj.fontFamily !== orig.fontFamily ||
    obj.fontWeight !== orig.fontWeight ||
    obj.fontStyle !== orig.fontStyle ||
    hasColorDiff
  );
}

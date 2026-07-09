export function isOriginalTextEdited(obj: {
  isOriginalText?: boolean;
  isDeletedOriginal?: boolean;
  text?: string;
  left?: number;
  top?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  fill?: string;
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

  return !!(
    obj.isDeletedOriginal ||
    obj.text !== orig.text ||
    Math.abs((obj.left ?? 0) - orig.x) > 0.5 ||
    Math.abs((obj.top ?? 0) - orig.y) > 0.5 ||
    obj.fontSize !== orig.fontSize ||
    obj.fontFamily !== orig.fontFamily ||
    obj.fontWeight !== orig.fontWeight ||
    obj.fontStyle !== orig.fontStyle ||
    (obj.fill !== 'transparent' && obj.fill !== orig.detectedColor)
  );
}

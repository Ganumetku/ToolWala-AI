export function convertPathToPdfSpace(
  obj: {
    originX?: string;
    originY?: string;
    scaleX?: number;
    scaleY?: number;
    pathOffset?: { x: number; y: number };
    width?: number;
    height?: number;
    left: number;
    top: number;
    path: Array<[string, ...number[]]>;
  },
  pdfPageHeight: number
): string {
  const originX = obj.originX || 'left';
  const originY = obj.originY || 'top';
  const scaleX = obj.scaleX || 1;
  const scaleY = obj.scaleY || 1;
  const pathOffset = obj.pathOffset || { x: 0, y: 0 };
  const width = obj.width || 0;
  const height = obj.height || 0;

  const centerX = originX === 'left' ? obj.left + (width * scaleX) / 2 : obj.left;
  const centerY = originY === 'top' ? obj.top + (height * scaleY) / 2 : obj.top;

  const pdfPathSegments = obj.path.map((seg) => {
    const cmd = seg[0];
    if (cmd === 'M' || cmd === 'L') {
      const px = seg[1];
      const py = seg[2];
      const absX = centerX + (px - pathOffset.x) * scaleX;
      const absY = centerY + (py - pathOffset.y) * scaleY;
      return [cmd, absX, pdfPageHeight - absY];
    } else if (cmd === 'C') {
      const px1 = seg[1],
        py1 = seg[2];
      const px2 = seg[3],
        py2 = seg[4];
      const px3 = seg[5],
        py3 = seg[6];
      const absX1 = centerX + (px1 - pathOffset.x) * scaleX;
      const absY1 = centerY + (py1 - pathOffset.y) * scaleY;
      const absX2 = centerX + (px2 - pathOffset.x) * scaleX;
      const absY2 = centerY + (py2 - pathOffset.y) * scaleY;
      const absX3 = centerX + (px3 - pathOffset.x) * scaleX;
      const absY3 = centerY + (py3 - pathOffset.y) * scaleY;
      return [
        cmd,
        absX1,
        pdfPageHeight - absY1,
        absX2,
        pdfPageHeight - absY2,
        absX3,
        pdfPageHeight - absY3,
      ];
    } else if (cmd === 'Q') {
      const px1 = seg[1],
        py1 = seg[2];
      const px2 = seg[3],
        py2 = seg[4];
      const absX1 = centerX + (px1 - pathOffset.x) * scaleX;
      const absY1 = centerY + (py1 - pathOffset.y) * scaleY;
      const absX2 = centerX + (px2 - pathOffset.x) * scaleX;
      const absY2 = centerY + (py2 - pathOffset.y) * scaleY;
      return [cmd, absX1, pdfPageHeight - absY1, absX2, pdfPageHeight - absY2];
    }
    return seg;
  });

  return pdfPathSegments.map((seg) => seg.join(' ')).join(' ');
}

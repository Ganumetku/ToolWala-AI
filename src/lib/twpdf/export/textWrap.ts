export function wrapText(
  text: string,
  maxWidth: number,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  fontSize: number
): string[] {
  if (!text) return [''];
  if (!(maxWidth > 0)) return [text];

  const paragraphs = text.split('\n');
  const lines: string[] = [];

  const pushWrappedToken = (token: string) => {
    if (font.widthOfTextAtSize(token, fontSize) <= maxWidth) {
      lines.push(token);
      return;
    }
    const chars = Array.from(token);
    let chunk = '';
    for (const ch of chars) {
      const test = chunk + ch;
      if (chunk && font.widthOfTextAtSize(test, fontSize) > maxWidth) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk = test;
      }
    }
    if (chunk) lines.push(chunk);
  };

  for (const para of paragraphs) {
    const words = para.split(/(\s+)/).filter((w) => w.length > 0);
    let currentLine = '';

    for (const word of words) {
      if (/^\s+$/.test(word)) {
        if (currentLine) currentLine += word;
        continue;
      }
      const testLine = currentLine ? `${currentLine}${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine.replace(/\s+$/g, ''), fontSize);
      if (testWidth > maxWidth && currentLine.trim()) {
        lines.push(currentLine.trimEnd());
        currentLine = '';
        if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
          pushWrappedToken(word);
        } else {
          currentLine = word;
        }
      } else if (!currentLine && font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        pushWrappedToken(word);
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trimEnd());
    } else if (para === '') {
      lines.push('');
    }
  }

  return lines.length > 0 ? lines : [text];
}

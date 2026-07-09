export function wrapText(
  text: string,
  maxWidth: number,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  fontSize: number
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  return lines;
}

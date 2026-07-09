export function mapPdfFontToWebFont(fontName: string, resolvedFontFamily?: string): string {
  const name = `${fontName || ''} ${resolvedFontFamily || ''}`.toLowerCase();
  if (
    name.includes('times') ||
    name.includes('serif') ||
    name.includes('cambria') ||
    name.includes('georgia') ||
    name.includes('minion')
  ) {
    return 'Times New Roman';
  }
  if (
    name.includes('courier') ||
    name.includes('mono') ||
    name.includes('consolas') ||
    name.includes('courier new')
  ) {
    return 'Courier';
  }
  return 'Arial';
}

export function mapPdfFontToLoadedFont(fontName: string, resolvedFontFamily?: string): string {
  if (!fontName) return '';

  const match = fontName.match(/^g_d(\d+)_f(\d+)$/);
  if (match) {
    const docId = match[1];
    const fontId = parseInt(match[2], 10);
    const loadedFontFamily = `g_d${docId}_sf${fontId + 1}`;

    if (typeof document !== 'undefined' && document.fonts) {
      let isLoaded = false;
      document.fonts.forEach((f) => {
        if (f.family === loadedFontFamily) {
          isLoaded = true;
        }
      });
      if (isLoaded) {
        return loadedFontFamily;
      }
    }

    return loadedFontFamily;
  }

  if (
    resolvedFontFamily &&
    !['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'].includes(
      resolvedFontFamily.toLowerCase()
    )
  ) {
    return resolvedFontFamily;
  }

  return '';
}

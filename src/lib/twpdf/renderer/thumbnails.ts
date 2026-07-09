export async function generateThumbnails(doc: any): Promise<Record<number, string>> {
  const thumbs: Record<number, string> = {};
  for (let i = 1; i <= doc.numPages; i++) {
    try {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 0.15 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        thumbs[i] = canvas.toDataURL();
      }
    } catch (err) {
      console.error(`Thumbnail failed for page ${i}`, err);
    }
  }
  return thumbs;
}

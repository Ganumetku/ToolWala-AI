export function generateObjectId(prefix = 'obj'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function nowTimestamp(): number {
  return Date.now();
}

export function cloneDocument<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export function findPageIndex(doc: { pages: Array<{ id: string }> }, pageId: string): number {
  return doc.pages.findIndex((p) => p.id === pageId);
}

export function findPage<T extends { id: string }>(
  pages: T[],
  pageId: string
): T | undefined {
  return pages.find((p) => p.id === pageId);
}

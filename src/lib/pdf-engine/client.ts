export type EngineSpan = {
  id: string;
  page: number;
  text: string;
  bbox: [number, number, number, number];
  origin: [number, number];
  font_size: number;
  font_name: string;
  color: [number, number, number];
  bold: boolean;
  italic: boolean;
};

export type TextEditPayload = {
  page: number;
  new_text: string;
  span_id?: string;
  text?: string;
  bbox?: [number, number, number, number];
};

export async function extractPdfViaEngine(file: File): Promise<{ page_count: number; spans: EngineSpan[] }> {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/pdf-engine/extract/', { method: 'POST', body });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

export async function applyPdfEditsViaEngine(file: File, edits: TextEditPayload[]): Promise<Blob> {
  const body = new FormData();
  body.append('file', file);
  body.append('edits', JSON.stringify({ edits }));
  const res = await fetch('/api/pdf-engine/apply/', { method: 'POST', body });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.blob();
}

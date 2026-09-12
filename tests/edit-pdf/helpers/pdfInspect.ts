import { createCanvas, DOMMatrix, ImageData as NapiImageData, Path2D } from '@napi-rs/canvas';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

if (!(globalThis as unknown as { DOMMatrix?: unknown }).DOMMatrix) {
  (globalThis as unknown as { DOMMatrix: typeof DOMMatrix }).DOMMatrix = DOMMatrix;
}
if (!(globalThis as unknown as { Path2D?: unknown }).Path2D) {
  (globalThis as unknown as { Path2D: typeof Path2D }).Path2D = Path2D;
}
if (!(globalThis as unknown as { ImageData?: unknown }).ImageData) {
  (globalThis as unknown as { ImageData: typeof NapiImageData }).ImageData = NapiImageData;
}

type Pdfjs = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

let pdfjsPromise: Promise<Pdfjs> | null = null;

async function loadPdfjs(): Promise<Pdfjs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.mjs').then((pdfjs) => {
      const worker = path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(worker).href;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(Math.max(1, Math.floor(width)), Math.max(1, Math.floor(height)));
    return { canvas, context: canvas.getContext('2d') };
  }
  reset(canvasAndContext: { canvas: { width: number; height: number } }, width: number, height: number) {
    canvasAndContext.canvas.width = Math.max(1, Math.floor(width));
    canvasAndContext.canvas.height = Math.max(1, Math.floor(height));
  }
  destroy(canvasAndContext: { canvas: { width: number; height: number } }) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  }
}

export async function openPdf(data: Uint8Array | Buffer) {
  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({
    data: data instanceof Buffer ? new Uint8Array(data) : data.slice(),
    isOffscreenCanvasSupported: false,
    verbosity: 0,
  });
  return loadingTask.promise;
}

export async function rasterizePdfPage(
  data: Uint8Array | Buffer,
  pageNumber = 1,
  scale = 1.5
): Promise<{ png: Buffer; width: number; height: number; pageHeightPt: number }> {
  const pdf = await openPdf(data);
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const factory = new NodeCanvasFactory();
  const { canvas, context } = factory.create(viewport.width, viewport.height);
  await page.render({
    canvasContext: context as unknown as CanvasRenderingContext2D,
    viewport,
    canvas: canvas as unknown as HTMLCanvasElement,
  }).promise;
  const png = canvas.toBuffer('image/png') as Buffer;
  return { png, width: canvas.width, height: canvas.height, pageHeightPt: viewport.height / scale };
}

export async function extractPdfText(data: Uint8Array | Buffer, pageNumber = 1): Promise<string> {
  const pdf = await openPdf(data);
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  return content.items
    .map((item) => ('str' in item ? String(item.str) : ''))
    .join(' ');
}

export async function extractPdfItems(data: Uint8Array | Buffer, pageNumber = 1) {
  const pdf = await openPdf(data);
  const page = await pdf.getPage(pageNumber);
  await page.getOperatorList();
  const content = await page.getTextContent();
  const items: Array<{
    str: string;
    transform: number[];
    fontName: string;
    fontObjectName?: string;
    bold?: boolean;
    angleDeg: number;
  }> = [];
  for (const raw of content.items) {
    if (!('str' in raw) || !raw.str) continue;
    const item = raw as { str: string; transform: number[]; fontName: string };
    let fontObj: { name?: string; bold?: boolean } | null = null;
    try {
      fontObj = (page.commonObjs.get(item.fontName) as { name?: string; bold?: boolean }) || null;
    } catch {
      fontObj = null;
    }
    const t = item.transform;
    const angleDeg = (Math.atan2(t[1], t[0]) * 180) / Math.PI;
    items.push({
      str: item.str,
      transform: t,
      fontName: item.fontName,
      fontObjectName: fontObj?.name,
      bold: fontObj?.bold,
      angleDeg,
    });
  }
  return items;
}

export function pdfPointToPngPixel(
  xPt: number,
  yPt: number,
  pageHeightPt: number,
  scale: number
): { x: number; y: number } {
  return { x: Math.round(xPt * scale), y: Math.round((pageHeightPt - yPt) * scale) };
}

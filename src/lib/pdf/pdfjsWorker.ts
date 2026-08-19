/**
 * Shared loader and worker configuration for pdfjs-dist.
 * Uses local same-origin worker (/pdf.worker.min.mjs) to prevent
 * browser cross-origin Web Worker blocks and CSP violations.
 */

export function configurePdfjsWorker(pdfjsLib: any) {
  if (!pdfjsLib || typeof window === 'undefined') return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export async function loadPdfJs() {
  const lib = await import('pdfjs-dist');
  configurePdfjsWorker(lib);
  return lib;
}

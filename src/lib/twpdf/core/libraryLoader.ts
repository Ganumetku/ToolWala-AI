export async function loadPdfLibraries(): Promise<{
  pdfjs: typeof import('pdfjs-dist');
  fabricLib: typeof import('fabric').fabric;
}> {
  const pLib = await import('pdfjs-dist');
  pLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pLib.version}/build/pdf.worker.min.mjs`;

  const fLib = await import('fabric');

  return {
    pdfjs: pLib,
    fabricLib: fLib.fabric,
  };
}

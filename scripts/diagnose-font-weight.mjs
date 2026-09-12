/**
 * Step 1/2 diagnostic: mixed-weight PDF → pdf.js font names/flags → current vs proposed weight.
 * Run: node scripts/diagnose-font-weight.mjs
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

function currentNameBold(name) {
  const n = name.toLowerCase();
  return (
    n.includes('bold') ||
    n.includes('black') ||
    n.includes('heavy') ||
    n.includes('semibold') ||
    n.includes('w700') ||
    n.includes('w-700')
  );
}

function proposedNumeric(name, fontObj) {
  const n = `${name} ${fontObj?.name || ''} ${fontObj?.fallbackName || ''}`.toLowerCase();
  const numeric =
    (typeof fontObj?.fontWeight === 'number' && fontObj.fontWeight) ||
    (typeof fontObj?.weight === 'number' && fontObj.weight) ||
    null;
  if (numeric && numeric >= 100 && numeric <= 1000) return numeric;
  if (fontObj?.black === true || /\b(black|heavy|extrabold|ultra)\b/.test(n)) return 900;
  if (fontObj?.bold === true || n.includes('bold') || n.includes('demibold') || n.includes('semibold')) {
    if (n.includes('semibold') || n.includes('demibold') || n.includes('semi-bold')) return 600;
    return 700;
  }
  if (n.includes('medium')) return 500;
  if (n.includes('light') || n.includes('thin') || n.includes('hairline')) return 300;
  if (n.includes('regular') || n.includes('book') || n.includes('roman')) return 400;
  const flags = typeof fontObj?.flags === 'number' ? fontObj.flags : 0;
  if (flags & (1 << 17)) return 700;
  return 400;
}

async function main() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 500]);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const times = await doc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);

  let y = 450;
  const lines = [
    { label: 'Regular', font: helv, text: 'Weight Regular Helvetica' },
    { label: 'Bold', font: helvBold, text: 'Weight Bold Helvetica' },
    { label: 'TimesRoman', font: times, text: 'Weight Regular Times' },
    { label: 'TimesBold', font: timesBold, text: 'Weight Bold Times' },
  ];
  for (const line of lines) {
    page.drawText(line.text, { x: 40, y, size: 16, font: line.font, color: rgb(0, 0, 0) });
    y -= 28;
  }

  page.drawText('Weight StrokeSim Helvetica', { x: 40, y, size: 16, font: helv, color: rgb(0, 0, 0) });

  const notoPath = path.resolve('public/fonts/noto/NotoSans-Bold.ttf');
  const notoRegPath = path.resolve('public/fonts/noto/NotoSans-Regular.ttf');
  const fontkit = (await import('@pdf-lib/fontkit')).default;
  doc.registerFontkit(fontkit);
  const notoBold = await doc.embedFont(readFileSync(notoPath), { subset: true });
  const notoReg = await doc.embedFont(readFileSync(notoRegPath), { subset: true });
  y -= 28;
  page.drawText('Weight Noto Regular', { x: 40, y, size: 16, font: notoReg, color: rgb(0, 0, 0) });
  y -= 28;
  page.drawText('Weight Noto Bold', { x: 40, y, size: 16, font: notoBold, color: rgb(0, 0, 0) });

  const bytes = await doc.save();

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
    path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
  ).toString();

  const loadingTask = pdfjs.getDocument({ data: bytes.slice() });
  const pdf = await loadingTask.promise;
  const pdfPage = await pdf.getPage(1);
  const textContent = await pdfPage.getTextContent();
  await pdfPage.getOperatorList();

  console.log('--- STEP 2: per-run font signals vs current detector ---\n');
  const rows = [];
  for (const item of textContent.items) {
    if (!item.str || !item.str.trim()) continue;
    let fontObj = null;
    try {
      fontObj = pdfPage.commonObjs.get(item.fontName) || null;
    } catch {
      fontObj = null;
    }
    const style = textContent.styles?.[item.fontName];
    const nameBlob = `${item.fontName} ${style?.fontFamily || ''} ${fontObj?.name || ''} ${fontObj?.fallbackName || ''}`;
    const flags = fontObj?.flags;
    const current = currentNameBold(nameBlob) || fontObj?.bold === true || fontObj?.black === true;
    const proposed = proposedNumeric(nameBlob, fontObj);
    rows.push({
      text: item.str,
      fontName: item.fontName,
      styleFamily: style?.fontFamily,
      objName: fontObj?.name,
      fallbackName: fontObj?.fallbackName,
      boldFlag: fontObj?.bold,
      blackFlag: fontObj?.black,
      flags,
      fontWeightField: fontObj?.fontWeight ?? fontObj?.weight,
      currentBucket: current ? 'bold' : 'normal',
      proposedWeight: proposed,
    });
  }
  console.table(rows.map((r) => ({
    text: r.text,
    fontName: r.fontName,
    objName: r.objName,
    boldFlag: r.boldFlag,
    current: r.currentBucket,
    proposed: r.proposedWeight,
  })));
  console.log('\nRaw objects (keys):');
  for (const r of rows) {
    console.log(r.text, '→', {
      fontName: r.fontName,
      styleFamily: r.styleFamily,
      objName: r.objName,
      fallbackName: r.fallbackName,
      boldFlag: r.boldFlag,
      blackFlag: r.blackFlag,
      flags: r.flags,
      fontWeightField: r.fontWeightField,
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

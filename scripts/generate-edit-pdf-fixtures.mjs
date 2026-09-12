/**
 * Generate synthetic Edit PDF fixtures (OFL Noto + Standard 14).
 * Run: node scripts/generate-edit-pdf-fixtures.mjs
 */
import 'regenerator-runtime/runtime.js';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'test-fixtures/edit-pdf');
const markers = JSON.parse(readFileSync(path.join(outDir, 'markers.json'), 'utf8'));
const BORDER = rgb(0.08, 0.16, 0.45);
const PAGE = { width: 595, height: 842 };

mkdirSync(outDir, { recursive: true });

async function withNoto(doc) {
  const fontkit = (await import('@pdf-lib/fontkit')).default;
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(
    readFileSync(path.join(root, 'public/fonts/noto/NotoSans-Regular.ttf')),
    { subset: false }
  );
  const bold = await doc.embedFont(
    readFileSync(path.join(root, 'public/fonts/noto/NotoSans-Bold.ttf')),
    { subset: false }
  );
  const devanagari = await doc.embedFont(
    readFileSync(path.join(root, 'public/fonts/noto/NotoSansDevanagari-Regular.ttf')),
    { subset: false }
  );
  const devanagariBold = await doc.embedFont(
    readFileSync(path.join(root, 'public/fonts/noto/NotoSansDevanagari-Bold.ttf')),
    { subset: false }
  );
  return { regular, bold, devanagari, devanagariBold };
}

async function digitalInvoice() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE.width, PAGE.height]);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  page.drawText('Invoice #TW-1001', { x: 50, y: 780, size: 18, font: helvBold, color: rgb(0, 0, 0) });
  page.drawText('Acme Supplies Pvt Ltd', { x: 50, y: 756, size: 11, font: helv, color: rgb(0.2, 0.2, 0.2) });

  const table = { x: 50, y: 520, w: 495, h: 90 };
  page.drawRectangle({
    x: table.x,
    y: table.y,
    width: table.w,
    height: table.h,
    borderColor: BORDER,
    borderWidth: 1.5,
    color: rgb(1, 1, 1),
  });
  page.drawLine({
    start: { x: table.x, y: table.y + 60 },
    end: { x: table.x + table.w, y: table.y + 60 },
    thickness: 1.5,
    color: BORDER,
  });
  page.drawLine({
    start: { x: table.x + 220, y: table.y },
    end: { x: table.x + 220, y: table.y + table.h },
    thickness: 1.5,
    color: BORDER,
  });
  page.drawText('Item', { x: 60, y: table.y + 68, size: 10, font: helvBold, color: BORDER });
  page.drawText('Amount', { x: 280, y: table.y + 68, size: 10, font: helvBold, color: BORDER });
  page.drawText(markers.invoiceEdit, { x: 60, y: table.y + 28, size: 12, font: helv, color: rgb(0, 0, 0) });
  page.drawText(markers.invoiceKeep, { x: 280, y: table.y + 28, size: 12, font: helvBold, color: rgb(0, 0, 0) });
  writeFileSync(path.join(outDir, 'digital-invoice.pdf'), await doc.save());
}

async function hindiForm() {
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([PAGE.width, PAGE.height]);
  page.drawText('HINDI-WRAP-TARGET', { x: 50, y: 760, size: 14, font: helv, color: rgb(0, 0, 0) });
  page.drawText('English keep line', { x: 50, y: 720, size: 12, font: helv, color: rgb(0, 0, 0) });
  writeFileSync(path.join(outDir, 'hindi-form.pdf'), await doc.save());
}

async function scannedNoText() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE.width, PAGE.height]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: rgb(0.93, 0.93, 0.9) });
  page.drawRectangle({ x: 80, y: 200, width: 435, height: 500, color: rgb(0.85, 0.85, 0.82) });
  writeFileSync(path.join(outDir, 'scanned-no-text.pdf'), await doc.save());
}

async function mixedScanDigital() {
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const page1 = doc.addPage([PAGE.width, PAGE.height]);
  page1.drawText(markers.digitalKeep, { x: 50, y: 760, size: 14, font: helv, color: rgb(0, 0, 0) });
  page1.drawText(markers.invoiceEdit, { x: 50, y: 720, size: 14, font: helv, color: rgb(0, 0, 0) });
  const page2 = doc.addPage([PAGE.width, PAGE.height]);
  page2.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: rgb(0.9, 0.9, 0.88) });
  writeFileSync(path.join(outDir, 'mixed-scan-digital.pdf'), await doc.save());
}

async function rotatedStamp() {
  const doc = await PDFDocument.create();
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([PAGE.width, PAGE.height]);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('Letterhead body text stays', { x: 50, y: 780, size: 12, font: helv, color: rgb(0, 0, 0) });
  page.drawText(markers.rotatedStamp, {
    x: 180,
    y: 420,
    size: 18,
    font: helvBold,
    color: rgb(0.7, 0.05, 0.05),
    rotate: degrees(35),
  });
  writeFileSync(path.join(outDir, 'rotated-stamp.pdf'), await doc.save());
}

async function multiColumn() {
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([PAGE.width, PAGE.height]);
  page.drawText(markers.colLeft, { x: 50, y: 700, size: 12, font: helv, color: rgb(0, 0, 0) });
  page.drawText('Left column paragraph one.', { x: 50, y: 680, size: 11, font: helv, color: rgb(0, 0, 0) });
  page.drawText(markers.colRight, { x: 340, y: 700, size: 12, font: helv, color: rgb(0, 0, 0) });
  page.drawText('Right column paragraph two.', { x: 340, y: 680, size: 11, font: helv, color: rgb(0, 0, 0) });
  writeFileSync(path.join(outDir, 'multi-column.pdf'), await doc.save());
}

async function fontWeightMix() {
  const doc = await PDFDocument.create();
  const { regular, bold } = await withNoto(doc);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([PAGE.width, PAGE.height]);
  const lines = [
    { text: markers.weightRegular, font: helv, y: 760 },
    { text: markers.weightMedium, font: regular, y: 720 },
    { text: markers.weightSemibold, font: bold, y: 680 },
    { text: markers.weightBold, font: helvBold, y: 640 },
    { text: markers.weightBlack, font: bold, y: 600 },
  ];
  for (const line of lines) {
    page.drawText(`The same sentence ${line.text}`, {
      x: 50,
      y: line.y,
      size: 14,
      font: line.font,
      color: rgb(0, 0, 0),
    });
  }
  writeFileSync(path.join(outDir, 'font-weight-mix.pdf'), await doc.save());
}

async function longOverflow() {
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([PAGE.width, PAGE.height]);
  page.drawText('Header stays put', { x: 50, y: 780, size: 12, font: helv, color: rgb(0, 0, 0) });
  page.drawText(markers.shortRun, { x: 50, y: 700, size: 14, font: helv, color: rgb(0, 0, 0) });
  writeFileSync(path.join(outDir, 'long-overflow.pdf'), await doc.save());
}

await digitalInvoice();
await hindiForm();
await scannedNoText();
await mixedScanDigital();
await rotatedStamp();
await multiColumn();
await fontWeightMix();
await longOverflow();
console.log('Wrote fixtures to', outDir);

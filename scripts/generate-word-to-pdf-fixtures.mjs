/**
 * Representative DOCX fixtures for Word → PDF conversion tests.
 * Run: node scripts/generate-word-to-pdf-fixtures.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  PageNumber,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'test-fixtures/word-to-pdf');
mkdirSync(outDir, { recursive: true });

const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 8, color: '1F2937' },
  bottom: { style: BorderStyle.SINGLE, size: 8, color: '1F2937' },
  left: { style: BorderStyle.SINGLE, size: 8, color: '1F2937' },
  right: { style: BorderStyle.SINGLE, size: 8, color: '1F2937' },
};

function makeLogoPng() {
  const canvas = createCanvas(240, 96);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1D4ED8';
  ctx.fillRect(0, 0, 240, 96);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('LOGO', 72, 58);
  return canvas.toBuffer('image/png');
}

const logoPng = makeLogoPng();

function para(text, opts = {}) {
  return new Paragraph({
    ...opts,
    children: [
      new TextRun({
        text,
        font: opts.font || 'Calibri',
        size: opts.size || 22,
        bold: opts.bold,
        italics: opts.italics,
        color: opts.color,
      }),
    ],
  });
}

async function writeDoc(name, doc) {
  const buf = await Packer.toBuffer(doc);
  const filePath = path.join(outDir, name);
  writeFileSync(filePath, buf);
  console.log('wrote', path.relative(root, filePath), `(${buf.length} bytes)`);
}

await writeDoc(
  '01-fonts-sizes.docx',
  new Document({
    sections: [
      {
        children: [
          para('Calibri 11 pt body copy for a simple letter.', { font: 'Calibri', size: 22 }),
          para('Arial 14 pt heading-sized line.', { font: 'Arial', size: 28, bold: true }),
          para('Times New Roman 12 pt serif paragraph used in reports.', { font: 'Times New Roman', size: 24 }),
          para('Georgia 16 pt italic quote line.', { font: 'Georgia', size: 32, italics: true }),
          para('Courier New 10 pt mono snippet: const x = 42;', { font: 'Courier New', size: 20, color: '1D4ED8' }),
        ],
      },
    ],
  })
);

await writeDoc(
  '02-headings-justified.docx',
  new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Centered Heading One', bold: true, font: 'Calibri', size: 36 })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Centered Heading Two', bold: true, font: 'Calibri', size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 240, line: 360 },
            children: [
              new TextRun({
                text: 'This justified paragraph should keep even left and right edges. Word wraps the line using the original font metrics. The converter must not collapse it into ragged left Helvetica on a guessed page size. Extra sentences give the layout engine enough words to demonstrate wrapping across the full content width of the page.',
                font: 'Calibri',
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: 'Right-aligned sign-off — ToolWala QA', italics: true, font: 'Calibri', size: 22 })],
          }),
        ],
      },
    ],
  })
);

await writeDoc(
  '03-tables.docx',
  new Document({
    sections: [
      {
        children: [
          para('Table with uneven column widths and borders.', { bold: true, size: 24 }),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [4680, 2340, 2340],
            rows: [
              new TableRow({
                children: ['Item', 'Qty', 'Amount'].map(
                  (label) =>
                    new TableCell({
                      width: { size: label === 'Item' ? 4680 : 2340, type: WidthType.DXA },
                      borders: cellBorder,
                      shading: { fill: 'DBEAFE' },
                      children: [para(label, { bold: true, size: 20 })],
                    })
                ),
              }),
              ...[
                ['A4 Bond paper ream', '12', '₹2,400'],
                ['Stapler (heavy duty)', '2', '₹650'],
                ['Archive box', '8', '₹1,120'],
              ].map(
                (cells) =>
                  new TableRow({
                    children: cells.map(
                      (value, idx) =>
                        new TableCell({
                          width: { size: idx === 0 ? 4680 : 2340, type: WidthType.DXA },
                          borders: cellBorder,
                          children: [para(value, { size: 20 })],
                        })
                    ),
                  })
              ),
            ],
          }),
        ],
      },
    ],
  })
);

await writeDoc(
  '04-images.docx',
  new Document({
    sections: [
      {
        children: [
          para('Document with an embedded PNG at a fixed size.', { size: 24, bold: true }),
          new Paragraph({
            spacing: { before: 200, after: 200 },
            children: [
              new ImageRun({
                type: 'png',
                data: logoPng,
                transformation: { width: 180, height: 72 },
              }),
            ],
          }),
          para('Caption under the image: brand mark at 180×72 CSS pixels.', { italics: true, size: 20, color: '4B5563' }),
        ],
      },
    ],
  })
);

await writeDoc(
  '05-lists.docx',
  new Document({
    sections: [
      {
        children: [
          para('Bullet list', { bold: true, size: 24 }),
          new Paragraph({ text: 'Prepare the brief', bullet: { level: 0 } }),
          new Paragraph({ text: 'Collect source files', bullet: { level: 0 } }),
          new Paragraph({ text: 'Nested check for indent', bullet: { level: 1 } }),
          para('Numbered list', { bold: true, size: 24 }),
          new Paragraph({ text: 'Open the Word file', numbering: { reference: 'num-list', level: 0 } }),
          new Paragraph({ text: 'Convert to PDF', numbering: { reference: 'num-list', level: 0 } }),
          new Paragraph({ text: 'Open the PDF and compare pages', numbering: { reference: 'num-list', level: 0 } }),
        ],
      },
    ],
    numbering: {
      config: [
        {
          reference: 'num-list',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
  })
);

await writeDoc(
  '06-header-footer.docx',
  new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'ToolWala QA Pack', italics: true, size: 18, color: '6B7280' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                  new TextRun({ text: ' of ', size: 18 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: [
          para('Body text on a page that also has a header and a page-number footer.', { size: 24 }),
          para('The header should read “ToolWala QA Pack” on the right.', { size: 22 }),
        ],
      },
    ],
  })
);

await writeDoc(
  '07-page-breaks.docx',
  new Document({
    sections: [
      {
        children: [
          para('Page one — unique marker ALPHA-PAGE-1.', { size: 28, bold: true, color: '1D4ED8' }),
          new Paragraph({ children: [new PageBreak()] }),
          para('Page two — unique marker BRAVO-PAGE-2.', { size: 28, bold: true, color: '059669' }),
          new Paragraph({ children: [new PageBreak()] }),
          para('Page three — unique marker CHARLIE-PAGE-3.', { size: 28, bold: true, color: 'B45309' }),
        ],
      },
    ],
  })
);

await writeDoc(
  '08-landscape-margins.docx',
  new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: {
              top: 720,
              right: 1440,
              bottom: 720,
              left: 2160,
            },
          },
        },
        children: [
          para('Landscape page with a 1.5" left margin and 1" right margin.', { size: 28, bold: true }),
          para('The PDF page should be wider than it is tall. Body text starts further in from the left than a default Word letter.', {
            size: 22,
          }),
        ],
      },
    ],
  })
);

console.log('Done.');

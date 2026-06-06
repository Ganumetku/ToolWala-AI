import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  ImageRun,
  PageBreak,
  BorderStyle
} from 'docx';
import { ExtractedPage, ExtractedLine, ConversionMode } from '../types';

/**
 * Helper to convert Base64 Data URL to Uint8Array for docx ImageRun
 */
function dataURLToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Checks if a string matches common resume or report section headers
 */
function isSectionHeading(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  const sectionKeywords = [
    'summary', 'skills', 'experience', 'projects', 'achievements',
    'education', 'certifications', 'work experience', 'professional experience',
    'technical skills', 'publications', 'languages', 'interests', 'profile'
  ];
  return sectionKeywords.some(keyword => normalized === keyword || normalized.startsWith(keyword + ':'));
}

/**
 * Clamp function for coordinate bounds
 */
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

/**
 * Generates a DOCX blob from extracted PDF page data.
 */
export async function generateDocx(
  pages: ExtractedPage[],
  mode: ConversionMode
): Promise<Blob> {
  if (pages.length === 0) {
    throw new Error("No parsed pages found.");
  }

  // MODE 3: EXACT VISUAL MATCH
  if (mode === 'visual') {
    // Generate sections: One section per page, zero margins, exact dimensions
    const sections = pages.map((page, idx) => {
      if (!page.imageData) {
        throw new Error(`Page ${page.pageNum} does not have rendered visual image data.`);
      }

      const imageBytes = dataURLToUint8Array(page.imageData);

      return {
        properties: {
          page: {
            size: {
              width: page.pageWidth * 20, // 1 point = 20 DXA
              height: page.pageHeight * 20
            },
            margin: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0
            }
          }
        },
        children: [
          new Paragraph({
            spacing: { before: 0, after: 0, line: 0 },
            children: [
              new ImageRun({
                data: imageBytes,
                transformation: {
                  width: page.pageWidth,
                  height: page.pageHeight
                }
              } as any)
            ]
          })
        ]
      };
    });

    const doc = new Document({ sections });
    return await Packer.toBlob(doc);
  }

  // MODES 1 & 2: EDITABLE OR LAYOUT PRESERVE
  const docElements: any[] = [];
  const firstPage = pages[0];

  // Global default dimensions based on first page
  const pageWidthDxa = firstPage.pageWidth * 20;
  const pageHeightDxa = firstPage.pageHeight * 20;

  // Global margins (average calculation clamped safely)
  let globalMinX = 54;
  let globalMaxX = firstPage.pageWidth - 54;
  let globalMinY = 54;
  let globalMaxY = firstPage.pageHeight - 54;

  const allLines = pages.flatMap(p => p.lines);
  if (allLines.length > 0) {
    globalMinX = Math.min(...allLines.map(l => l.x).filter(x => x > 15));
    globalMaxX = Math.max(...allLines.map(l => l.x + l.width));
    globalMinY = Math.min(...allLines.map(l => l.y).filter(y => y > 15));
    globalMaxY = Math.max(...allLines.map(l => l.y + l.height));
  }

  const leftMargin = clamp(globalMinX, 36, 90);
  const rightMargin = clamp(firstPage.pageWidth - globalMaxX, 36, 90);
  const topMargin = clamp(firstPage.pageHeight - globalMaxY, 36, 90);
  const bottomMargin = clamp(globalMinY, 36, 90);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    // Page Break between pages
    if (i > 0) {
      docElements.push(
        new Paragraph({
          children: [new PageBreak()]
        })
      );
    }

    if (mode === 'layout') {
      // --- LAYOUT PRESERVE MODE ---
      let prevLine: ExtractedLine | null = null;

      for (const line of page.lines) {
        const cleanText = line.text.trim();
        if (!cleanText) continue;

        // Calculate left indentation and vertical spacing gap
        const leftIndent = Math.max(0, line.x - leftMargin);
        let beforeSpacing = 0;

        if (prevLine) {
          // Y is bottom-left, so vertical gap is (prevLine.y - prevLine.height) - line.y
          const gap = (prevLine.y - prevLine.height) - line.y;
          if (gap > 2 && gap < 200) {
            beforeSpacing = gap;
          }
        } else {
          // Top margin gap for the first line of the page
          const firstGap = (page.pageHeight - topMargin) - line.y;
          if (firstGap > 5 && firstGap < 100) {
            beforeSpacing = firstGap;
          }
        }

        // Heading detection based on font size or bold
        const isHeading = line.fontSize > 13 || (cleanText.length < 50 && line.bold && isSectionHeading(cleanText));
        
        docElements.push(
          new Paragraph({
            indent: leftIndent > 5 ? { left: Math.round(leftIndent * 20) } : undefined,
            spacing: {
              before: beforeSpacing > 0 ? Math.round(beforeSpacing * 20) : 60, // default line spacing spacing
              after: 40
            },
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: cleanText,
                bold: line.bold || isHeading,
                size: Math.round(line.fontSize * 2), // point sizes in half-points (24 size = 12pt)
                font: "Arial"
              })
            ]
          })
        );
        prevLine = line;
      }
    } else {
      // --- EDITABLE WORD MODE ---
      let prevLine: ExtractedLine | null = null;

      for (const line of page.lines) {
        const cleanText = line.text.trim();
        if (!cleanText) continue;

        // 1. Detect Bullet/Numbered Lists
        let isBullet = false;
        let bulletText = cleanText;
        if (cleanText.startsWith('•') || cleanText.startsWith('o ') || cleanText.startsWith('- ') || cleanText.startsWith('* ')) {
          isBullet = true;
          bulletText = cleanText.replace(/^[•o\-*]\s*/, '').trim();
        } else if (/^\d+\.\s+/.test(cleanText)) {
          isBullet = true;
          bulletText = cleanText.replace(/^\d+\.\s+/, '').trim();
        }

        // 2. Detect Heading
        const isSection = isSectionHeading(cleanText) && cleanText.length < 60;
        const isHeading = !isBullet && (line.fontSize > 13 || (cleanText.length < 60 && line.bold && isSection));

        // Calculate before spacing
        let beforeSpacing = 80;
        if (isHeading) {
          beforeSpacing = 240;
        } else if (isBullet) {
          beforeSpacing = 40;
        } else if (prevLine) {
          const gap = (prevLine.y - prevLine.height) - line.y;
          if (gap > 12 && gap < 100) {
            beforeSpacing = Math.round(gap * 15); // scaled reasonably
          }
        }

        // Style header divider lines for sections
        const borderStyle = isSection ? {
          bottom: {
            color: "CCCCCC",
            space: 6,
            style: BorderStyle.SINGLE,
            size: 8
          }
        } : undefined;

        docElements.push(
          new Paragraph({
            heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
            bullet: isBullet ? { level: 0 } : undefined,
            border: borderStyle,
            spacing: {
              before: beforeSpacing,
              after: isHeading ? 100 : (isBullet ? 40 : 80),
              line: 240, // 1.0 spacing
              lineRule: "auto"
            },
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: isBullet ? bulletText : cleanText,
                bold: line.bold || isHeading,
                size: isHeading ? 26 : (line.fontSize > 11 ? 22 : 20),
                font: "Calibri"
              })
            ]
          })
        );
        prevLine = line;
      }
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: pageWidthDxa,
            height: pageHeightDxa
          },
          margin: {
            top: topMargin * 20,
            bottom: bottomMargin * 20,
            left: leftMargin * 20,
            right: rightMargin * 20
          }
        }
      },
      children: docElements
    }]
  });

  return await Packer.toBlob(doc);
}

import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

interface RichWord {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number; // pt
  color: string | null; // hex color
}

interface ParsedParagraph {
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'list-item';
  alignment: 'left' | 'center' | 'right' | 'justify';
  indent: number; // pt
  bullet: boolean;
  numbering: string | null;
  words: RichWord[];
  isPageBreak: boolean;
}

interface ParsedTableCell {
  elements: ParsedElement[];
  width: number;
}

interface ParsedTableRow {
  cells: ParsedTableCell[];
}

interface ParsedTable {
  type: 'table';
  rows: ParsedTableRow[];
}

type ParsedElement = ParsedParagraph | ParsedTable;

// Helper to get element's children namespace-agnostically
function getElementsByLocalName(parent: Element, localName: string): Element[] {
  const elements: Element[] = [];
  const walk = (node: Node) => {
    if (node.nodeType === 1) {
      const el = node as Element;
      if (el.localName === localName) {
        elements.push(el);
      }
      for (let i = 0; i < el.childNodes.length; i++) {
        walk(el.childNodes[i]);
      }
    }
  };
  for (let i = 0; i < parent.childNodes.length; i++) {
    walk(parent.childNodes[i]);
  }
  return elements;
}

function getDirectChildByLocalName(parent: Element, localName: string): Element | null {
  for (let i = 0; i < parent.childNodes.length; i++) {
    const node = parent.childNodes[i];
    if (node.nodeType === 1) {
      const el = node as Element;
      if (el.localName === localName) {
        return el;
      }
    }
  }
  return null;
}

function parseParagraph(pNode: Element): ParsedParagraph {
  let type: ParsedParagraph['type'] = 'paragraph';
  let alignment: ParsedParagraph['alignment'] = 'left';
  let indent = 0;
  let bullet = false;
  let numbering: string | null = null;
  let isPageBreak = false;

  // 1. Parse paragraph properties (pPr)
  const pPr = getDirectChildByLocalName(pNode, 'pPr');
  if (pPr) {
    // Style (Heading 1, 2, 3)
    const pStyle = getDirectChildByLocalName(pPr, 'pStyle');
    if (pStyle) {
      const styleVal = pStyle.getAttribute('w:val')?.toLowerCase() || '';
      if (styleVal.includes('heading1') || styleVal === '1') {
        type = 'heading1';
      } else if (styleVal.includes('heading2') || styleVal === '2') {
        type = 'heading2';
      } else if (styleVal.includes('heading3') || styleVal === '3') {
        type = 'heading3';
      }
    }

    // Alignment (jc)
    const jc = getDirectChildByLocalName(pPr, 'jc');
    if (jc) {
      const jcVal = jc.getAttribute('w:val')?.toLowerCase() || 'left';
      if (jcVal === 'center') alignment = 'center';
      else if (jcVal === 'right') alignment = 'right';
      else if (jcVal === 'both') alignment = 'justify';
    }

    // List Numbering (numPr)
    const numPr = getDirectChildByLocalName(pPr, 'numPr');
    if (numPr) {
      type = 'list-item';
      const ilvl = getDirectChildByLocalName(numPr, 'ilvl');
      const lvlVal = ilvl ? parseInt(ilvl.getAttribute('w:val') || '0', 10) : 0;
      indent = 24 + lvlVal * 18; // indents per list level

      const numId = getDirectChildByLocalName(numPr, 'numId');
      const numIdVal = numId ? numId.getAttribute('w:val') : '1';
      
      // Basic check: odd numId values are usually bullet lists in Word, even are numbered.
      if (numIdVal && parseInt(numIdVal, 10) % 2 === 0) {
        numbering = '1.'; // standard fall-back prefix
      } else {
        bullet = true;
      }
    }
  }

  // 2. Parse text runs (r)
  const runs = getElementsByLocalName(pNode, 'r');
  const words: RichWord[] = [];

  for (const rNode of runs) {
    // Check if run has text or page breaks
    const tNodes = getElementsByLocalName(rNode, 't');
    const brNodes = getElementsByLocalName(rNode, 'br');
    
    if (brNodes.some(br => br.getAttribute('w:type')?.toLowerCase() === 'page')) {
      isPageBreak = true;
    }

    if (tNodes.length === 0) continue;

    // Run properties (rPr)
    const rPr = getDirectChildByLocalName(rNode, 'rPr');
    let bold = false;
    let italic = false;
    let underline = false;
    let fontSize = 11; // default size
    let color: string | null = null;

    if (rPr) {
      if (getDirectChildByLocalName(rPr, 'b')) bold = true;
      if (getDirectChildByLocalName(rPr, 'i')) italic = true;
      if (getDirectChildByLocalName(rPr, 'u')) underline = true;

      // Font size is represented in half-points (sz)
      const sz = getDirectChildByLocalName(rPr, 'sz');
      if (sz) {
        const val = parseInt(sz.getAttribute('w:val') || '22', 10);
        fontSize = val / 2;
      }

      // Font Color (hex)
      const colorEl = getDirectChildByLocalName(rPr, 'color');
      if (colorEl) {
        const val = colorEl.getAttribute('w:val');
        if (val && val !== 'auto') color = `#${val}`;
      }
    }

    // Adapt sizing if standard heading styles are used but no custom font sizing exists
    if (!rPr || !getDirectChildByLocalName(rPr, 'sz')) {
      if (type === 'heading1') fontSize = 20;
      else if (type === 'heading2') fontSize = 16;
      else if (type === 'heading3') fontSize = 13;
    }

    const runText = tNodes.map(t => t.textContent || '').join('');
    
    // Split into words, preserving formatting structure
    const splitWords = runText.split(/(\s+)/);
    for (const text of splitWords) {
      if (!text) continue;
      words.push({ text, bold, italic, underline, fontSize, color });
    }
  }

  return { type, alignment, indent, bullet, numbering, words, isPageBreak };
}

function parseTable(tblNode: Element): ParsedTable {
  const rows: ParsedTableRow[] = [];
  const trNodes = getElementsByLocalName(tblNode, 'tr');

  for (const trNode of trNodes) {
    const cells: ParsedTableCell[] = [];
    const tcNodes = getDirectChildByLocalName(trNode, 'tc') 
      ? getDirectChildByLocalName(trNode, 'tc')!.parentElement!.children 
      : getElementsByLocalName(trNode, 'tc');

    // Filter direct tc children
    const directTcNodes: Element[] = [];
    for (let i = 0; i < trNode.childNodes.length; i++) {
      const child = trNode.childNodes[i];
      if (child.nodeType === 1) {
        const el = child as Element;
        if (el.nodeName === 'w:tc' || el.localName === 'tc') {
          directTcNodes.push(el);
        }
      }
    }

    for (const tcNode of directTcNodes) {
      const elements: ParsedElement[] = [];
      
      // Parse cell contents (paragraphs or nested tables)
      for (let i = 0; i < tcNode.childNodes.length; i++) {
        const child = tcNode.childNodes[i];
        if (child.nodeType === 1) {
          const el = child as Element;
          if (el.localName === 'p') {
            elements.push(parseParagraph(el));
          } else if (el.localName === 'tbl') {
            elements.push(parseTable(el));
          }
        }
      }

      // Cell width (tcW)
      const tcPr = getDirectChildByLocalName(tcNode, 'tcPr');
      let width = 1000; // default relative width
      if (tcPr) {
        const tcW = getDirectChildByLocalName(tcPr, 'tcW');
        if (tcW) {
          width = parseInt(tcW.getAttribute('w:val') || '1000', 10);
        }
      }

      cells.push({ elements, width });
    }
    
    if (cells.length > 0) {
      rows.push({ cells });
    }
  }

  return { type: 'table', rows };
}

export async function convertDocxToPdf(arrayBuffer: ArrayBuffer): Promise<Blob> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const documentXmlText = await zip.file('word/document.xml')?.async('text');
  
  if (!documentXmlText) {
    throw new Error('Invalid DOCX: missing word/document.xml');
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(documentXmlText, 'application/xml');
  const body = getElementsByLocalName(xmlDoc.documentElement, 'body')[0];

  if (!body) {
    throw new Error('Invalid DOCX: missing body structure');
  }

  // Parse elements sequentially
  const elements: ParsedElement[] = [];
  for (let i = 0; i < body.childNodes.length; i++) {
    const child = body.childNodes[i];
    if (child.nodeType === 1) {
      const el = child as Element;
      if (el.localName === 'p') {
        elements.push(parseParagraph(el));
      } else if (el.localName === 'tbl') {
        elements.push(parseTable(el));
      }
    }
  }

  // Render to PDF using jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = 595.275;
  const pageHeight = 841.89;
  const margin = 54; // 0.75 in margin (54pt)
  const contentWidth = pageWidth - margin * 2;
  const bottomThreshold = pageHeight - margin;

  let y = margin;
  let pageNumber = 1;

  const setWordStyle = (word: RichWord) => {
    let style = 'normal';
    if (word.bold && word.italic) style = 'bolditalic';
    else if (word.bold) style = 'bold';
    else if (word.italic) style = 'italic';
    
    doc.setFont('helvetica', style);
    doc.setFontSize(word.fontSize);

    if (word.color) {
      doc.setTextColor(word.color);
    } else {
      doc.setTextColor('#111827'); // custom default black
    }
  };

  const drawParagraph = (para: ParsedParagraph, startX: number, maxWidth: number): number => {
    if (para.words.length === 0) {
      return y + 12; // Empty paragraph spacing
    }

    // 1. Perform Word Wrapping
    const lines: RichWord[][] = [];
    let currentLine: RichWord[] = [];
    let currentWidth = 0;

    for (const word of para.words) {
      setWordStyle(word);
      const wordWidth = doc.getTextWidth(word.text);

      if (currentWidth + wordWidth > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [];
        currentWidth = 0;
      }

      // Skip leading whitespace on line wrapped blocks
      if (currentLine.length === 0 && word.text.trim() === '') {
        continue;
      }

      currentLine.push(word);
      currentWidth += wordWidth;
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // 2. Render Lines
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      
      // Calculate total width of the line to evaluate alignments
      let totalLineWidth = 0;
      for (const word of line) {
        setWordStyle(word);
        totalLineWidth += doc.getTextWidth(word.text);
      }

      // Determine starting x coordinate
      let lineX = startX;
      if (para.alignment === 'center') {
        lineX = startX + (maxWidth - totalLineWidth) / 2;
      } else if (para.alignment === 'right') {
        lineX = startX + (maxWidth - totalLineWidth);
      }

      // Evaluate font height spacing for line
      const maxFontSize = Math.max(...line.map(w => w.fontSize));
      const lineHeight = maxFontSize * 1.25;

      // Check page break boundary
      if (y + lineHeight > bottomThreshold) {
        doc.addPage();
        pageNumber++;
        y = margin;
      }

      // Bullet or Numbering offsets
      if (lineIndex === 0 && para.type === 'list-item') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(para.words[0].fontSize);
        doc.setTextColor('#3B82F6'); // premium accent blue bullets
        if (para.bullet) {
          doc.text('•', startX - 12, y + maxFontSize);
        } else if (para.numbering) {
          doc.text(para.numbering, startX - 16, y + maxFontSize);
        }
      }

      // Draw rich words in sequence
      let currentWordX = lineX;
      for (const word of line) {
        setWordStyle(word);
        doc.text(word.text, currentWordX, y + maxFontSize);

        if (word.underline) {
          doc.setDrawColor(word.color || '#111827');
          doc.setLineWidth(0.5);
          doc.line(currentWordX, y + maxFontSize + 1.5, currentWordX + doc.getTextWidth(word.text), y + maxFontSize + 1.5);
        }

        currentWordX += doc.getTextWidth(word.text);
      }

      y += lineHeight;
    }

    return y + 6; // Spacing after paragraph
  };

  const drawTable = (table: ParsedTable) => {
    if (table.rows.length === 0) return;

    // Evaluate cell layout column distributions
    const numCols = Math.max(...table.rows.map(r => r.cells.length));
    const colWidth = contentWidth / numCols;

    for (const row of table.rows) {
      // Step 1: Wrap cell paragraphs separately to determine total row height
      const cellHeights: number[] = [];
      
      for (let colIdx = 0; colIdx < row.cells.length; colIdx++) {
        const cell = row.cells[colIdx];
        let cellYTemp = 0;
        
        // Temporarily render text elements to measure size height
        for (const element of cell.elements) {
          if ('words' in element) {
            // Render paragraph in a virtual height block (no drawing)
            const lines: RichWord[][] = [];
            let currentLine: RichWord[] = [];
            let currentWidth = 0;

            for (const word of element.words) {
              setWordStyle(word);
              const wordWidth = doc.getTextWidth(word.text);

              if (currentWidth + wordWidth > colWidth - 16 && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = [];
                currentWidth = 0;
              }
              if (currentLine.length === 0 && word.text.trim() === '') continue;
              currentLine.push(word);
              currentWidth += wordWidth;
            }
            if (currentLine.length > 0) lines.push(currentLine);

            for (const line of lines) {
              const maxFontSize = Math.max(...line.map(w => w.fontSize));
              cellYTemp += maxFontSize * 1.25;
            }
            cellYTemp += 6; // spacing after
          }
        }
        cellHeights.push(Math.max(cellYTemp, 20)); // min height
      }

      const rowHeight = Math.max(...cellHeights) + 8; // padding top/bottom

      // Step 2: Page Break Check
      if (y + rowHeight > bottomThreshold) {
        doc.addPage();
        pageNumber++;
        y = margin;
      }

      // Step 3: Draw Cell Borders and Render Contents
      let cellX = margin;
      for (let colIdx = 0; colIdx < row.cells.length; colIdx++) {
        const cell = row.cells[colIdx];
        
        // Draw Cell boundary outline box
        doc.setDrawColor('#D1D5DB'); // light grey border
        doc.setLineWidth(0.8);
        doc.rect(cellX, y, colWidth, rowHeight);

        // Draw Cell Paragraphs inside cell borders
        let innerY = y + 6;
        const savedY = y;
        
        // Redirect y temporarily
        y = innerY;
        for (const element of cell.elements) {
          if ('words' in element) {
            y = drawParagraph(element, cellX + 8, colWidth - 16);
          }
        }
        // Restore y
        y = savedY;

        cellX += colWidth;
      }

      y += rowHeight;
    }
  };

  // Process all main parsed layout elements
  for (const element of elements) {
    if ('type' in element && element.type === 'table') {
      drawTable(element as ParsedTable);
    } else {
      const para = element as ParsedParagraph;
      
      if (para.isPageBreak) {
        doc.addPage();
        pageNumber++;
        y = margin;
      }

      const indentX = margin + para.indent;
      const wrapWidth = contentWidth - para.indent;

      // Heading spacing
      if (para.type === 'heading1') y += 10;
      else if (para.type === 'heading2') y += 8;

      y = drawParagraph(para, indentX, wrapWidth);
    }
  }

  return doc.output('blob');
}

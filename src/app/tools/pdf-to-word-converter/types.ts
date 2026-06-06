export type ConversionMode = 'editable' | 'layout' | 'visual';

export interface ExtractedTextItem {
  text: string;
  x: number;        // Transform X coordinate (translateX)
  y: number;        // Transform Y coordinate (translateY)
  fontSize: number; // Font size (scaleY or calculated size)
  width: number;    // Width of text block
  height: number;   // Height of text block
  bold: boolean;    // Detect if bold
  fontName: string; // Internal PDF font name
}

export interface ExtractedLine {
  text: string;
  x: number;        // Start X position of line
  y: number;        // Start Y position of line
  width: number;    // Total width of line content
  height: number;   // Max height in line
  fontSize: number; // Dominant font size in line
  bold: boolean;    // Contains bold text
  items: ExtractedTextItem[];
}

export interface ExtractedPage {
  pageNum: number;
  pageWidth: number;
  pageHeight: number;
  items: ExtractedTextItem[];
  lines: ExtractedLine[];
  imageData?: string; // Data URL (PNG) of rendered page for Visual Mode
}

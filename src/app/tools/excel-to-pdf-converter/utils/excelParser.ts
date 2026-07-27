import * as XLSX from 'xlsx';
import { ParsedSheet, ParsedSheetRow, ParsedSheetCell } from '../types';

export async function parseExcelWorkbook(file: File): Promise<ParsedSheet[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const parsedSheets: ParsedSheet[] = [];

  workbook.SheetNames.forEach((sheetName, index) => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return;

    // Convert sheet to 2D array of values
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    if (!rawData || rawData.length === 0) return;

    const rows: ParsedSheetRow[] = [];
    let maxCols = 0;

    rawData.forEach((rawRow, rIdx) => {
      if (rawRow.length > maxCols) {
        maxCols = rawRow.length;
      }

      const cells: ParsedSheetCell[] = rawRow.map((cellVal: any) => {
        let cellText = cellVal !== null && cellVal !== undefined ? String(cellVal).trim() : '';

        // Handle Date objects formatted cleanly
        if (cellVal instanceof Date) {
          cellText = cellVal.toISOString().split('T')[0];
        }

        const isNum = !isNaN(Number(cellText.replace(/,/g, ''))) && cellText !== '';
        const align: ParsedSheetCell['align'] = isNum ? 'right' : 'left';

        return {
          text: cellText,
          rawValue: cellVal,
          align,
          isHeader: rIdx === 0
        };
      });

      // Filter out completely empty trailing rows if necessary
      if (cells.some(c => c.text.length > 0)) {
        rows.push({
          cells,
          isHeader: rIdx === 0
        });
      }
    });

    if (rows.length > 0) {
      const headers = rows[0].cells.map((c, i) => c.text || `Column ${i + 1}`);
      parsedSheets.push({
        id: `sheet-${index + 1}`,
        name: sheetName,
        rows,
        headers,
        columnCount: maxCols,
        rowCount: rows.length,
        isSelected: true
      });
    }
  });

  return parsedSheets;
}

import { DocClassification, DocType } from '../types';

export async function classifyPdfDocument(
  pdfDoc: any,
  pdfjs: any
): Promise<DocClassification> {
  const pageCount = pdfDoc.numPages;
  const pagesToSample = Math.min(pageCount, 5);

  let totalTextItemCount = 0;
  let fullSampleText = '';
  let multiColumnLineCount = 0;

  for (let p = 1; p <= pagesToSample; p++) {
    const page = await pdfDoc.getPage(p);
    const textContent = await page.getTextContent();
    const items = textContent.items || [];
    totalTextItemCount += items.length;

    const pageStr = items.map((i: any) => i.str || '').join(' ');
    fullSampleText += ' ' + pageStr;

    // Y coordinate grouping to check line column counts
    const yMap: { [y: number]: number } = {};
    items.forEach((item: any) => {
      if (!item.str || item.str.trim().length === 0) return;
      const y = Math.round((item.transform ? item.transform[5] : 0) / 5) * 5;
      yMap[y] = (yMap[y] || 0) + 1;
    });

    Object.values(yMap).forEach(colCount => {
      if (colCount >= 2) multiColumnLineCount++;
    });
  }

  const avgItemsPerPage = totalTextItemCount / pagesToSample;
  const isScanned = avgItemsPerPage < 10;
  const isTextBased = !isScanned;
  const ocrRequired = isScanned;

  const textLower = fullSampleText.toLowerCase();

  // Pattern detection rules
  const hasInvoices = /invoice|bill to|subtotal|gstin|vat|tax invoice|amount due|invoice no/i.test(textLower);
  const hasBankStatements = /bank statement|account no|opening balance|closing balance|debit|credit|transaction|ifsc/i.test(textLower);
  const hasForms = /form|applicant|signature|date of birth|gender|father's name|declaration/i.test(textLower);
  const hasStudentRecords = /student|roll no|marks|grade|semester|gpa|attendance|university|school/i.test(textLower);
  const hasMedical = /patient|doctor|hospital|lab report|diagnosis|specimen|test result/i.test(textLower);
  const hasTables = multiColumnLineCount >= 4 || hasInvoices || hasBankStatements || hasStudentRecords;

  let docType: DocType = 'General Document';
  if (hasInvoices) docType = 'Invoice';
  else if (hasBankStatements) docType = 'Bank Statement';
  else if (hasStudentRecords) docType = 'Student Record';
  else if (hasMedical) docType = 'Medical Report';
  else if (hasForms) docType = 'Form';
  else if (hasTables) docType = 'Business Report';

  const confidenceScore = isTextBased ? (hasTables ? 98 : 94) : 85;

  return {
    isTextBased,
    isScanned,
    hasTables,
    hasForms,
    hasInvoices,
    hasBankStatements,
    ocrRequired,
    docType,
    confidenceScore,
    pageCount,
    tablesDetectedCount: hasTables ? Math.max(1, Math.round(multiColumnLineCount / 8)) : 0
  };
}

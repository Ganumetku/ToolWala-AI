import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "PDF OCR Scanner Online - Extract Text from Scanned PDF | ToolWala AI",
  description: "Convert scanned PDFs into searchable, editable text online. Free, 100% secure client-side PDF OCR scanner. Export to Word DOC or TXT formats.",
  alternates: {
    canonical: "/tools/pdf-ocr",
  },
  keywords: [
    "PDF OCR Scanner",
    "extract text from PDF",
    "scanned PDF to text",
    "online OCR PDF",
    "convert scanned PDF to Word",
    "extract characters from PDF",
    "free local PDF OCR"
  ],
  openGraph: {
    title: "PDF OCR Scanner Online - Extract Text from Scanned PDF",
    description: "Convert scanned PDFs into searchable, editable text online. Free, 100% secure client-side PDF OCR scanner. Export to Word DOC or TXT formats.",
    url: "https://toolwala.co/tools/pdf-ocr",
    type: "website"
  }
};

export default function PdfOcrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

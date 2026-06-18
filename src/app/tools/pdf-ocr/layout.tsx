import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-ocr',
    'PDF OCR Scanner Online - Extract Text from Scanned PDF | ToolWala AI',
    'Convert scanned PDFs into searchable, editable text online. Free, 100% secure client-side PDF OCR scanner. Export to Word DOC or TXT formats.',
    '/tools/pdf-ocr'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

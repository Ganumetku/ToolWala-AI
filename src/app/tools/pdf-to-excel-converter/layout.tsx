import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-to-excel-converter',
    'PDF to Excel – Extract Tables to XLSX (100MB)',
    'Pull PDF tables into Excel in the browser. Digital PDFs or scanned sheets with on-device OCR (English/Hindi). 100 MB limit. File never leaves the tab.',
    '/tools/pdf-to-excel-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'excel-to-pdf-converter',
    'Excel to PDF – XLSX, XLS, CSV to A4 PDF',
    'Convert spreadsheets to printable PDF in the browser. Multi-sheet, A4/Letter/Legal, landscape, gridlines. 100 MB. Charts not drawn. No upload.',
    '/tools/excel-to-pdf-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

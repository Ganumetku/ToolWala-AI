import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-to-excel-converter',
    'PDF to Excel Converter – Free Online | ToolWala AI',
    'Convert PDF files into editable Excel spreadsheets online for free. Extract tables, invoices, reports, bank statements and scanned PDFs while preserving rows and columns.',
    '/tools/pdf-to-excel-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

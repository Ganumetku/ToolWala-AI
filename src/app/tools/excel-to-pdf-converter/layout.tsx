import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'excel-to-pdf-converter',
    'Excel to PDF Converter – Free Online | ToolWala AI',
    'Convert Excel spreadsheets (.xlsx, .xls, .csv) into clean, formatted PDF documents online for free. Preserve table layout, formatting, gridlines, and pagination.',
    '/tools/excel-to-pdf-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-to-excel-converter',
    'PDF to Excel Converter – Convert Free | ToolWala AI',
    'Free PDF to excel converter online. Convert PDF to Excel free and extract tables into XLS/XLSX spreadsheets instantly with 100% privacy.',
    '/tools/pdf-to-excel-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

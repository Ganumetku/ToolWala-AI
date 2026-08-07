import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'excel-to-pdf-converter',
    'Excel to PDF Converter – Convert Online | ToolWala AI',
    'Convert Excel to PDF online free. Use our instant Excel to PDF converter to turn XLS & XLSX spreadsheets into print-ready PDF files securely.',
    '/tools/excel-to-pdf-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

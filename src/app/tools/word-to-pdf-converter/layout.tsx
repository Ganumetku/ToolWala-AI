import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'word-to-pdf-converter',
    'Word to PDF Converter Online Free | ToolWala AI',
    'Convert Word documents (.docx) into PDF files instantly. Free online DOCX to PDF converter with secure browser-based processing.',
    '/tools/word-to-pdf-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

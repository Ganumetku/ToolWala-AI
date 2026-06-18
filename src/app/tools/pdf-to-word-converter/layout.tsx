import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-to-word-converter',
    'PDF to Word Converter Online Free | ToolWala AI',
    'Convert PDF files into editable Word documents instantly. Free online PDF to DOCX converter with secure browser-based processing.',
    '/tools/pdf-to-word-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

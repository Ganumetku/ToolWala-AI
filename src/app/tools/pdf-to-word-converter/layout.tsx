import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-to-word-converter',
    'PDF to Word Converter – Free DOCX, 50MB, No Upload',
    'Convert a text PDF to editable .docx in your browser. 50 MB limit. Scanned PDFs need OCR first. Files stay on your device — ToolWala never uploads them.',
    '/tools/pdf-to-word-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-to-word-converter',
    'PDF to Word Converter Online Free – Instant DOCX (No Sign-up) | ToolWala',
    'Convert text PDF documents into editable Word (.docx) files right in your browser. 100% free, completely private, and files never leave your device.',
    '/tools/pdf-to-word-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

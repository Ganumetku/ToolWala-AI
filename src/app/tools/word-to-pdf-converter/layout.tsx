import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'word-to-pdf-converter',
    'Word to PDF – Convert DOCX Offline, 50MB Limit',
    'Turn a .docx file into PDF in this tab. 50 MB cap. Legacy .doc not supported. Tables and lists kept. No upload, no account.',
    '/tools/word-to-pdf-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

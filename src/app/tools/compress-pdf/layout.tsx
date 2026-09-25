import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'compress-pdf',
    'Compress PDF – Rewrite in Browser, No Upload',
    'Shrink a PDF in this tab with pdf-lib. Text files often barely move. Processing stays in the browser — files are not uploaded.',
    '/tools/compress-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'compress-pdf',
    'Compress PDF in Your Browser – No Upload',
    'Shrink a PDF on this page. Processing stays on your device — we never see the file.',
    '/tools/compress-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

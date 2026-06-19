import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'compress-pdf',
    'Compress PDF Online - Free PDF Size Reducer | ToolWala AI',
    'Reduce PDF file size online. Free, 100% secure client-side optimization. Shrink your document files instantly while keeping layout and quality.',
    '/tools/compress-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

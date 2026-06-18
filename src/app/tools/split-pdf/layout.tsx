import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'split-pdf',
    'Split PDF Online - Free PDF Page Extractor | ToolWala AI',
    'Split PDF files online in seconds. Extract specific pages or divide documents into custom ranges. Free, 100% secure client-side processing.',
    '/tools/split-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

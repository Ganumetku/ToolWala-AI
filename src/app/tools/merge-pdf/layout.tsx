import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'merge-pdf',
    'Merge PDF Online - Free PDF Combiner | ToolWala AI',
    'Combine multiple PDF documents into a single file online. Free, 100% secure client-side merging. Reorder pages and files instantly.',
    '/tools/merge-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

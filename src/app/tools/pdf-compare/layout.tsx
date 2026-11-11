import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-compare',
    'Compare Two PDF Files Online Free | PDF Diff Checker | ToolWala AI',
    'Compare two PDF files online free. Instant browser-based text diff checker highlights additions, deletions, and differences side-by-side with zero file uploads and 100% privacy.',
    '/tools/pdf-compare'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-tools',
    'Merge PDF Online – Free PDF Joiner Tool | ToolWala AI',
    'Merge PDF files online for free. Combine, compress, and split PDF documents instantly in your browser. 100% client-side security with no limits.',
    '/tools/pdf-tools'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

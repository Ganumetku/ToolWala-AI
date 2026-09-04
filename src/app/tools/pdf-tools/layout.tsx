import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-tools',
    'PDF Tools – Free Online PDF Utilities | ToolWala AI',
    'All-in-one free PDF tools online. Merge, compress, split, convert, rotate, protect, and edit PDF files instantly in your browser. 100% private & client-side.',
    '/tools/pdf-tools'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

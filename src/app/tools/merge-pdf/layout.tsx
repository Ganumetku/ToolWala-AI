import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'merge-pdf',
    'Merge PDF Online Free – Combine PDF Files in Browser | ToolWala',
    'Merge PDF files online for free. Combine 2 or more PDFs into one in your browser. No upload, no signup. Reorder pages and download instantly.',
    '/tools/merge-pdf/'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'merge-pdf',
    'Merge PDF – Combine Files in Your Browser, No Upload',
    'Join two or more PDFs in this tab. Reorder pages and download. Files never leave your device.',
    '/tools/merge-pdf/'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'split-pdf',
    'Split PDF – Custom, Ranges, or Split All',
    'Extract pages in this tab. Custom = one PDF. Ranges like 1-3, 5 = one file per block. Split All = one file per page. Files are not uploaded.',
    '/tools/split-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

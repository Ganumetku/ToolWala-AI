import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'add-page-numbers-to-pdf',
    'Add Page Numbers to PDF – Free Online Pagination Tool',
    'Add page numbers to PDF documents locally and securely. Customize positions, start pages, margins, fonts, and numbering formats.',
    '/tools/add-page-numbers-to-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

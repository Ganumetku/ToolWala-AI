import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-tools',
    'Free Online PDF Tools – Edit, Merge & Convert PDFs',
    'Powerful suite of PDF utilities. Merge, split, compress, and edit PDF documents securely directly in your browser.',
    '/tools/pdf-tools'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

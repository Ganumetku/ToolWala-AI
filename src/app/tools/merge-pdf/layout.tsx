import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'merge-pdf',
    'Merge PDF – Join 2+ Files in the Browser',
    'Join two or more PDFs in this tab. No coded MB cap. Password files often fail. Files are not uploaded.',
    '/tools/merge-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

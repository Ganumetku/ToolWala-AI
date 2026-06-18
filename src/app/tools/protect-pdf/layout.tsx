import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'protect-pdf',
    'Protect PDF Online - Password Protect & Encrypt PDF | ToolWala AI',
    'Add secure user password protection to your PDF files online. Keep sensitive documents confidential with client-side local encryption. 100% free and private.',
    '/tools/protect-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

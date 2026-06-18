import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'unlock-pdf',
    'Unlock PDF Online - Remove Password Protection from PDF | ToolWala AI',
    'Remove password protection and unlock encrypted PDF files online instantly. Fully client-side secure decryption. 100% free, private, and easy to use.',
    '/tools/unlock-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'compress-pdf-to-200kb',
    'Compress PDF to 200KB Online Free | ToolWala AI',
    'Compress PDF to 200KB online. Reduce PDF file size under 200KB locally and securely. No signups, no uploads. Safe browser-native processing.',
    '/tools/compress-pdf-to-200kb'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

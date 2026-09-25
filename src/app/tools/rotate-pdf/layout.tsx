import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'rotate-pdf',
    'Rotate PDF – All Pages 90°, 180°, or 270°',
    'Rotates every page in this tab. No thumbnail grid. One page only? Use Organize PDF. Files are not uploaded.',
    '/tools/rotate-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

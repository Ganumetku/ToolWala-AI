import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'rotate-pdf',
    'Rotate PDF Online - Free PDF Rotation Tool | ToolWala AI',
    'Rotate PDF pages online. Free, 100% secure client-side rotation. Turn pages clockwise, counter-clockwise, or flip them upside down instantly.',
    '/tools/rotate-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

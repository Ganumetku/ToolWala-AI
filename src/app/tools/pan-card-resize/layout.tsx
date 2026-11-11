import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pan-card-resize',
    'PAN Card Photo & Signature Resizer – 213x213 px (NSDL & UTIITSL) | ToolWala',
    'Resize photos to mandatory 213x213 pixels (<50KB) and signatures (<30KB) for NSDL and UTIITSL online PAN applications. Instant browser processing with white background.',
    '/tools/pan-card-resize'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

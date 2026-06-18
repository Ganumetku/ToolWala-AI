import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'signature-crop-tool',
    'Signature Crop Tool Online - Resize & Compress Signature | ToolWala AI',
    'Crop, resize, and compress signature scans to official dimensions for recruitment, banking, exam forms (SSC, IBPS), and contracts. Completely client-side.',
    '/tools/signature-crop-tool'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

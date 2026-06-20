import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'signature-resize',
    'Signature Resize & Crop Online - SSC, Bank & Portal Specs | ToolWala AI',
    'Crop, resize, and compress signature scans online. Preconfigured templates for banks (4:1), SSC (6x3 cm), and government forms. Instant local background cleanup.',
    '/tools/signature-resize'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

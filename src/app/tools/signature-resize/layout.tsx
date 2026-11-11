import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'signature-resize',
    'Signature Resizer Online – SSC, Bank PO, UPSC (10KB - 20KB) | ToolWala',
    'Resize and compress signature scans to 10KB-20KB for SSC, UPSC, and IBPS bank recruitment forms. Crisp signature clarity with instant white background cleanup.',
    '/tools/signature-resize'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

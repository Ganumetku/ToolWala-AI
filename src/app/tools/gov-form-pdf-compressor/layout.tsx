import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'gov-form-pdf-compressor',
    'Government Form PDF Compressor Online - EPFO, NSDL, SSC Specs | ToolWala AI',
    'Compress your government application PDF forms and attachments locally in your browser. Choose target limits (100KB, 200KB, 300KB, 500KB) for EPFO, SSC, UPSC, or passport portals. Safe and secure.',
    '/tools/gov-form-pdf-compressor'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

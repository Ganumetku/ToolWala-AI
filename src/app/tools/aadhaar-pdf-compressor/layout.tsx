import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'aadhaar-pdf-compressor',
    'Aadhaar PDF Compressor Online - UIDAI 300KB Limit | ToolWala AI',
    'Compress your e-Aadhaar PDF document online. Optimize file size to fit the official UIDAI portal limit (strictly under 300KB) locally. Safe, private, and 100% in-browser.',
    '/tools/aadhaar-pdf-compressor'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

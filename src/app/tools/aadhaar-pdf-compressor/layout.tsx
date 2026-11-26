import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'aadhaar-pdf-compressor',
    'Compress Aadhaar PDF to 300KB Online – No Upload | ToolWala',
    'Compress e-Aadhaar PDF strictly under 300KB in your browser. The password stays on your device. Ideal for EPFO, recruitment, and bank KYC portal uploads.',
    '/tools/aadhaar-pdf-compressor'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

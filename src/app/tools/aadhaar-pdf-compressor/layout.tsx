import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'aadhaar-pdf-compressor',
    'Compress Aadhaar PDF under 300KB – No Upload',
    'Shrink e-Aadhaar to under 300KB in your browser. The password stays on your device. Built for UIDAI and KYC portals.',
    '/tools/aadhaar-pdf-compressor'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'aadhaar-masking-tool',
    'Aadhaar Masking Tool – Mask Number | ToolWala AI',
    'Mask Aadhaar number online safely with our free Aadhaar masking tool. Hide the first 8 digits of your Aadhaar card for 100% private e-KYC.',
    '/tools/aadhaar-masking-tool'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

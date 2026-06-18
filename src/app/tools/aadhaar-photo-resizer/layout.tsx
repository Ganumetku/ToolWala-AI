import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'aadhaar-photo-resizer',
    'Aadhaar Photo Resizer Online - Standardize & Compress Photos | ToolWala AI',
    'Resize and compress photos for Aadhaar card, UIDAI portals, and government forms. Auto face-crop, background remover, and exact KB size control (20KB, 50KB).',
    '/tools/aadhaar-photo-resizer'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

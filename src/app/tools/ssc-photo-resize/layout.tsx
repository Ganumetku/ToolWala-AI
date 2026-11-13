import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'ssc-photo-resize',
    'SSC Photo Resize – 35×45mm Under 50KB, No Upload',
    'Crop a photo to SSC size (3.5 × 4.5 cm) under 50KB in your browser. Nothing is uploaded to a server.',
    '/tools/ssc-photo-resize'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

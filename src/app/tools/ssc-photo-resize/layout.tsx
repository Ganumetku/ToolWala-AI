import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'ssc-photo-resize',
    'SSC Photo Resizer Online - CGL, CHSL, MTS Dimensions | ToolWala AI',
    'Resize and crop your passport photo to official Staff Selection Commission (SSC) guidelines (3.5 cm x 4.5 cm) under 50KB limit locally. Safe, private, and 100% in-browser.',
    '/tools/ssc-photo-resize'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

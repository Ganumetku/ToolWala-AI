import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'upsc-photo-resize',
    'UPSC Photo Resizer Online - OTR Registration Specs | ToolWala AI',
    'Resize and crop your passport photo to official UPSC Civil Services online application OTR specs (350 x 350 px) under 40KB limit locally. Safe, private, and 100% in-browser.',
    '/tools/upsc-photo-resize'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

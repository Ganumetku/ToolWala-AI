import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pan-card-resize',
    'PAN Card Photo Resize & Crop Online - NSDL & UTIITSL Specs | ToolWala AI',
    'Resize and crop your passport photo to official PAN card specifications (213 x 213 px / 3.5cm x 2.5cm) under 50KB limit locally. Safe, private, and 100% in-browser.',
    '/tools/pan-card-resize'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'image-compressor',
    'Image Compressor – Compress Image Online | ToolWala AI',
    'Free online image compressor and photo compressor. Reduce JPG, PNG, and WebP file sizes by up to 90% in your browser with zero quality loss.',
    '/tools/image-compressor'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

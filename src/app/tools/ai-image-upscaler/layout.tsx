import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'ai-image-upscaler',
    'Free AI Image Upscaler – Enhance Photo Quality Online',
    'Upscale image resolution by 2x, 4x, or 8x locally in your browser. Improve photo sharpness, reduce blur, and enhance quality with 100% privacy.',
    '/tools/ai-image-upscaler'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

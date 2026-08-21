import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'ai-image-describer',
    'AI Image Describer & Scene Analyzer – Photo to Detailed Text',
    'Upload any photo to get instant detailed visual scene descriptions, detected objects, apparel breakdown, SEO alt text, and reverse AI art prompts for free.',
    '/tools/ai-image-describer'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

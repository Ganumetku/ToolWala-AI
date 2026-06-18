import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'caption-generator',
    'Free AI Caption Generator – Viral Social Captions',
    'Generate engaging and highly-optimized social media captions with hashtags. Perfect for Instagram, LinkedIn, YouTube, and X.',
    '/tools/caption-generator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'webp-to-jpg-png-converter',
    'WebP to JPG / PNG Converter – 100% Free & Client-Side',
    'Convert WebP images into high-quality JPG or PNG files instantly. Fast, secure, transparent background management, batch downloads, and 100% browser-based.',
    '/tools/webp-to-jpg-png-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

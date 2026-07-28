import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'png-to-webp',
    'Free PNG to WebP Converter Online – Fast & Secure | ToolWala AI',
    'Convert PNG images to WebP online for free while preserving transparency. Reduce file size by up to 80%. Fast, browser-based PNG to WebP converter with no uploads.',
    '/tools/png-to-webp'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

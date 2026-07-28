import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'jpg-to-webp',
    'Free JPG to WebP Converter Online – Fast & Secure | ToolWala AI',
    'Convert JPG and JPEG images to WebP online for free. Reduce image size while maintaining high quality. Secure, browser-based JPG to WebP converter with no uploads.',
    '/tools/jpg-to-webp'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

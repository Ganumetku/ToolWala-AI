import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'image-compressor',
    'Free Online Image Compressor – Compress PNG & JPG',
    'Reduce image file size without losing quality. Compress PNG, JPG, and WebP images quickly and securely in your browser.',
    '/tools/image-compressor'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

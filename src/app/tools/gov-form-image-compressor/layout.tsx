import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'gov-form-image-compressor',
    'Government Form Image Compressor Online Free | ToolWala AI',
    'Compress images for government forms online. Reduce JPG/PNG image file sizes locally and securely in your browser to meet portal requirements.',
    '/tools/gov-form-image-compressor'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

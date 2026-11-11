import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'image-compressor',
    'Compress Images Online Free – Reduce JPG, PNG & WebP (Custom KB) | ToolWala',
    'Compress JPG, PNG, and WebP images to exact KB targets (20KB, 50KB, 100KB) without losing quality. Ideal for job portals, exams, and fast web loading.',
    '/tools/image-compressor'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

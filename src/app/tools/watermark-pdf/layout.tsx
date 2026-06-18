import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'watermark-pdf',
    'Add Watermark to PDF - Design & Overlay Watermarks Online | ToolWala AI',
    'Add text or image watermarks to PDF files online. Customize size, opacity, rotation, colors, and positioning. 100% browser-side secure processing.',
    '/tools/watermark-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

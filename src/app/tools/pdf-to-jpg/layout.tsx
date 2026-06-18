import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-to-jpg',
    'Convert PDF to JPG Online - 100% Free & Private | ToolWala AI',
    'Convert PDF pages to JPG images in seconds. High-resolution rendering, page selection, quality customization, and ZIP downloads. 100% browser-side processing.',
    '/tools/pdf-to-jpg'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

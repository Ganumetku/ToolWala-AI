import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'crop-pdf',
    'Crop PDF Online - Free PDF Cropper | ToolWala AI',
    'Crop PDF page margins online. Free, 100% secure client-side margins adjustments. Trim visible borders and crop PDF files instantly.',
    '/tools/crop-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

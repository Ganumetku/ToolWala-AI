import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'jpg-to-pdf',
    'Convert JPG to PDF Online - Free Image to PDF | ToolWala AI',
    'Convert JPG, JPEG, and PNG images into a single professional PDF document in seconds. Customize page layout sizes, orientation, margins, and reorder files instantly. 100% secure.',
    '/tools/jpg-to-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

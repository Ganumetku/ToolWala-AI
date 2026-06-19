import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'remove-pages',
    'Remove PDF Pages Online - Free Page Extractor | ToolWala AI',
    'Remove PDF pages online. Free, 100% secure client-side page deletion. Delete blank pages, duplicate layouts, or individual sheets instantly.',
    '/tools/remove-pages'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

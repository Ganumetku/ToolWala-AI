import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'organize-pdf',
    'Organize PDF Pages Online - Reorder, Rotate, & Delete Pages | ToolWala AI',
    'Reorder, delete, rotate, or duplicate pages in your PDF files online. Free, secure, client-side PDF organizer. Drag & drop layout changes.',
    '/tools/organize-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

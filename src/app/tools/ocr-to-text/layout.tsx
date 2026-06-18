import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'ocr-to-text',
    'Free OCR Image to Text Converter – Extract Text Online',
    'Extract text from images, screenshots, and PDFs instantly using secure client-side AI OCR. 100% private, free, and local processing.',
    '/tools/ocr-to-text'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

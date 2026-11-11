import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'jpg-to-pdf',
    'Convert JPG to PDF Online Free – Fast, No Sign-up & Secure | ToolWala',
    'Turn your JPG, PNG, and WebP images into clean, high-quality PDF files in seconds. 100% free with zero file size limits and complete privacy in your browser.',
    '/tools/jpg-to-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

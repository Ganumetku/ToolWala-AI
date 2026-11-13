import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'jpg-to-pdf',
    'JPG to PDF – No Upload, Files Stay on Your Device',
    'Turn JPG, PNG, or WebP images into a PDF in your browser. Nothing is uploaded. No signup, no watermark.',
    '/tools/jpg-to-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

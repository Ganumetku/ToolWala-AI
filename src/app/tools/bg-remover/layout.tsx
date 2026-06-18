import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'bg-remover',
    'Free AI Background Remover – Remove Image BG',
    'Remove background from images online in one click. High-performance, secure, and browser-first AI background removal.',
    '/tools/bg-remover'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'text-humanizer',
    'Free AI Text Humanizer – Bypass AI Detectors',
    'Rewrite AI-generated content to sound natural and human-like. Improve readability and bypass standard AI detectors.',
    '/tools/text-humanizer'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'ai-logo-maker',
    'Free AI Logo Maker – Design Professional Logos',
    'Generate high-quality, professional logo designs instantly. Customize styles, fonts, and colors for your brand identity for free.',
    '/tools/ai-logo-maker'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

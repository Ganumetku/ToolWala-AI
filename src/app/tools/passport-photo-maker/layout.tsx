import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'passport-photo-maker',
    'Passport Photo Maker – 35x45mm Online | ToolWala AI',
    'Create passport size photo online free with our passport photo maker. Formats 35x45mm photos for India 2026 specs with white background.',
    '/tools/passport-photo-maker'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

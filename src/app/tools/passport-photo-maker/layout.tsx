import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'passport-photo-maker',
    'Passport Photo Maker – 35×45mm, No Upload',
    'Make an India passport photo (35×45mm) from a selfie in your browser. White background. Files stay on your phone.',
    '/tools/passport-photo-maker'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

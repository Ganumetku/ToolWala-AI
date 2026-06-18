import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'passport-photo-maker',
    'Free AI Passport Photo Maker – Print-Ready Photos',
    'Convert photos into standard, print-ready passport-size pictures. Automatic background removal and cropping tools.',
    '/tools/passport-photo-maker'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

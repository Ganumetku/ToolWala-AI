import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'voice-generator',
    'Free AI Voice Generator – Text to Realistic Speech',
    'Convert text to high-quality, professional voice and realistic speech. Multiple natural voices for videos and presentations.',
    '/tools/voice-generator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

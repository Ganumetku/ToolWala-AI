import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'text-humanizer',
    'AI Text Humanizer Free Online | ToolWala',
    'Convert robotic AI text into natural, human-sounding writing with conversational tone, improved rhythm, and clarity.',
    '/tools/text-humanizer'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

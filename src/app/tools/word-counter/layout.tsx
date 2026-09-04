import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'word-counter',
    'Word & Character Counter – Count Words Online Free | ToolWala AI',
    'Free online Word Counter and Character Counter. Instantly count words, characters, sentences, paragraphs, and reading time as you type. No sign-up required.',
    '/tools/word-counter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

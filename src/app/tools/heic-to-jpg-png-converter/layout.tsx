import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'heic-to-jpg-png-converter',
    'HEIC to JPG / PNG Converter – Convert Apple Photos Free | ToolWala AI',
    'Free online HEIC to JPG and PNG converter. Convert Apple HEIC / HEIF photos to JPG or PNG format instantly in your browser, in bulk, with no upload required.',
    '/tools/heic-to-jpg-png-converter'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

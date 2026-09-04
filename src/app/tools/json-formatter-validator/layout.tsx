import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'json-formatter-validator',
    'JSON Formatter & Validator – Format and Validate JSON Online | ToolWala AI',
    'Free online JSON Formatter and Validator. Instantly format, beautify, minify, and validate JSON with tree view and syntax highlighting. Works entirely in your browser.',
    '/tools/json-formatter-validator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

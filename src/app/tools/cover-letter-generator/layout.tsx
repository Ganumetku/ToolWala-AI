import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'cover-letter-generator',
    'Free AI Cover Letter Generator – Professional Letters',
    'Create customized, professional cover letters tailored to any job description. Land more interviews with AI-optimized content.',
    '/tools/cover-letter-generator/'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

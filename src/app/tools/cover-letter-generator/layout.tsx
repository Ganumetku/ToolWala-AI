import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'cover-letter-generator',
    'Free Cover Letter Generator – No Signup | ToolWala',
    'Write a cover letter from your details and the job post. Free, no account, ready to copy or download.',
    '/tools/cover-letter-generator/'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

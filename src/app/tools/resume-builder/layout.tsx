import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'resume-builder',
    'Free Resume Builder – AI Resume Maker | ToolWala AI',
    'Free AI resume builder & resume maker. Create ATS-friendly professional resumes online in minutes with instant PDF download and zero signup.',
    '/tools/resume-builder'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

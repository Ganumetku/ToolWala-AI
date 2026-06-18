import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'resume-builder',
    'Free AI Resume Builder – Professional CV Maker',
    'Build ATS-friendly, professional resumes in minutes. Choose elegant templates, optimize sections, and export to PDF.',
    '/tools/resume-builder'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

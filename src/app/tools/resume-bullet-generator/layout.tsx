import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'resume-bullet-generator',
    'Free ATS Resume Bullet Generator – ToolWala AI',
    'Instantly generate ATS-friendly, recruiter-approved resume bullet points. Convert simple responsibilities into quantifiable results with action verbs.',
    '/tools/resume-bullet-generator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

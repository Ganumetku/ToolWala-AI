import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'ats-resume-checker',
    'Free ATS Resume Checker – Optimize Your Resume Online',
    'Audit your resume for compatibility with modern Applicant Tracking Systems (ATS). Detect formatting errors, scan keyword matches against job descriptions, and get actionable suggestions.',
    '/tools/ats-resume-checker'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

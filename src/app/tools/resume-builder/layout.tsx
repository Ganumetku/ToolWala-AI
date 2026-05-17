import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free AI Resume Builder – Professional CV Maker",
  description: "Build ATS-friendly, professional resumes in minutes. Choose elegant templates, optimize sections, and export to PDF.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

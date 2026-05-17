import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free AI Cover Letter Generator – Professional Letters",
  description: "Create customized, professional cover letters tailored to any job description. Land more interviews with AI-optimized content.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

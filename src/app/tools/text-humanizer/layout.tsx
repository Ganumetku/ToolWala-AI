import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free AI Text Humanizer – Bypass AI Detectors",
  description: "Rewrite AI-generated content to sound natural and human-like. Improve readability and bypass standard AI detectors.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

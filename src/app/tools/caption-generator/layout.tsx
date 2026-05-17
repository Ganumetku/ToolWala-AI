import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free AI Caption Generator – Viral Social Captions",
  description: "Generate engaging and highly-optimized social media captions with hashtags. Perfect for Instagram, LinkedIn, YouTube, and X.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

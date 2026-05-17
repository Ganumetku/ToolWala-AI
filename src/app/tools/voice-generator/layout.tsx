import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free AI Voice Generator – Text to Realistic Speech",
  description: "Convert text to high-quality, professional voice and realistic speech. Multiple natural voices for videos and presentations.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

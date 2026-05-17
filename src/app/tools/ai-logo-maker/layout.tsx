import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free AI Logo Maker – Design Professional Logos",
  description: "Generate high-quality, professional logo designs instantly. Customize styles, fonts, and colors for your brand identity for free.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free AI Background Remover – Remove Image BG",
  description: "Remove background from images online in one click. High-performance, secure, and browser-first AI background removal.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

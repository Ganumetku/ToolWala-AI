import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AI Color Palette Generator & Harmonizer | ToolWala",
  description: "Extract color palettes from images, generate complementary color harmonies, lock individual values, and export Tailwind/CSS configurations client-side.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

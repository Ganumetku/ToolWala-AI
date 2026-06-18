import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'color-palette-generator',
    'AI Color Palette Generator & Harmonizer | ToolWala',
    'Extract color palettes from images, generate complementary color harmonies, lock individual values, and export Tailwind/CSS configurations client-side.',
    '/tools/color-palette-generator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

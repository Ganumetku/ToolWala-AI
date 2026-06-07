import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free AI Image Upscaler – Enhance Photo Quality Online",
  description: "Upscale image resolution by 2x, 4x, or 8x locally in your browser. Improve photo sharpness, reduce blur, and enhance quality with 100% privacy.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

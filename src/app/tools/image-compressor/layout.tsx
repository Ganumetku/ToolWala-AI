import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free Online Image Compressor – Compress PNG & JPG",
  description: "Reduce image file size without losing quality. Compress PNG, JPG, and WebP images quickly and securely in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

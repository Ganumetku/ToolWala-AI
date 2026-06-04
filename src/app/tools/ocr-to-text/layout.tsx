import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free OCR Image to Text Converter – Extract Text Online",
  description: "Extract text from images, screenshots, and PDFs instantly using secure client-side AI OCR. 100% private, free, and local processing.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

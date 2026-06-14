import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Word to PDF Converter Online Free | ToolWala AI",
  description: "Convert Word documents (.docx) into PDF files instantly. Free online DOCX to PDF converter with secure browser-based processing.",
  keywords: "Word to PDF, DOCX to PDF, Convert Word to PDF, Free Word Converter, Online PDF Tool, Word Editor, PDF Converter",
  alternates: {
    canonical: "https://toolwala.co/tools/word-to-pdf-converter",
  },
  openGraph: {
    title: "Word to PDF Converter Online Free | ToolWala AI",
    description: "Convert Word documents (.docx) into PDF files instantly. Free online DOCX to PDF converter with secure browser-based processing.",
    type: "website",
    url: "https://toolwala.co/tools/word-to-pdf-converter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word to PDF Converter Online Free | ToolWala AI",
    description: "Convert Word documents (.docx) into PDF files instantly. Free online DOCX to PDF converter with secure browser-based processing.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

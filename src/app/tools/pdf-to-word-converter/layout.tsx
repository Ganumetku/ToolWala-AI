import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "PDF to Word Converter Online Free | ToolWala AI",
  description: "Convert PDF files into editable Word documents instantly. Free online PDF to DOCX converter with secure browser-based processing.",
  keywords: "PDF to Word, PDF to DOCX, Convert PDF to Word, Free PDF Converter, Online PDF Tool, PDF Editor, Word Converter",
  alternates: {
    canonical: "https://toolwala.co/tools/pdf-to-word-converter",
  },
  openGraph: {
    title: "PDF to Word Converter Online Free | ToolWala AI",
    description: "Convert PDF files into editable Word documents instantly. Free online PDF to DOCX converter with secure browser-based processing.",
    type: "website",
    url: "https://toolwala.co/tools/pdf-to-word-converter",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to Word Converter Online Free | ToolWala AI",
    description: "Convert PDF files into editable Word documents instantly. Free online PDF to DOCX converter with secure browser-based processing.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

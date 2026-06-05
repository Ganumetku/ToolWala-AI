import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Split PDF Online - Free PDF Page Extractor | ToolWala AI",
  description: "Split PDF files online in seconds. Extract specific pages or divide documents into custom ranges. Free, 100% secure client-side processing.",
  keywords: ["split pdf", "extract pages pdf", "divide pdf online", "pdf page extractor", "free pdf splitter", "toolwala ai"],
  alternates: {
    canonical: "/tools/split-pdf",
  },
  openGraph: {
    title: "Split PDF Online - Free PDF Page Extractor | ToolWala AI",
    description: "Split PDF files online in seconds. Extract specific pages or divide documents into custom ranges. Free, 100% secure client-side processing.",
    url: "https://toolwala.co/tools/split-pdf",
    type: "website",
  }
};

export default function SplitPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

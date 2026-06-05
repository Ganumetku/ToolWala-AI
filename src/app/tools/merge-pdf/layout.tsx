import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Merge PDF Online - Free PDF Combiner | ToolWala AI",
  description: "Combine multiple PDF documents into a single file online. Free, 100% secure client-side merging. Reorder pages and files instantly.",
  keywords: ["merge pdf", "combine pdf", "join pdf files", "pdf merger online", "free pdf combiner", "toolwala ai"],
  alternates: {
    canonical: "/tools/merge-pdf",
  },
  openGraph: {
    title: "Merge PDF Online - Free PDF Combiner | ToolWala AI",
    description: "Combine multiple PDF documents into a single file online. Free, 100% secure client-side merging. Reorder pages and files instantly.",
    url: "https://toolwala.co/tools/merge-pdf",
    type: "website",
  }
};

export default function MergePdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

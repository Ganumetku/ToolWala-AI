import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Organize PDF Pages Online - Reorder, Rotate, & Delete Pages | ToolWala AI",
  description: "Reorder, delete, rotate, or duplicate pages in your PDF files online. Free, secure, client-side PDF organizer. Drag & drop layout changes.",
  alternates: {
    canonical: "/tools/organize-pdf",
  },
  keywords: [
    "Organize PDF Pages",
    "reorder PDF pages",
    "delete PDF pages",
    "rotate PDF pages",
    "duplicate PDF pages",
    "rearrange PDF sequence",
    "pdf organizer free"
  ],
  openGraph: {
    title: "Organize PDF Pages Online - Reorder, Rotate, & Delete Pages",
    description: "Reorder, delete, rotate, or duplicate pages in your PDF files online. Free, secure, client-side PDF organizer. Drag & drop layout changes.",
    url: "https://toolwala.co/tools/organize-pdf",
    type: "website"
  }
};

export default function OrganizePdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

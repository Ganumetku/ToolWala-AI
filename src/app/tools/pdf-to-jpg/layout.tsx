import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Convert PDF to JPG Online - 100% Free & Private | ToolWala AI",
  description: "Convert PDF pages to JPG images in seconds. High-resolution rendering, page selection, quality customization, and ZIP downloads. 100% browser-side processing.",
  alternates: {
    canonical: "/tools/pdf-to-jpg",
  },
  keywords: [
    "PDF to JPG",
    "convert PDF to image",
    "extract PDF pages",
    "PDF to JPEG converter",
    "PDF to JPG free online",
    "extract images from PDF"
  ],
  openGraph: {
    title: "Convert PDF to JPG Online - 100% Free & Private",
    description: "Convert PDF pages to JPG images in seconds. High-resolution rendering, page selection, quality customization, and ZIP downloads. 100% browser-side processing.",
    url: "https://toolwala.co/tools/pdf-to-jpg",
    type: "website"
  }
};

export default function PdfToJpgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Add Watermark to PDF - Design & Overlay Watermarks Online | ToolWala AI",
  description: "Add text or image watermarks to PDF files online. Customize size, opacity, rotation, colors, and positioning. 100% browser-side secure processing.",
  alternates: {
    canonical: "/tools/watermark-pdf",
  },
  keywords: [
    "Add Watermark to PDF",
    "stamping PDF online",
    "watermark PDF document",
    "add logo to PDF",
    "overlay text on PDF",
    "confidential stamp PDF"
  ],
  openGraph: {
    title: "Add Watermark to PDF - Design & Overlay Watermarks Online",
    description: "Add text or image watermarks to PDF files online. Customize size, opacity, rotation, colors, and positioning. 100% browser-side secure processing.",
    url: "https://toolwala.co/tools/watermark-pdf",
    type: "website"
  }
};

export default function WatermarkPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

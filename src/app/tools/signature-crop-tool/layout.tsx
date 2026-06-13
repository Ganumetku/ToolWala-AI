import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Signature Crop Tool Online - Resize & Compress Signature | ToolWala AI",
  description: "Crop, resize, and compress signature scans to official dimensions for recruitment, banking, exam forms (SSC, IBPS), and contracts. Completely client-side.",
  alternates: {
    canonical: "/tools/signature-crop-tool",
  },
  keywords: [
    "Signature Crop Tool",
    "online signature resizer",
    "crop signature for ssc",
    "compress signature size",
    "banking signature resize",
    "free signature editor"
  ],
  openGraph: {
    title: "Signature Crop Tool Online - Resize & Compress Signature",
    description: "Crop, resize, and compress signature scans to official dimensions for recruitment, banking, exam forms (SSC, IBPS), and contracts. Completely client-side.",
    url: "https://toolwala.co/tools/signature-crop-tool",
    type: "website"
  }
};

export default function SignatureCropLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

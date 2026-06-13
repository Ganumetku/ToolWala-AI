import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "PAN Photo Tool Online - Resize Photo for PAN card | ToolWala AI",
  description: "Resize and format passport photos to official NSDL and UTIITSL PAN card requirements (213 x 213 px, under 50KB). Real-time cropping with background removal.",
  alternates: {
    canonical: "/tools/pan-photo-tool",
  },
  keywords: [
    "PAN Photo Tool",
    "NSDL photo size resizer",
    "UTIITSL photo resizer",
    "crop photo for PAN card",
    "PAN card photo converter",
    "compress photo to 50KB"
  ],
  openGraph: {
    title: "PAN Photo Tool Online - Resize Photo for PAN card",
    description: "Resize and format passport photos to official NSDL and UTIITSL PAN card requirements (213 x 213 px, under 50KB). Real-time cropping with background removal.",
    url: "https://toolwala.co/tools/pan-photo-tool",
    type: "website"
  }
};

export default function PANPhotoToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

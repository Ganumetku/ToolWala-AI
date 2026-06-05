import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Aadhaar Photo Resizer Online - Standardize & Compress Photos | ToolWala AI",
  description: "Resize and compress photos for Aadhaar card, UIDAI portals, and government forms. Auto face-crop, background remover, and exact KB size control (20KB, 50KB).",
  alternates: {
    canonical: "/tools/aadhaar-photo-resizer",
  },
  keywords: [
    "Aadhaar Photo Resizer",
    "UIDAI photo size online",
    "crop photo for Aadhaar card",
    "compress photo to 50KB",
    "compress photo to 20KB",
    "passport photo resizer India",
    "government form photo resizer",
    "free online kyc photo resizer"
  ],
  openGraph: {
    title: "Aadhaar Photo Resizer Online - Standardize & Compress Photos",
    description: "Resize and compress photos for Aadhaar card, UIDAI portals, and government forms. Auto face-crop, background remover, and exact KB size control (20KB, 50KB).",
    url: "https://toolwala.co/tools/aadhaar-photo-resizer",
    type: "website"
  }
};

export default function AadhaarPhotoResizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

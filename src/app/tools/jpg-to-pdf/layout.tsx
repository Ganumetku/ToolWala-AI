import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Convert JPG to PDF Online - Free Image to PDF | ToolWala AI",
  description: "Convert JPG, JPEG, and PNG images into a single professional PDF document in seconds. Customize page layout sizes, orientation, margins, and reorder files instantly. 100% secure.",
  keywords: ["convert jpg to pdf", "image to pdf converter", "png to pdf online", "free jpeg to pdf", "combine photos to pdf", "toolwala ai"],
  alternates: {
    canonical: "/tools/jpg-to-pdf",
  },
  openGraph: {
    title: "Convert JPG to PDF Online - Free Image to PDF | ToolWala AI",
    description: "Convert JPG, JPEG, and PNG images into a single professional PDF document in seconds. Customize page layout sizes, orientation, margins, and reorder files instantly. 100% secure.",
    url: "https://toolwala.co/tools/jpg-to-pdf",
    type: "website",
  }
};

export default function JpgToPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

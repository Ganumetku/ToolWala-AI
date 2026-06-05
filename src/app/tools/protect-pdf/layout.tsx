import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Protect PDF Online - Password Protect & Encrypt PDF | ToolWala AI",
  description: "Add secure user password protection to your PDF files online. Keep sensitive documents confidential with client-side local encryption. 100% free and private.",
  alternates: {
    canonical: "/tools/protect-pdf",
  },
  keywords: [
    "Protect PDF",
    "password protect PDF",
    "encrypt PDF online",
    "PDF security lock",
    "confidential PDF protection",
    "PDF file locker"
  ],
  openGraph: {
    title: "Protect PDF Online - Password Protect & Encrypt PDF",
    description: "Add secure user password protection to your PDF files online. Keep sensitive documents confidential with client-side local encryption. 100% free and private.",
    url: "https://toolwala.co/tools/protect-pdf",
    type: "website"
  }
};

export default function ProtectPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Unlock PDF Online - Remove Password Protection from PDF | ToolWala AI",
  description: "Remove password protection and unlock encrypted PDF files online instantly. Fully client-side secure decryption. 100% free, private, and easy to use.",
  alternates: {
    canonical: "/tools/unlock-pdf",
  },
  keywords: [
    "Unlock PDF",
    "remove password from PDF",
    "decrypt PDF online",
    "PDF password remover",
    "free PDF decrypter",
    "strip PDF password"
  ],
  openGraph: {
    title: "Unlock PDF Online - Remove Password Protection from PDF",
    description: "Remove password protection and unlock encrypted PDF files online instantly. Fully client-side secure decryption. 100% free, private, and easy to use.",
    url: "https://toolwala.co/tools/unlock-pdf",
    type: "website"
  }
};

export default function UnlockPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

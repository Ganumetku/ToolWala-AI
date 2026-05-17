import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free Online PDF Tools – Edit, Merge & Convert PDFs",
  description: "Powerful suite of PDF utilities. Merge, split, compress, and edit PDF documents securely directly in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

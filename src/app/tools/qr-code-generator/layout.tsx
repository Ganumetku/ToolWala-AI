import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free AI QR Code Generator – Custom Designed QRs",
  description: "Generate stylized, custom-branded QR codes with logos and frames. Perfect for websites, WiFi, VCards, and business cards.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

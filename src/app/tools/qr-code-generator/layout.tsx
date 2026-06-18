import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'qr-code-generator',
    'Free AI QR Code Generator – Custom Designed QRs',
    'Generate stylized, custom-branded QR codes with logos and frames. Perfect for websites, WiFi, VCards, and business cards.',
    '/tools/qr-code-generator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

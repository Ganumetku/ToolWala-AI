import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'aadhaar-photo-resize',
    'Aadhaar Card Photo Resize Online Free | ToolWala AI',
    'Resize Aadhaar card photos online. Format photo to official UIDAI dimensions and specifications locally and securely in your browser.',
    '/tools/aadhaar-photo-resize'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

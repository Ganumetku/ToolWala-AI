import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pan-photo-tool',
    'PAN Photo Tool - Resize, Crop & Format Passport Photos Online | ToolWala AI',
    'Resize, crop, and format passport photos to official NSDL and UTIITSL PAN card specifications. Keep head spacing, check background rules, and stay under the 50KB limit.',
    '/tools/pan-photo-tool'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

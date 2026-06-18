import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pan-photo-tool',
    'PAN Photo Tool Online - Resize Photo for PAN card | ToolWala AI',
    'Resize and format passport photos to official NSDL and UTIITSL PAN card requirements (213 x 213 px, under 50KB). Real-time cropping with background removal.',
    '/tools/pan-photo-tool'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

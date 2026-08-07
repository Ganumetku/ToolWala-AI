import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'ai-logo-maker',
    'AI Logo Maker – Free Logo Generator | ToolWala AI',
    'Create custom logos with our AI logo maker. Free logo maker online generates vector SVG & high-res PNG logos for your business instantly.',
    '/tools/ai-logo-maker'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

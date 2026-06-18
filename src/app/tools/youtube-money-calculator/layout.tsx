import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'youtube-money-calculator',
    'Free YouTube Money Calculator Online - ToolWala AI',
    'Estimate YouTube earnings from views, CPM, RPM, niche and monthly traffic with free YouTube Money Calculator.',
    '/tools/youtube-money-calculator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

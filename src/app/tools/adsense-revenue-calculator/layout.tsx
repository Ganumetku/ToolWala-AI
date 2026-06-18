import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'adsense-revenue-calculator',
    'Free AdSense Revenue Calculator Online - ToolWala AI',
    'Estimate Google AdSense earnings from page views, CTR, CPC, RPM, country and niche with our free AdSense Revenue Calculator.',
    '/tools/adsense-revenue-calculator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AdSense Revenue Calculator Online - ToolWala AI',
  description: 'Estimate Google AdSense earnings from page views, CTR, CPC, RPM, country and niche with our free AdSense Revenue Calculator.',
  keywords: ['adsense calculator', 'adsense revenue calculator', 'google adsense earnings', 'cpc calculator', 'ctr calculator', 'website revenue estimator', 'toolwala ai'],
  openGraph: {
    title: 'Free AdSense Revenue Calculator Online - ToolWala AI',
    description: 'Estimate Google AdSense earnings from page views, CTR, CPC, RPM, country and niche.',
  },
};

export default function AdSenseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

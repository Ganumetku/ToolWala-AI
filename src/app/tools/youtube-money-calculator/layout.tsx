import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free YouTube Money Calculator Online - ToolWala AI',
  description: 'Estimate YouTube earnings from views, CPM, RPM, niche and monthly traffic with free YouTube Money Calculator.',
  keywords: ['youtube money calculator', 'youtube earnings calculator', 'youtube cpm calculator', 'youtube rpm', 'youtube revenue estimator', 'toolwala ai'],
  openGraph: {
    title: 'Free YouTube Money Calculator Online - ToolWala AI',
    description: 'Estimate YouTube earnings from views, CPM, RPM, niche and monthly traffic with free YouTube Money Calculator.',
  }
};

export default function YoutubeMoneyCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

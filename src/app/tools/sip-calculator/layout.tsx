import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'sip-calculator',
    'Free SIP Calculator Online - ToolWala AI',
    'Calculate SIP returns, future value, total investment and estimated wealth instantly.',
    '/tools/sip-calculator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

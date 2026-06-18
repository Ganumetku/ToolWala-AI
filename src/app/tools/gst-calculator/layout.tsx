import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'gst-calculator',
    'Free GST Calculator Online - ToolWala AI',
    'Calculate GST amount, total price, and reverse GST instantly with free GST Calculator.',
    '/tools/gst-calculator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

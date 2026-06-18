import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'age-calculator',
    'Free Age Calculator Online - ToolWala AI',
    'Calculate your exact age in years, months, days, total weeks and next birthday instantly with ToolWala AI.',
    '/tools/age-calculator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

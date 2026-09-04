import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'emi-calculator',
    'EMI Calculator – Calculate Loan EMI Online Free | ToolWala AI',
    'Free online EMI Calculator. Calculate monthly loan EMI, total interest payable, and full amortization schedule for home, car, or personal loans.',
    '/tools/emi-calculator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

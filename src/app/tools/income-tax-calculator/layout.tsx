import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'income-tax-calculator',
    'Income Tax Calculator India FY 2026-27 – New vs Old Regime | ToolWala AI',
    'Free India Income Tax Calculator for FY 2026-27. Compare New Tax Regime vs Old Tax Regime slabs, compute your tax liability, and find the best option instantly.',
    '/tools/income-tax-calculator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

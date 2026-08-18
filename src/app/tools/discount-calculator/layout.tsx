import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'discount-calculator',
    'Free Online Discount Calculator – Calculate Sale Price & Savings',
    'Calculate sale price, discount amount, double successive discounts, and GST tax instantly. 100% free and private client-side discount calculator.',
    '/tools/discount-calculator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

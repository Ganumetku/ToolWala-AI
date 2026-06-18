import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'invoice-generator',
    'Free Professional Invoice Generator – Easy Invoices',
    'Create and download professional invoices in seconds. Clean layout, customizable fields, and instant PDF download.',
    '/tools/invoice-generator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

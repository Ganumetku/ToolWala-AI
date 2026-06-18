import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'invoice-cropper',
    'Invoice Cropper Online - Crop & Scan Invoices & Receipts | ToolWala AI',
    'Crop and scan invoice images or PDFs online. Automatically detect document edges, remove unwanted margins, clean backgrounds, and export to JPG, PNG, or PDF locally.',
    '/tools/invoice-cropper'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

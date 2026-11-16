import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'merge-id-front-and-back',
    'Merge ID Card Front and Back Online Free – Join 2 Sides on 1 Page | ToolWala',
    'Combine front and back photos of your Aadhaar, Voter ID, Driver License, or PAN card onto a single A4 or 4x6 page for printing. 100% free and private in your browser.',
    '/tools/merge-id-front-and-back/'
  );
}

export default function MergeIdFrontAndBackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

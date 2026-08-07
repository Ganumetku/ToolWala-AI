import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'bg-remover',
    'Background Remover – Remove BG Online | ToolWala AI',
    'Free background remover tool online. Remove image background instantly in your browser without uploads or signups. Privacy-first & 100% free.',
    '/tools/bg-remover'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

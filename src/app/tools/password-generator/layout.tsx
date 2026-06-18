import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'password-generator',
    'Free Password Generator – Secure Random Password Creator | ToolWala AI',
    'Generate strong secure random passwords instantly with ToolWala AI Password Generator. Fully private, client-side, fast and free.',
    '/tools/password-generator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

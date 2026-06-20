import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'sign-pdf',
    'Sign PDF Online – Free Electronic Signature Tool',
    'Sign PDF documents online locally and securely. Draw, type, or upload your signature to place on contract pages inside your browser.',
    '/tools/sign-pdf'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

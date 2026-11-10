import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';
import './edit-pdf-fonts.css';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'edit-pdf',
    'Edit PDF Online – Free Browser PDF Editor | ToolWala AI',
    'Edit PDF online free without signups. Add text to PDF free, insert signatures, draw, and annotate documents securely inside your browser.',
    '/tools/edit-pdf/'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

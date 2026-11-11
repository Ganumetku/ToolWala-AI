import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'exam-photo-resizer',
    'Exam Photo & Signature Resizer – SSC, UPSC, IBPS (20KB - 50KB) | ToolWala',
    'Resize and crop passport photos and signatures to exact official dimensions and file sizes (20KB to 50KB) for SSC CGL, UPSC, IBPS, and state PSC application portals.',
    '/tools/exam-photo-resizer'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

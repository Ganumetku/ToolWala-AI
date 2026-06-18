import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'exam-photo-resizer',
    'Exam Photo Resizer Online - Resize Photo for SSC, IBPS, NEET | ToolWala AI',
    'Resize passport photos for competitive exam portals including SSC, UPSC, IBPS, NEET, and JEE. Auto alignment, head framing checks, and exact KB size targets (20KB - 50KB).',
    '/tools/exam-photo-resizer'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

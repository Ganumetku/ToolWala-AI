import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'exam-photo-resizer',
    'Exam Photo Resizer - Resize & Format Passport Photos Online | ToolWala AI',
    'Resize and format passport photos to official guidelines for various exam portals like SSC, UPSC, and IBPS banking exams. Automatically center faces, replace backgrounds, and compress securely.',
    '/tools/exam-photo-resizer'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

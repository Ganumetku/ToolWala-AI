import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'video-compressor',
    'Video Compressor – Compress MP4 & MOV Online Free | ToolWala AI',
    'Free online video compressor. Compress MP4, MOV, and WebM videos directly in your browser without uploading to any server. Reduce video file size while keeping quality.',
    '/tools/video-compressor'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

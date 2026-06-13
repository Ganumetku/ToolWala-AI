import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Exam Photo Resizer Online - Resize Photo for SSC, IBPS, NEET | ToolWala AI",
  description: "Resize passport photos for competitive exam portals including SSC, UPSC, IBPS, NEET, and JEE. Auto alignment, head framing checks, and exact KB size targets (20KB - 50KB).",
  alternates: {
    canonical: "/tools/exam-photo-resizer",
  },
  keywords: [
    "Exam Photo Resizer",
    "SSC photo resizer online",
    "IBPS photo crop size",
    "NEET photo resizer tool",
    "JEE mains photo compressor",
    "government form photo resize"
  ],
  openGraph: {
    title: "Exam Photo Resizer Online - Resize Photo for SSC, IBPS, NEET",
    description: "Resize passport photos for competitive exam portals including SSC, UPSC, IBPS, NEET, and JEE. Auto alignment, head framing checks, and exact KB size targets (20KB - 50KB).",
    url: "https://toolwala.co/tools/exam-photo-resizer",
    type: "website"
  }
};

export default function ExamPhotoResizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

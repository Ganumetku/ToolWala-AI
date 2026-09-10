import type { Metadata } from 'next';
import { generateToolMetadataHelper, buildFAQSchema } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'pdf-compare',
    'Compare Two PDF Files Online Free | PDF Diff Checker | ToolWala AI',
    'Compare two PDF files online free. Instant browser-based text diff checker highlights additions, deletions, and differences side-by-side with zero file uploads and 100% privacy.',
    '/tools/pdf-compare'
  );
}

const faqs = [
  {
    question: 'How do I compare two PDF files for differences?',
    answer:
      'Upload your baseline PDF (Document A) and modified PDF (Document B) into the dual upload zones, then click Compare Documents. The tool processes both files locally in your browser and highlights all additions in green, deletions in red, and unchanged text in gray.',
  },
  {
    question: 'Can I compare scanned PDFs?',
    answer:
      'Scanned or image-only PDFs do not have selectable text layers. If a scanned document is detected, the tool displays a warning. You can first run the scanned file through our free PDF OCR Scanner tool to extract selectable text before comparing.',
  },
  {
    question: 'Is my document data safe?',
    answer:
      'Yes, 100%. ToolWala AI operates under a strict Zero-Upload Privacy architecture. Both documents are processed directly in your web browser memory. No data, text, or files are ever transmitted to any external server.',
  },
  {
    question: 'Does this work with password-protected PDFs?',
    answer:
      'Password-encrypted PDFs must be decrypted before parsing. If an encrypted file is uploaded, the tool displays an alert guiding you to our free Unlock PDF tool to remove the password before comparing.',
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqSchema = buildFAQSchema(faqs);

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {children}
    </>
  );
}

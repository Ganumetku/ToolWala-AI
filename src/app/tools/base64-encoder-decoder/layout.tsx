import type { Metadata } from 'next';
import { 
  generateToolMetadataHelper, 
  buildFAQSchema, 
  buildBreadcrumbJsonLd, 
  buildWebPageSchema, 
  buildEnrichedToolJsonLd 
} from '@/lib/seo';
import { headers } from 'next/headers';
import { getLocalizedCanonicalUrl } from '@/lib/seo-client';

const FALLBACK_TITLE = "Base64 & URL Encoder Decoder Online Free | ToolWala AI";
const FALLBACK_DESC = "Free, instant, browser-based Base64 and URL encoder-decoder. Safe for developers with zero server uploads. Encode or decode text, strings, and URLs with complete UTF-8 Unicode support.";
const TOOL_PATH = "/tools/base64-encoder-decoder/";

const FAQS = [
  {
    question: "What is Base64 encoding used for?",
    answer: "Base64 is a binary-to-text encoding scheme that translates binary data into an ASCII string format using 64 printable characters (A-Z, a-z, 0-9, +, /). It is commonly used to safely transmit binary data through media designed for text, such as embedding images in HTML/CSS, sending email attachments (MIME), or passing authorization tokens."
  },
  {
    question: "Is URL encoding the same as Base64?",
    answer: "No. URL encoding (also known as percent-encoding) replaces unsafe or reserved ASCII characters with a '%' followed by their two-digit hexadecimal representation (e.g., a space becomes '%20'). It ensures URLs conform to the URI standard. Base64, by contrast, encodes entire strings or binary blobs into a uniform 6-bit representation."
  },
  {
    question: "Is my data safe when I use this tool?",
    answer: "Yes, 100%. All Base64 and URL encoding and decoding operations happen locally inside your web browser using client-side JavaScript APIs (TextEncoder, TextDecoder, btoa, atob, encodeURIComponent). No text or files are ever sent to our servers or stored anywhere."
  },
  {
    question: "Does this Base64 tool support emojis and non-English text (UTF-8)?",
    answer: "Yes! Unlike traditional web tools that throw 'InvalidCharacterError' on characters outside the Latin1 range, ToolWala AI uses a UTF-8 safe TextEncoder/TextDecoder wrapper, correctly preserving Hindi, Arabic, Japanese, accents, and emojis."
  }
];

export async function generateMetadata(): Promise<Metadata> {
  const baseMeta = await generateToolMetadataHelper(
    'base64-encoder-decoder',
    FALLBACK_TITLE,
    FALLBACK_DESC,
    TOOL_PATH
  );

  return {
    ...baseMeta,
    keywords: [
      'base64 encode decode online',
      'url encoder decoder',
      'percent encoding tool',
      'base64 to text converter',
      'url decoder online',
      'base64 decoder',
      'developer tools'
    ]
  };
}

export default async function Base64UrlEncoderDecoderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let locale = 'en';
  try {
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {
    // fallback
  }

  const toolUrl = getLocalizedCanonicalUrl(TOOL_PATH, locale);
  const breadcrumbItems = [
    { name: locale === 'hi' ? 'मुख्यपृष्ठ' : 'Home', href: locale === 'en' ? '/' : `/${locale}/` },
    { name: locale === 'hi' ? 'टूल्स' : 'Tools', href: locale === 'en' ? '/tools/' : `/${locale}/tools/` },
    { name: 'Base64 & URL Encoder-Decoder', href: locale === 'en' ? TOOL_PATH : `/${locale}${TOOL_PATH}` }
  ];

  const mockTool = {
    title: 'Base64 & URL Encoder-Decoder',
    description: FALLBACK_DESC,
    faqs: FAQS
  };

  const graph: any[] = [
    buildEnrichedToolJsonLd(mockTool, toolUrl, 'Developer Tools'),
    buildWebPageSchema(mockTool.title, mockTool.description, toolUrl, locale),
    buildBreadcrumbJsonLd(breadcrumbItems)
  ];

  const faqSchema = buildFAQSchema(FAQS);
  if (faqSchema) {
    graph.push(faqSchema);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}

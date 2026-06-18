import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Pricing & Plans | ToolWala AI";
  let description = "ToolWala AI is currently in free beta. Access all AI tools for free during our early access period.";

  if (locale === 'hi') {
    title = "मूल्य निर्धारण और योजनाएं | टूलवाला AI";
    description = "टूलवाला AI वर्तमान में मुफ्त बीटा में है। हमारे शुरुआती एक्सेस अवधि के दौरान सभी एआई टूल्स का मुफ्त में उपयोग करें।";
  }

  return {
    title,
    description
  };
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

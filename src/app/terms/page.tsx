import { Metadata } from 'next';
import TermsClient from './TermsClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Terms of Service | ToolWala AI";
  let description = "Terms and conditions for using ToolWala AI professional services, outlining usage rules and intellectual property rights.";

  if (locale === 'hi') {
    title = "सेवा की शर्तें | टूलवाला AI";
    description = "टूलवाला AI व्यावसायिक सेवाओं के उपयोग के लिए नियम और शर्तें, उपयोग के नियमों और बौद्धिक संपदा अधिकारों को रेखांकित करती हैं।";
  }

  return {
    title,
    description,
  };
}

export default function TermsPage() {
  return <TermsClient />;
}


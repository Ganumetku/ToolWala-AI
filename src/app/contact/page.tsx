import { Metadata } from 'next';
import ContactClient from './ContactClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Contact Us | ToolWala AI";
  let description = "Get in touch with the ToolWala AI team for support, business inquiries, or legal matters.";

  if (locale === 'hi') {
    title = "हमसे संपर्क करें | टूलवाला AI";
    description = "सहायता, व्यावसायिक पूछताछ या कानूनी मामलों के लिए टूलवाला AI टीम से संपर्क करें।";
  }

  return {
    title,
    description,
  };
}

export default function ContactPage() {
  return <ContactClient />;
}

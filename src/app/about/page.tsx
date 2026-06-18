import { Metadata } from 'next';
import AboutClient from './AboutClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "About Our Mission | ToolWala AI";
  let description = "Learn more about ToolWala AI and our mission to build powerful AI utility tools.";

  if (locale === 'hi') {
    title = "हमारा मिशन | टूलवाला AI";
    description = "टूलवाला AI और शक्तिशाली एआई उपयोगिता उपकरण बनाने के हमारे मिशन के बारे में अधिक जानें।";
  }

  return {
    title,
    description,
  };
}

export default function AboutPage() {
  return <AboutClient />;
}

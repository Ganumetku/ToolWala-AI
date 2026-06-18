import { Metadata } from 'next';
import DisclaimerClient from './DisclaimerClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Disclaimer | ToolWala AI";
  let description = "Legal disclaimer regarding AI accuracy, tool usage, and service limitations of the ToolWala AI platform.";

  if (locale === 'hi') {
    title = "अस्वीकरण | टूलवाला AI";
    description = "टूलवाला AI प्लेटफॉर्म की एआई सटीकता, टूल उपयोग और सेवा सीमाओं के संबंध में कानूनी अस्वीकरण।";
  }

  return {
    title,
    description,
  };
}

export default function DisclaimerPage() {
  return <DisclaimerClient />;
}


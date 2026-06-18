import { Metadata } from 'next';
import PrivacyPolicyClient from './PrivacyPolicyClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Privacy Policy | ToolWala AI";
  let description = "Learn how ToolWala AI protects your privacy and handles your data with browser-first technology and secure processing.";

  if (locale === 'hi') {
    title = "गोपनीयता नीति | टूलवाला AI";
    description = "जानें कि टूलवाला AI आपकी गोपनीयता की रक्षा कैसे करता है और ब्राउज़र-प्रथम तकनीक और सुरक्षित प्रसंस्करण के साथ आपके डेटा को कैसे संभालता है।";
  }

  return {
    title,
    description,
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}

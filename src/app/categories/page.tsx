import { Metadata } from 'next';
import CategoriesIndexClient from './CategoriesIndexClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Browse All Categories - 25+ local AI Utilities | ToolWala AI";
  let description = "Browse categorized directories of 25+ browser-local design, PDF, AI, document, resume, and developer tools. Fast, secure, and GDPR compliant.";
  let ogDescription = "Secure browser-local AI utilities. Browse categorized directories for fast document processing, image optimization, and content creations.";

  if (locale === 'hi') {
    title = "सभी श्रेणियां ब्राउज़ करें - 25+ स्थानीय एआई टूल्स | टूलवाला AI";
    description = "25+ ब्राउज़र-स्थानीय डिज़ाइन, पीडीएफ, एआई, दस्तावेज़, रिज्यूमे और डेवलपर टूल की वर्गीकृत निर्देशिकाएं ब्राउज़ करें। तेज़, सुरक्षित और जीडीपीआर अनुपालन।";
    ogDescription = "सुरक्षित ब्राउज़र-स्थानीय एआई उपयोगिताएँ। तेज़ दस्तावेज़ प्रसंस्करण, छवि अनुकूलन और सामग्री निर्माण के लिए वर्गीकृत निर्देशिकाएं ब्राउज़ करें।";
  }

  return {
    title,
    description,
    keywords: "tool categories, pdf tools, image tools, ai tools, document tools, resume tools, developer tools, social media tools",
    alternates: {
      canonical: "https://toolwala.co/categories",
    },
    openGraph: {
      title,
      description: ogDescription,
      url: "https://toolwala.co/categories",
      type: "website"
    }
  };
}

export default function CategoriesIndexPage() {
  return <CategoriesIndexClient />;
}
